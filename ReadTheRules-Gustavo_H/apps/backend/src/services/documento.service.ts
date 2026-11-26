import { extractText, getDocumentProxy } from "unpdf";
import prisma from "../utils/prisma.js";
import { apagarEmbeddings } from "./embedding.service.js";

// O PDF chega em base64; guardamos só o texto extraído.
const textoDoPdf = async (base64: string) => {
    const pdf = await getDocumentProxy(new Uint8Array(Buffer.from(base64, "base64")));
    const { text } = await extractText(pdf, { mergePages: true });
    if (!text.trim()) throw new Error("Não encontrei texto nesse PDF (é uma imagem escaneada?)");
    return text;
};

export const createDocumento = async (id_campanha: string, nome: string, tipo?: string, conteudo?: string, pdf?: string) => {
    if (pdf) {
        conteudo = await textoDoPdf(pdf).catch((e) => { throw new Error(e.message.startsWith("Não encontrei") ? e.message : "PDF inválido ou corrompido"); });
        tipo = "pdf";
    }
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
    await apagarEmbeddings(id_documento);
};
