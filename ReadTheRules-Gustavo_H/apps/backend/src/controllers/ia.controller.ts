import type { Request, Response } from "express";
import { listHistoricoIA, perguntarIA } from "../services/ia.service.js";
import { buscar } from "../services/busca.service.js";

export const perguntarIAController = async (req: Request, res: Response) => {
    try {
        const { id_campanha } = req.params as { id_campanha: string };
        const { pergunta, tipo } = req.body;
        const consulta = await perguntarIA(id_campanha, req.user.id, pergunta, tipo);
        res.status(201).json({ consulta });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const listHistoricoIAController = async (req: Request, res: Response) => {
    try {
        const { id_campanha } = req.params as { id_campanha: string };
        res.status(200).json({ historico: await listHistoricoIA(id_campanha) });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const buscarController = async (req: Request, res: Response) => {
    try {
        const { id_campanha } = req.params as { id_campanha: string };
        res.status(200).json(await buscar(id_campanha, req.query.q as string));
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
