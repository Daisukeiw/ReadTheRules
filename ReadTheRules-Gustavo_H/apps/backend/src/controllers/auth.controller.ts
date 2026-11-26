import type { Request, Response } from "express";
import { register, login, esqueciSenha, redefinirSenha } from "../services/auth.service.js";

export const registerController = async (req: Request, res: Response) => {
    try {
        const { name, email, senha } = req.body;
        const user = await register(name, email, senha);
        const { senha_usuario, ...userSemSenha } = user;
    res.status(201).json({ user: userSemSenha });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const loginCotroller = async(req: Request, res: Response) => {
    try {
        const { email, senha } = req.body;
        const user = await login(email, senha);
        res.status(200).json( user )
    } catch (error:any) {
        res.status(400).json({message: error.message})
    }
}

export const esqueciSenhaController = async (req: Request, res: Response) => {
    try {
        await esqueciSenha(req.body.email);
        res.status(200).json({ message: "Se existir uma conta com esse email, enviamos um link para redefinir a senha." });
    } catch (error: any) {
        console.error("Falha ao enviar email de redefinição:", error);
        res.status(500).json({ message: "Não foi possível enviar o email agora. Tente mais tarde." });
    }
}

export const redefinirSenhaController = async (req: Request, res: Response) => {
    try {
        await redefinirSenha(req.body.token, req.body.senha);
        res.status(200).json({ message: "Senha alterada. Faça login com a nova senha." });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}
