import Anthropic from "@anthropic-ai/sdk";
import prisma from "../utils/prisma.js";

const client = new Anthropic(); // lê ANTHROPIC_API_KEY do .env

const SYSTEM = `Você é o assistente de um mestre de RPG de mesa na plataforma Read the Rules.
Responda em português, de forma direta e útil para usar na mesa.
Baseie-se nos materiais da campanha abaixo. Quando citar uma regra, diga de qual documento ou nota ela veio.
Se a resposta não estiver nos materiais, diga isso e então dê uma sugestão própria, deixando claro que é uma sugestão.`;

// Junta todo o material da campanha em texto.
// shortcut: manda tudo no prompt (cabe com folga no contexto de 1M); trocar por busca com embeddings/pgvector se as campanhas ficarem gigantes.
const materialDaCampanha = async (id_campanha: string) => {
    const c = await prisma.campanha.findUnique({
        where: { id_campanha },
        include: {
            Nota: true, Sessao: true, Personagem: true, Item: true, Local: true,
            Criatura: true, Deus: true, Alianca: true, Conceito: true, DocumentoExterno: true,
        },
    });
    if (!c) throw new Error("Campanha não encontrada");

    const lista = (titulo: string, itens: { nome?: string | null; titulo?: string | null; descricao?: string | null }[]) =>
        itens.length ? `## ${titulo}\n` + itens.map((i) => `- ${i.nome ?? i.titulo}: ${i.descricao ?? ""}`).join("\n") : "";

    return [
        `# Campanha: ${c.titulo}\n${c.descricao ?? ""}`,
        c.Sessao.length ? "## Sessões\n" + c.Sessao.map((s) => `- ${s.titulo ?? "Sessão"} (${s.status}): ${s.resumo ?? ""}`).join("\n") : "",
        c.Nota.length ? "## Notas\n" + c.Nota.map((n) => `### ${n.titulo} [${n.categoria}]\n${n.corpo}`).join("\n\n") : "",
        lista("Personagens", c.Personagem),
        lista("Itens", c.Item),
        lista("Locais", c.Local),
        lista("Criaturas", c.Criatura),
        lista("Deuses", c.Deus),
        lista("Alianças", c.Alianca),
        lista("Conceitos", c.Conceito),
        ...c.DocumentoExterno.map((d) => `## Documento: ${d.nome}\n${d.conteudo}`),
    ].filter(Boolean).join("\n\n");
};

export const perguntarIA = async (id_campanha: string, id_usuario: string, pergunta: string, tipo = "pergunta") => {
    if (!pergunta?.trim()) throw new Error("Informe a pergunta");

    const response = await client.beta.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 16000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: [
            { type: "text", text: SYSTEM },
            // Material da campanha em cache: perguntas seguidas na mesma campanha saem mais baratas e rápidas.
            { type: "text", text: await materialDaCampanha(id_campanha), cache_control: { type: "ephemeral" } },
        ],
        messages: [{ role: "user", content: pergunta }],
    });

    if (response.stop_reason === "refusal") throw new Error("A IA não pôde responder essa pergunta");
    const resposta = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n");

    return prisma.historicoIA.create({
        data: { id_campanha, id_usuario, pergunta, resposta, tipo: tipo.slice(0, 15) },
    });
};

export const listHistoricoIA = async (id_campanha: string) => {
    return prisma.historicoIA.findMany({ where: { id_campanha }, orderBy: { dt_consulta: "desc" } });
};
