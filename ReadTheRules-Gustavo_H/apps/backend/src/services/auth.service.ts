import prisma from "../utils/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const register = async (name: string, email: string, senha: string) => {
    const UserExists = await prisma.usuario.findUnique({
        where: {email_usuario: email}
    })
    if (UserExists) {
        throw new Error("Esse email já tem um conta")
    }
    const hashedPassword = await bcrypt.hash(senha, 10)
    const user = await prisma.usuario.create({
        data: {
            nome_usuario: name,
            email_usuario: email,
            senha_usuario: hashedPassword
        }
    })
    return user;
}

export const login = async (email: string, senha: string) => {
    const UserExists = await prisma.usuario.findUnique({
        where: {email_usuario: email}
    })
    if(!UserExists){
        throw new Error ("Não existe uma conta vinculado a esse email")
    }
    const PasswordCorrect = await bcrypt.compare(senha, UserExists.senha_usuario)
    if (!PasswordCorrect) {
        throw new Error ("Senha está incorreta")
    }
    const token = jwt.sign(
        {id: UserExists.id_usuario},
        process.env.JWT_SECRET as string,
        { expiresIn: "12h"}
    );
    return {token}
}   

// Esqueci minha senha: token assinado com JWT_SECRET + hash da senha atual,
// então ele deixa de valer assim que a senha muda (uso único) e não serve como token de login.
const segredoReset = (hash: string) => (process.env.JWT_SECRET as string) + hash;

export const esqueciSenha = async (email: string) => {
    const user = await prisma.usuario.findUnique({ where: { email_usuario: email } });
    if (!user) return; // não revela se o email existe
    const token = jwt.sign({ id: user.id_usuario }, segredoReset(user.senha_usuario), { expiresIn: "30m" });
    const link = `${process.env.FRONT_URL ?? "http://localhost:5173"}/redefinir-senha?token=${token}`;

    if (!process.env.SMTP_URL) {
        console.log(`[esqueci minha senha] SMTP_URL não configurado. Link para ${email}: ${link}`);
        return;
    }
    await nodemailer.createTransport(process.env.SMTP_URL).sendMail({
        from: process.env.SMTP_FROM ?? "Read the Rules <no-reply@readtherules.app>",
        to: email,
        subject: "Redefinir sua senha - Read the Rules",
        text: `Para criar uma nova senha, abra o link abaixo (vale por 30 minutos):\n\n${link}\n\nSe não foi você, ignore este email.`,
    });
};

export const redefinirSenha = async (token: string, senha: string) => {
    const id = (jwt.decode(token) as { id?: string } | null)?.id;
    const user = id && (await prisma.usuario.findUnique({ where: { id_usuario: id } }));
    try {
        if (!user) throw new Error();
        jwt.verify(token, segredoReset(user.senha_usuario));
    } catch {
        throw new Error("Link inválido ou expirado. Peça um novo.");
    }
    await prisma.usuario.update({ where: { id_usuario: user.id_usuario }, data: { senha_usuario: await bcrypt.hash(senha, 10) } });
};
