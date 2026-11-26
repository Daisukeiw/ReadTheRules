import type { Request, Response } from "express";
import { createDocumento, deleteDocumento, getDocumentoById, listDocumentos } from "../services/documento.service.js";

type Params = { id_campanha: string; id_documento: string };

export const createDocumentoController = async (req: Request, res: Response) => {
    try {
        const { id_campanha } = req.params as Params;
        const { nome, tipo, conteudo, pdf } = req.body;
        const documento = await createDocumento(id_campanha, nome, tipo, conteudo, pdf);
        res.status(201).json({ documento });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const listDocumentosController = async (req: Request, res: Response) => {
    try {
        const { id_campanha } = req.params as Params;
        res.status(200).json({ documentos: await listDocumentos(id_campanha) });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getDocumentoByIdController = async (req: Request, res: Response) => {
    try {
        const { id_campanha, id_documento } = req.params as Params;
        res.status(200).json({ documento: await getDocumentoById(id_campanha, id_documento) });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteDocumentoController = async (req: Request, res: Response) => {
    try {
        const { id_campanha, id_documento } = req.params as Params;
        await deleteDocumento(id_campanha, id_documento);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
