# Read the Rules

Plataforma para mestres de RPG de mesa: campanhas, sessões, notas, worldbuilding, busca rápida durante a sessão e um assistente de IA que responde com base nos materiais da campanha.

## Como rodar o backend

```bash
# 1. Banco (Postgres)
cd docker && docker compose up -d && cd ..

# 2. Backend
cd apps/backend
cp .env.example .env        # preencha JWT_SECRET e ANTHROPIC_API_KEY
npm install
npm run db:migrate          # aplica as migrations e gera o Prisma Client
npm run dev                 # http://localhost:3000
```

## Rotas principais

Todas (menos `/auth` e `/health`) pedem `Authorization: Bearer <token>`.
Tudo em `/campanhas/:id_campanha/...` exige ser membro **ativo** da campanha. As marcadas com (mestre) exigem ser o mestre.

| Método | Rota | O que faz |
|---|---|---|
| POST | `/auth/register` `{name, email, senha}` | Cadastro |
| POST | `/auth/login` `{email, senha}` | Devolve `token` |
| POST/GET | `/campanhas` | Cria / lista minhas campanhas |
| GET, PUT (mestre), DELETE (mestre) | `/campanhas/:id` | Campanha |
| CRUD | `/campanhas/:id/sessoes`, `/notas` | Pré e pós-sessão |
| CRUD | `/campanhas/:id/personagens`, `/itens`, `/locais`, `/criaturas`, `/deuses`, `/aliancas`, `/conceitos` | Worldbuilding (`/nome/:nome` busca por nome) |
| POST, GET, GET `/:id`, DELETE (mestre) | `/campanhas/:id/documentos` `{nome, tipo, conteudo}` | Materiais do mestre (regras, lore) em texto |
| GET | `/campanhas/:id/busca?q=termo` | Busca o termo em notas, worldbuilding e documentos |
| POST (mestre) | `/campanhas/:id/ia` `{pergunta, tipo?}` | Pergunta ao assistente; responde com base nos materiais e salva no histórico |
| GET (mestre) | `/campanhas/:id/ia` | Histórico de perguntas |
| POST/PATCH/GET | `/membros/:id/convidar`, `/aceitar`, `/recusar`, `/convites` | Convites de jogadores |
| CRUD | `/campanhas/:id/eventos`, `/eventos/:id_evento/confirmar` | Calendário e RSVP |

Documentos são enviados como texto. No front-end, leia o arquivo `.txt`/`.md` com `FileReader` e mande o conteúdo no JSON.
