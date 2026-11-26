import prisma from "../utils/prisma.js";

// API compatível com OpenAI (padrão: Google Gemini, grátis). Usada pelo chat e pelos embeddings.
export const IA_BASE = () => process.env.IA_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai";

// Busca semântica só existe com IA_API_KEY (o Claude não tem API de embeddings).
export const temEmbeddings = () => !!process.env.IA_API_KEY;

// Quebra o texto em pedaços de até `tam` caracteres, cortando em parágrafo quando dá.
export const pedacos = (texto: string, tam = 1500) => {
    const out: string[] = [];
    let atual = "";
    for (const p of texto.split(/\n\s*\n/)) {
        if (atual && atual.length + p.length + 2 > tam) { out.push(atual); atual = ""; }
        atual = atual ? `${atual}\n\n${p}` : p;
        while (atual.length > tam) { out.push(atual.slice(0, tam)); atual = atual.slice(tam); }
    }
    out.push(atual);
    return out.map((s) => s.trim()).filter(Boolean);
};

const embed = async (textos: string[]) => {
    const vetores: number[][] = [];
    for (let i = 0; i < textos.length; i += 100) { // limite de itens por chamada da API
        const res = await fetch(`${IA_BASE()}/embeddings`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.IA_API_KEY}` },
            body: JSON.stringify({ model: process.env.IA_EMBED_MODEL ?? "gemini-embedding-001", input: textos.slice(i, i + 100) }),
        });
        const data: any = await res.json();
        if (!res.ok) throw new Error(`Erro nos embeddings: ${data.error?.message ?? data[0]?.error?.message ?? res.status}`);
        vetores.push(...data.data.map((d: { embedding: number[] }) => d.embedding));
    }
    return vetores;
};

// Gera os vetores dos documentos que ainda não têm (novos, ou de antes da busca semântica existir).
// shortcut: duas perguntas simultâneas logo após um upload podem indexar o mesmo documento duas vezes; adicionar um lock se isso aparecer.
const indexarDocumentos = async (id_campanha: string) => {
    const feitos = await prisma.embedding.findMany({ where: { id_campanha, entidade_tipo: "documento" }, select: { entidade_id: true }, distinct: ["entidade_id"] });
    const docs = await prisma.documentoExterno.findMany({
        where: { id_campanha, id_documento: { notIn: feitos.map((f) => f.entidade_id) } },
        select: { id_documento: true, conteudo: true },
    });
    for (const d of docs) {
        const partes = pedacos(d.conteudo);
        const vetores = await embed(partes);
        await prisma.$transaction(partes.map((trecho, i) => prisma.$executeRaw`
            INSERT INTO "Embedding" (id_embedding, id_campanha, entidade_tipo, entidade_id, trecho, vector)
            VALUES (gen_random_uuid(), ${id_campanha}::uuid, 'documento', ${d.id_documento}::uuid, ${trecho}, ${JSON.stringify(vetores[i])}::vector)`));
    }
};

// Os `k` trechos de documentos mais parecidos com o texto, pelo significado (distância de cosseno no pgvector).
export const trechosRelacionados = async (id_campanha: string, texto: string, k = 8) => {
    await indexarDocumentos(id_campanha);
    const [v] = await embed([texto]);
    return prisma.$queryRaw<{ nome: string; trecho: string; distancia: number }[]>`
        SELECT d.nome, e.trecho, e.vector <=> ${JSON.stringify(v)}::vector AS distancia
        FROM "Embedding" e JOIN "DocumentoExterno" d ON d.id_documento = e.entidade_id
        WHERE e.id_campanha = ${id_campanha}::uuid
        ORDER BY distancia LIMIT ${k}`;
};

export const apagarEmbeddings = (entidade_id: string) => prisma.embedding.deleteMany({ where: { entidade_id } });
