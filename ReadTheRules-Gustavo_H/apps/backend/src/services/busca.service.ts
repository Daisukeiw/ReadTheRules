import prisma from "../utils/prisma.js";

// Busca rápida para usar durante a sessão: um termo em notas, worldbuilding e documentos.
export const buscar = async (id_campanha: string, q: string) => {
    if (!q?.trim()) throw new Error("Informe o termo de busca (?q=)");
    const termo = { contains: q.trim(), mode: "insensitive" as const };
    const porNome = { id_campanha, OR: [{ nome: termo }, { descricao: termo }] };

    const [notas, personagens, itens, locais, criaturas, deuses, aliancas, conceitos, docs] = await Promise.all([
        prisma.nota.findMany({ where: { id_campanha, OR: [{ titulo: termo }, { corpo: termo }] } }),
        prisma.personagem.findMany({ where: porNome }),
        prisma.item.findMany({ where: porNome }),
        prisma.local.findMany({ where: porNome }),
        prisma.criatura.findMany({ where: porNome }),
        prisma.deus.findMany({ where: porNome }),
        prisma.alianca.findMany({ where: porNome }),
        prisma.conceito.findMany({ where: porNome }),
        prisma.documentoExterno.findMany({ where: { id_campanha, OR: [{ nome: termo }, { conteudo: termo }] } }),
    ]);

    // Documentos podem ser enormes: devolve só um trecho em volta do termo.
    const documentos = docs.map(({ conteudo, ...d }) => ({ ...d, trecho: trecho(conteudo, q.trim()) }));

    return { notas, personagens, itens, locais, criaturas, deuses, aliancas, conceitos, documentos };
};

export const trecho = (texto: string, q: string, raio = 300) => {
    const i = texto.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return texto.slice(0, raio * 2);
    return texto.slice(Math.max(0, i - raio), i + q.length + raio);
};
