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

// recurso da URL -> [model do Prisma, campo id]
const RECURSOS: Record<string, [string, string]> = {
    sessoes: ["sessao", "id_sessao"], notas: ["nota", "id_nota"], eventos: ["calendarioEvento", "id_evento"],
    personagens: ["personagem", "id_personagem"], itens: ["item", "id_item"], locais: ["local", "id_local"],
    criaturas: ["criatura", "id_criatura"], deuses: ["deus", "id_deus"], aliancas: ["alianca", "id_alianca"],
    conceitos: ["conceito", "id_conceito"], documentos: ["documentoExterno", "id_documento"],
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Em /campanhas/:id_campanha/:recurso/:id, o item precisa ser dessa campanha
// (sem isso, um membro de uma campanha podia ver/editar/excluir itens de outra pelo id).
export const itemDaCampanha = async (req: Request, res: Response, next: NextFunction) => {
    const { recurso, id, id_campanha } = req.params as Record<string, string>;
    const alvo = RECURSOS[recurso!];
    if (!alvo || !UUID.test(id!)) return next(); // ex.: /eventos/meus, /personagens/nome/x
    const [model, campo] = alvo;
    const item = await (prisma as any)[model].findFirst({ where: { [campo]: id, id_campanha }, select: { [campo]: true } });
    if (!item) return res.status(404).json({ message: "Não encontrado nesta campanha" });
    next();
};
