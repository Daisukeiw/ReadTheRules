import { z } from "zod";

z.config(z.locales.pt()); // mensagens de erro padrão em português

const texto = (max: number) => z.string().trim().min(1, "obrigatório").max(max, `máximo ${max} caracteres`);

export const registerSchema = z.object({
    name: texto(80),
    email: z.email("email inválido").max(120),
    senha: z.string().min(6, "a senha precisa de pelo menos 6 caracteres"),
});

export const loginSchema = z.object({ email: z.email("email inválido"), senha: z.string().min(1, "obrigatório") });

export const campanhaSchema = z.object({ titulo: texto(100), descricao: z.string().optional() });

export const sessaoSchema = z.looseObject({ titulo: texto(100).optional(), status: texto(20).optional() });

export const notaSchema = z.looseObject({ titulo: texto(100), corpo: z.string().min(1, "obrigatório"), categoria: texto(20) });

export const eventoSchema = z.looseObject({ titulo: texto(100), dt_evento: z.iso.datetime({ message: "data inválida" }) });

// Worldbuilding: personagens, itens, locais, criaturas, deuses, alianças, conceitos.
export const comNomeSchema = z.looseObject({ nome: texto(100) });

export const documentoSchema = z.object({
    nome: texto(150),
    tipo: z.string().max(10).optional(),
    conteudo: z.string().optional(),
    pdf: z.base64("pdf deve vir em base64").optional(),
}).refine((d) => d.conteudo?.trim() || d.pdf, { message: "envie o conteudo em texto ou um pdf" });

export const iaSchema = z.object({ pergunta: z.string().trim().min(1, "Informe a pergunta"), tipo: z.string().optional() });

export const conviteSchema = z.object({
    email: z.email("email inválido").optional(),
    id_usuario: z.uuid("id inválido").optional(),
}).refine((c) => c.email || c.id_usuario, { message: "informe o email do jogador" });
