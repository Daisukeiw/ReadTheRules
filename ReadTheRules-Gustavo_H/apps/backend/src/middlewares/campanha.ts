import type { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma.js";

// Só membros ativos acessam os dados da campanha. Guarda o vínculo em req.membro.
export const isMembro = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const membro = await prisma.membroCampanha.findFirst({
            where: { id_campanha: req.params.id_campanha as string, id_usuario: req.user.id, status: "ativo" },
        });
        if (!membro) return res.status(403).json({ message: "Você não participa dessa campanha" });
        req.membro = membro;
        next();
    } catch {
        return res.status(400).json({ message: "Campanha inválida" });
    }
};

export const apenasMestre = (req: Request, res: Response, next: NextFunction) => {
    if (req.membro?.role !== "mestre") return res.status(403).json({ message: "Apenas o mestre pode fazer isso" });
    next();
};
