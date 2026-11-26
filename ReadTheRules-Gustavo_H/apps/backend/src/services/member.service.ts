import prisma from "../utils/prisma.js";

// O mestre convida pelo email (ou pelo id) do jogador.
export const convidarPlayer = async (
  id_campanha: string,
  id?: string,
  email?: string,
) => {
  const usuario = await prisma.usuario.findFirst({
    where: email ? { email_usuario: { equals: email, mode: "insensitive" } } : { id_usuario: id! },
  });
  if (!usuario) throw new Error("Nenhum usuário cadastrado com esse email");
  const id_usuario = usuario.id_usuario;

  const membroExistente = await prisma.membroCampanha.findUnique({
    where: {
      id_campanha_id_usuario: {
        id_campanha,
        id_usuario,
      },
    },
  });

  if (membroExistente?.status === "ativo" || membroExistente?.status === "pendente") {
    throw new Error("O usuário já foi convidado para essa campanha");
  }

  if (membroExistente && membroExistente.status === "recusado") {
    const membro = await prisma.membroCampanha.update({
      where: {
        id_campanha_id_usuario: {
          id_campanha,
          id_usuario,
        },
      },
      data: {
        status: "pendente",
      },
    });
    return membro;
  }
  const membro = await prisma.membroCampanha.create({
    data: {
      id_campanha: id_campanha,
      id_usuario,
      role: "jogador",
      status: "pendente",
    },
  });

  return membro;
};

export const aceitarConvite = async (
  id_usuario: string,
  id_campanha: string,
) => {
  const membroExistente = await prisma.membroCampanha.findUnique({
    where: {
      id_campanha_id_usuario: {
        id_campanha,
        id_usuario,
      },
    },
  });

  if (membroExistente?.status === "ativo") {
    throw new Error("Você já aceitou o convite para essa campanha");
  }
  if (membroExistente?.status !== "pendente") {
    throw new Error("Não existe um convite pendente para essa campanha");
  }
  const membro = await prisma.membroCampanha.update({
    where: {
      id_campanha_id_usuario: {
        id_campanha,
        id_usuario,
      },
    },
    data: {
      status: "ativo",
    },
  });
  return membro;
};

export const recusarConvite = async (
  id_usuario: string,
  id_campanha: string,
) => {
  const membroExistente = await prisma.membroCampanha.findUnique({
    where: {
      id_campanha_id_usuario: {
        id_campanha,
        id_usuario,
      },
    },
  });

  if (membroExistente && membroExistente.status === "ativo") {
    throw new Error("Você já aceitou o convite para essa campanha");
  }

  if (!membroExistente ) {
    throw new Error("Não existe um convite pendente para essa campanha");
  }

  const membro = await prisma.membroCampanha.update({
    where: {
      id_campanha_id_usuario: {
        id_campanha,
        id_usuario,
      },
    },
    data: {
      status: "recusado",
    },
  });
  return membro;
};

export const listarConvitesMestre = async (id_campanha: string) => {
  const membros = await prisma.membroCampanha.findMany({
    where: {
      id_campanha,
      role: "jogador",
    },
    include: {
      Usuario: {
        select: {
          id_usuario: true,
          nome_usuario: true,
          email_usuario: true,
          foto_perfil: true,
          dt_criacao: true,
        },
      },
    },
  });
  return membros;
};

export const listarConvitesJogador = async (id_usuario: string) => {
  const membros = await prisma.membroCampanha.findMany({
    where: {
      id_usuario,
      role: "jogador",
      status: "pendente",
    },
    include: { Campanha: { select: { id_campanha: true, titulo: true, descricao: true } } },
  });
  return membros;
};

export const removerMembro = async (
  id_campanha: string,
  id_usuario: string,
  id_usuario_mestre: string,
) => {
  const mestre = await prisma.membroCampanha.findFirst({
    where: {
      id_campanha,
      id_usuario: id_usuario_mestre,
      role: "mestre",
      status: "ativo",
    },
  });

  if (!mestre) {
    throw new Error("Apenas o mestre ativo pode remover membros da campanha");
  }

  if (id_usuario === id_usuario_mestre) {
    throw new Error("O mestre não pode remover a si mesmo");
  }

  const membroExistente = await prisma.membroCampanha.findUnique({
    where: {
      id_campanha_id_usuario: {
        id_campanha,
        id_usuario,
      },
    },
  });

  if (!membroExistente) {
    throw new Error("Membro não encontrado ou já removido");
  }

  const membro = await prisma.membroCampanha.delete({
    where: {
      id_campanha_id_usuario: {
        id_campanha,
        id_usuario,
      },
    },
  });
  return membro;
};
