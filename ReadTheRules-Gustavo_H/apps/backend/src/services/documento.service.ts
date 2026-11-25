import prisma from "../utils/prisma.js";

export const createDocumento = async (id_campanha: string, nome: string, tipo: string, conteudo: string) => {
    if (!nome || !conteudo) throw new Error("nome e conteudo são obrigatórios");
    return prisma.documentoExterno.create({
        data: { id_campanha, nome, tipo: tipo || "texto", conteudo },
    });
};

// Lista sem o conteúdo, que pode ser grande.
export const listDocumentos = async (id_campanha: string) => {
    return prisma.documentoExterno.findMany({
        where: { id_campanha },
        select: { id_documento: true, nome: true, tipo: true, dt_upload: true },
        orderBy: { dt_upload: "desc" },
    });
};

export const getDocumentoById = async (id_campanha: string, id_documento: string) => {
    const documento = await prisma.documentoExterno.findFirst({ where: { id_campanha, id_documento } });
    if (!documento) throw new Error("Documento não encontrado");
    return documento;
};

export const deleteDocumento = async (id_campanha: string, id_documento: string) => {
    const { count } = await prisma.documentoExterno.deleteMany({ where: { id_campanha, id_documento } });
    if (!count) throw new Error("Documento não encontrado");
};
