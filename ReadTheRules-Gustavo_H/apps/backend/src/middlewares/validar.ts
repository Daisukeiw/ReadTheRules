import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

// Valida o corpo da requisição com Zod; responde 400 com a lista de erros.
export const validar = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const r = schema.safeParse(req.body ?? {});
    if (!r.success) {
        return res.status(400).json({ message: r.error.issues.map((i) => (i.path.length ? `${i.path.join(".")}: ` : "") + i.message).join("; ") });
    }
    req.body = r.data;
    next();
};
