import Anthropic from "@anthropic-ai/sdk";
import prisma from "../utils/prisma.js";
import { IA_BASE, temEmbeddings, trechosRelacionados } from "./embedding.service.js";

const SYSTEM = `Você é o assistente de um mestre de RPG de mesa na plataforma Read the Rules.
Responda em português, de forma direta e útil para usar na mesa.
Baseie-se nos materiais da campanha abaixo. Quando citar uma regra, diga de qual documento ou nota ela veio.
Se a resposta não estiver nos materiais, diga isso e então dê uma sugestão própria, deixando claro que é uma sugestão.`;

// Acima disso (~25 mil tokens) os documentos não vão inteiros: só os trechos mais relevantes (RAG).
const LIMITE_DOCS = 100_000;

// Junta o material da campanha em texto. Notas e worldbuilding vão inteiros; documentos grandes viram trechos.
const materialDaCampanha = async (id_campanha: string, pergunta: string) => {
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
        await documentos(id_campanha, c.DocumentoExterno, pergunta),
    ].filter(Boolean).join("\n\n");
};

const documentos = async (id_campanha: string, docs: { nome: string; conteudo: string }[], pergunta: string) => {
    const inteiros = docs.map((d) => `## Documento: ${d.nome}\n${d.conteudo}`).join("\n\n");
    if (!temEmbeddings() || inteiros.length <= LIMITE_DOCS) return inteiros;
    try {
        const trechos = await trechosRelacionados(id_campanha, pergunta, 12);
        return "## Trechos dos documentos mais relevantes para a pergunta\n" + trechos.map((t) => `### ${t.nome}\n${t.trecho}`).join("\n\n");
    } catch {
        return inteiros; // embeddings fora do ar: manda tudo, como antes
    }
};

export const perguntarIA = async (id_campanha: string, id_usuario: string, pergunta: string, tipo = "pergunta") => {
    if (!pergunta?.trim()) throw new Error("Informe a pergunta");

    const material = await materialDaCampanha(id_campanha, pergunta);
    const resposta = process.env.IA_API_KEY ? await openaiCompat(material, pergunta) : await claude(material, pergunta);

    return prisma.historicoIA.create({
        data: { id_campanha, id_usuario, pergunta, resposta, tipo: tipo.slice(0, 15) },
    });
};

export const listHistoricoIA = async (id_campanha: string) => {
    return prisma.historicoIA.findMany({ where: { id_campanha }, orderBy: { dt_consulta: "desc" } });
};

// Provedor gratuito: qualquer API compatível com OpenAI (padrão: Google Gemini free tier).
// Basta IA_API_KEY no .env; IA_BASE_URL e IA_MODEL trocam o provedor (Groq, OpenRouter, Ollama...).
const openaiCompat = async (material: string, pergunta: string) => {
    const res = await fetch(`${IA_BASE()}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.IA_API_KEY}` },
        body: JSON.stringify({
            model: process.env.IA_MODEL ?? "gemini-2.5-flash",
            messages: [
                { role: "system", content: `${SYSTEM}\n\n${material}` },
                { role: "user", content: pergunta },
            ],
        }),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(`Erro na IA: ${data.error?.message ?? data[0]?.error?.message ?? res.status}`);
    return data.choices[0].message.content as string;
};

// Provedor pago: Claude (usado quando IA_API_KEY não está definida).
const claude = async (material: string, pergunta: string) => {
    const response = await new Anthropic().beta.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 16000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: [
            { type: "text", text: SYSTEM },
            // Material da campanha em cache: perguntas seguidas na mesma campanha saem mais baratas e rápidas.
            { type: "text", text: material, cache_control: { type: "ephemeral" } },
        ],
        messages: [{ role: "user", content: pergunta }],
    });
    if (response.stop_reason === "refusal") throw new Error("A IA não pôde responder essa pergunta");
    return response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n");
};
