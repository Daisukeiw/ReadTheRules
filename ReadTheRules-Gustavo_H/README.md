# Read the Rules

Plataforma para mestres de RPG de mesa: campanhas, sessões, notas, worldbuilding, busca rápida durante a sessão e um assistente de IA que responde com base nos materiais da campanha.

## Como rodar o backend

```bash
# 1. Banco (Postgres)
cd docker && docker compose up -d && cd ..

# 2. Backend
cd apps/backend
cp .env.example .env        # preencha JWT_SECRET e IA_API_KEY (grátis, Gemini) ou ANTHROPIC_API_KEY
npm install
npm run db:migrate          # aplica as migrations e gera o Prisma Client
npm run dev                 # http://localhost:3000
npm test                    # testes
```

Ou tudo em Docker (banco + API): `cd docker && docker compose up -d --build` (precisa do `apps/backend/.env`).

## Como rodar o front-end

```bash
cd apps/frontend
npm install
npm run dev                 # http://localhost:5173 (usa a API em http://localhost:3000; mude com VITE_API_URL)
```

## IA gratuita

Com `IA_API_KEY` no `.env` do backend, o assistente usa qualquer API compatível com OpenAI. O padrão é o **Google Gemini** (`gemini-2.5-flash`), que tem plano gratuito e contexto de 1M tokens: crie a chave em https://aistudio.google.com/apikey. Para trocar (Groq, OpenRouter, Ollama local), mude `IA_BASE_URL` e `IA_MODEL`. Sem `IA_API_KEY`, usa o Claude (`ANTHROPIC_API_KEY`).

### Busca semântica (RAG)

Com `IA_API_KEY`, os documentos são quebrados em trechos e viram vetores (embeddings do Gemini, `gemini-embedding-001`) guardados no Postgres com **pgvector**. Isso é feito sozinho na primeira busca ou pergunta depois do upload.

- A busca (`/busca?q=`) devolve, além do resultado por palavra, o grupo `relacionados`: trechos parecidos pelo significado (ex.: "como agarrar alguém" acha a regra de Atletismo contra Acrobacia).
- O assistente manda os documentos inteiros quando eles são pequenos. Passando de ~100 mil caracteres, manda só os 12 trechos mais relevantes para a pergunta.
- Se a API de embeddings falhar, tudo continua funcionando como antes (busca por palavra e documentos inteiros).

O banco precisa da extensão `vector` (a imagem `ankane/pgvector` do docker-compose já tem; no Railway use o template "pgvector").

## Deploy

- **Backend (Railway):** aponte o serviço para `ReadTheRules-Gustavo_H/apps/backend` (usa o `Dockerfile`). Variáveis: `DATABASE_URL`, `JWT_SECRET`, `IA_API_KEY`. O `npm start` aplica as migrations ao subir.
- **Front-end (Vercel):** raiz `ReadTheRules-Gustavo_H/apps/frontend`, variável `VITE_API_URL` com a URL do backend. O `vercel.json` já faz as rotas do React Router funcionarem ao recarregar a página.
- **CI (GitHub Actions):** a cada PR roda migrations num Postgres com pgvector, typecheck e testes do backend, e o build do front-end.

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
| POST, GET, GET `/:id`, DELETE (mestre) | `/campanhas/:id/documentos` `{nome, conteudo}` ou `{nome, pdf}` | Materiais do mestre (regras, lore) em texto ou PDF (base64; o texto é extraído) |
| GET | `/campanhas/:id/busca?q=termo` | Busca o termo em notas, worldbuilding e documentos, mais trechos relacionados por significado |
| POST (mestre) | `/campanhas/:id/ia` `{pergunta, tipo?}` | Pergunta ao assistente; responde com base nos materiais e salva no histórico |
| GET (mestre) | `/campanhas/:id/ia` | Histórico de perguntas |
| POST (mestre) | `/membros/:id/convidar` `{email}` | Convida um jogador pelo email da conta dele |
| PATCH | `/membros/:id/aceitar`, `/membros/:id/recusar` | O jogador responde a um convite pendente |
| GET | `/membros/convites` (jogador), `/membros/:id/convites` (mestre) | Convites pendentes / jogadores da campanha |
| CRUD | `/campanhas/:id/eventos`, `/eventos/:id_evento/confirmar` | Calendário e RSVP |

Os corpos das requisições de criação são validados com Zod (erro 400 com a lista do que está errado). Documentos aceitam `.txt`/`.md` (como texto) e `.pdf` (em base64, até ~20 MB); PDFs escaneados sem texto são recusados.
