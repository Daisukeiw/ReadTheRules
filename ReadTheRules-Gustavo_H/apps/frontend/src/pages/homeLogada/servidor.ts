import { useSyncExternalStore } from "react";
import { api, getToken } from "@/api";
import type { Arquivo, Bloco, Campanha, Entidade, Roteiro, Sessao, StatusConvite, TipoEntidade } from "./dados";

// Ponte com o back-end. Cada coleção carrega da API e, a cada mudança feita pela tela,
// compara a lista nova com a anterior e manda POST / PATCH / DELETE só do que mudou.
// O que o back-end não guarda (capa, sinopse, linha do tempo…) fica no navegador, junto do id do servidor.

// ---------- avisos de erro ----------
let avisos: string[] = [];
const ouvemAvisos = new Set<() => void>();
const avisarTodos = () => ouvemAvisos.forEach((f) => f());
export function avisar(msg: string) {
  avisos = [...avisos, msg]; avisarTodos();
  window.setTimeout(() => { avisos = avisos.filter((a) => a !== msg); avisarTodos(); }, 7000);
}
export const useAvisos = () => useSyncExternalStore((f) => { ouvemAvisos.add(f); return () => { ouvemAvisos.delete(f); }; }, () => avisos);

// ---------- quem está logado ----------
export function meuId(): string | undefined {
  const t = getToken(); if (!t) return;
  try { return JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).id; } catch { return; }
}
const nomes = new Map<string, string>();
export const nomeJogador = (id: string) => nomes.get(id) ?? "Jogador";

// ---------- campos que só existem no navegador ----------
function lerExtra<T>(grupo: string, id: string): Partial<T> {
  try { return JSON.parse(localStorage.getItem(`rtr-extra-${grupo}`) ?? "{}")[id] ?? {}; } catch { return {}; }
}
function gravarExtra(grupo: string, id: string, v: object) {
  try {
    const k = `rtr-extra-${grupo}`, t = JSON.parse(localStorage.getItem(k) ?? "{}");
    t[id] = v; localStorage.setItem(k, JSON.stringify(t));
  } catch { /* cota cheia: segue sem os extras */ }
}

// ---------- texto livre + perguntas guiadas num campo só ----------
const PERGUNTAS = /(?:^|\n\n)## Perguntas\n([\s\S]*)$/;
export function juntar(texto: string, respostas: Record<string, string>) {
  const r = Object.entries(respostas).filter(([, v]) => v?.trim());
  return [texto.trim(), r.length ? "## Perguntas\n" + r.map(([p, v]) => `### ${p}\n${v.trim()}`).join("\n\n") : ""].filter(Boolean).join("\n\n");
}
export function separar(d?: string | null): { texto: string; respostas: Record<string, string> } {
  if (!d) return { texto: "", respostas: {} };
  const m = d.match(PERGUNTAS);
  if (!m) return { texto: d, respostas: {} };
  const respostas: Record<string, string> = {};
  for (const bloco of m[1].split(/^### /m).filter((b) => b.trim())) {
    const i = bloco.indexOf("\n");
    if (i > 0) respostas[bloco.slice(0, i)] = bloco.slice(i + 1).trim();
  }
  return { texto: d.slice(0, m.index), respostas };
}

// Sistema e nível vão no fim da descrição da campanha: assim jogadores e a IA do servidor também os veem.
const SISTEMA = /(?:^|\n\n)\[Sistema: (.+) · Nível (\d+)\]$/;
const descricaoCompleta = (c: Campanha) => [c.descricao.trim(), `[Sistema: ${c.sistema} · Nível ${c.nivel}]`].filter(Boolean).join("\n\n");
export function lerDescricao(d?: string | null) {
  const m = (d ?? "").match(SISTEMA);
  return m ? { descricao: d!.slice(0, m.index), sistema: m[1], nivel: Number(m[2]) } : { descricao: d ?? "", sistema: "Outro", nivel: 1 };
}

// ---------- coleção sincronizada ----------
type Ops<T> = {
  carregar: () => Promise<T[]>;
  criar: (x: T) => Promise<string>;
  atualizar?: (x: T, antes: T) => Promise<unknown>;
  remover?: (x: T) => Promise<unknown>;
  local?: (x: T) => void;
};
type Setter<T> = (v: T[] | ((a: T[]) => T[])) => void;

function colecao<T extends { id: string }>(ops: Ops<T>) {
  let estado = { lista: [] as T[], pronto: false };
  let token: string | null | undefined;
  let promessa: Promise<T[]> | undefined;
  let fila = Promise.resolve();
  const ouvintes = new Set<() => void>();
  const apelidos = new Map<string, string>(); // id provisório -> id do servidor
  const adiados = new Map<string, { antes: T; timer: number }>();
  const real = (id: string) => apelidos.get(id) ?? id;
  const mudar = (e: typeof estado) => { estado = e; ouvintes.forEach((f) => f()); };

  function recarregar() {
    const p: Promise<T[]> = ops.carregar()
      .then((l) => { if (promessa === p) mudar({ lista: l, pronto: true }); return l; })
      .catch((e) => { if (promessa === p) { mudar({ ...estado, pronto: true }); avisar(`Não foi possível carregar do servidor: ${e.message}`); } return estado.lista; });
    promessa = p;
    return p;
  }
  function conferirToken() {
    if (getToken() === token) return;
    token = getToken(); apelidos.clear();
    estado = { lista: [], pronto: !token };
    if (token) recarregar(); else promessa = undefined;
  }
  function enfileirar(f: () => Promise<unknown>) {
    fila = fila.then(f).then(() => undefined, (e) => { avisar(`Não foi possível salvar no servidor: ${e.message}`); recarregar(); });
  }

  const set: Setter<T> = (v) => {
    const antes = estado.lista;
    const bruto = typeof v === "function" ? v(antes) : v;
    // um item que ainda carrega o id provisório vira o do servidor; repetido, vale a versão mais nova
    const porId = new Map<string, T>();
    for (const x of bruto) { const id = real(x.id); porId.set(id, id === x.id ? x : { ...x, id }); }
    mudar({ ...estado, lista: [...porId.values()] });

    const velhos = new Map(antes.map((x) => [x.id, x]));
    for (const x of porId.values()) {
      const a = velhos.get(x.id);
      if (!a) enfileirar(async () => {
        const id = await ops.criar(x);
        ops.local?.({ ...x, id });
        if (id !== x.id) { apelidos.set(x.id, id); mudar({ ...estado, lista: estado.lista.map((y) => (y.id === x.id ? { ...y, id } : y)) }); }
      });
      else if (a !== x && JSON.stringify(a) !== JSON.stringify(x)) {
        ops.local?.(x);
        // digitação gera muitas mudanças: junta tudo e manda uma vez só
        const p = adiados.get(x.id); if (p) window.clearTimeout(p.timer);
        const base = p?.antes ?? a;
        adiados.set(x.id, { antes: base, timer: window.setTimeout(() => {
          adiados.delete(x.id);
          enfileirar(async () => { const atual = estado.lista.find((y) => y.id === real(x.id)); if (atual) await ops.atualizar?.(atual, base); });
        }, 600) });
      }
    }
    for (const a of antes) if (!porId.has(a.id)) {
      window.clearTimeout(adiados.get(a.id)?.timer); adiados.delete(a.id);
      enfileirar(async () => ops.remover?.({ ...a, id: real(a.id) }));
    }
  };

  const assinar = (f: () => void) => { ouvintes.add(f); return () => { ouvintes.delete(f); }; };
  const ler = () => { conferirToken(); return estado; };
  return {
    usar: () => { const e = useSyncExternalStore(assinar, ler); return [e.lista, set, e.pronto] as const; },
    pronta: () => { conferirToken(); return promessa ?? Promise.resolve(estado.lista); },
    recarregar,
  };
}

const primeiro = (r: Record<string, any>) => Object.values(r)[0];

// ---------- campanhas ----------
type LinhaCampanha = { id_campanha: string; titulo: string; descricao: string | null; role: string; status: string; dt_criacao: string };
type Membro = { id_usuario: string; role: string; status: string; Usuario: { nome_usuario: string } };

const campanhas = colecao<Campanha>({
  async carregar() {
    const { membro } = await api<{ membro: LinhaCampanha[] }>("/campanhas");
    const ativas = membro.filter((m) => m.status === "ativo").sort((a, b) => b.dt_criacao.localeCompare(a.dt_criacao));
    return Promise.all(ativas.map(async (c): Promise<Campanha> => {
      const { membros } = await api<{ membros: Membro[] }>(`/campanhas/${c.id_campanha}/membros`);
      membros.forEach((m) => nomes.set(m.id_usuario, m.Usuario.nome_usuario));
      return {
        ...lerDescricao(c.descricao), ...lerExtra<Campanha>("campanhas", c.id_campanha),
        id: c.id_campanha, nome: c.titulo, papel: c.role === "mestre" ? "mestre" : "jogador",
        jogadores: membros.filter((m) => m.role === "jogador" && m.status === "ativo").map((m) => m.id_usuario),
      };
    }));
  },
  async criar(c) {
    const { campanha } = await api<{ campanha: { id_campanha: string } }>("/campanhas", "POST", { titulo: c.nome, descricao: descricaoCompleta(c) });
    for (const email of c.convidar ?? [])
      await api(`/membros/${campanha.id_campanha}/convidar`, "POST", { email }).catch((e) => avisar(`O convite para ${email} não foi enviado: ${e.message}`));
    return campanha.id_campanha;
  },
  atualizar: (c) => api(`/campanhas/${c.id}`, "PUT", { titulo: c.nome, descricao: descricaoCompleta(c) }),
  remover: (c) => api(`/campanhas/${c.id}`, "DELETE"),
  local: (c) => gravarExtra("campanhas", c.id, { imagem: c.imagem }),
});
export const useCampanhas = campanhas.usar;

// ---------- entidades (worldbuilding) ----------
const ROTAS: Record<Exclude<TipoEntidade, "eventos">, [rota: string, chave: string]> = {
  aliancas: ["aliancas", "id_alianca"], conceito: ["conceitos", "id_conceito"], criaturas: ["criaturas", "id_criatura"],
  deuses: ["deuses", "id_deus"], itens: ["itens", "id_item"], locais: ["locais", "id_local"], personagem: ["personagens", "id_personagem"],
};
// shortcut: eventos da linha do tempo não têm rota no back-end; ficam no navegador até existir uma.
const lerEventos = (): Entidade[] => { try { return JSON.parse(localStorage.getItem("rtr-eventos") ?? "[]"); } catch { return []; } };
const gravarEventos = (f: (l: Entidade[]) => Entidade[]) => { try { localStorage.setItem("rtr-eventos", JSON.stringify(f(lerEventos()))); } catch { /* cota cheia */ } };

const entidades = colecao<Entidade>({
  async carregar() {
    const cs = await campanhas.pronta();
    const listas = await Promise.all(cs.flatMap((c) => Object.entries(ROTAS).map(async ([tipo, [rota, chave]]) => {
      const linhas: Record<string, any>[] = primeiro(await api(`/campanhas/${c.id}/${rota}`)) ?? [];
      return linhas.map((l): Entidade => ({ id: l[chave], tipo: tipo as TipoEntidade, nome: l.nome, campanhaId: c.id, ...separar(l.descricao) }));
    })));
    return [...listas.flat(), ...lerEventos()];
  },
  async criar(e) {
    if (e.tipo === "eventos") { gravarEventos((l) => [...l, e]); return e.id; }
    if (!e.campanhaId) throw new Error("escolha a campanha da entidade");
    const [rota, chave] = ROTAS[e.tipo];
    return primeiro(await api(`/campanhas/${e.campanhaId}/${rota}`, "POST", { nome: e.nome, descricao: juntar(e.texto, e.respostas) }))[chave];
  },
  async atualizar(e) {
    if (e.tipo === "eventos") return gravarEventos((l) => l.map((x) => (x.id === e.id ? e : x)));
    return api(`/campanhas/${e.campanhaId}/${ROTAS[e.tipo][0]}/${e.id}`, "PATCH", { nome: e.nome, descricao: juntar(e.texto, e.respostas) });
  },
  async remover(e) {
    if (e.tipo === "eventos") return gravarEventos((l) => l.filter((x) => x.id !== e.id));
    return api(`/campanhas/${e.campanhaId}/${ROTAS[e.tipo][0]}/${e.id}`, "DELETE");
  },
});
export const useEntidades = entidades.usar;

// ---------- roteiros ↔ /sessoes (o texto do roteiro vai numa nota "roteiro") ----------
type LinhaSessao = { id_sessao: string; titulo: string | null; resumo: string | null; status: string };
type LinhaNota = { id_nota: string; titulo: string; corpo: string; categoria: string };
const notaDoRoteiro = new Map<string, string>(); // id da sessão -> id da nota com o texto
const tituloNota = (id: string) => `Roteiro ${id}`;
export const resumoEmTexto = (b: Bloco[]) => b.map((x) =>
  x.tipo === "texto" ? x.texto.trim() : x.tipo === "combate" ? (x.estado === "inicio" ? "⚔ Combate iniciado" : "⚔ Combate encerrado") : `📝 Nota ${x.n}: ${x.texto}`,
).filter(Boolean).join("\n\n");
const statusServidor = (r: Roteiro) => (r.status === "encerrada" ? "concluida" : "planejada");

async function gravarTextoRoteiro(r: Roteiro, antes?: Roteiro) {
  const corpo = juntar(r.texto, r.respostas);
  if (antes && corpo === juntar(antes.texto, antes.respostas)) return;
  const n = notaDoRoteiro.get(r.id);
  if (n) return api(`/campanhas/${r.campanhaId}/notas/${n}`, "PATCH", { corpo: corpo || "(em branco)" });
  if (!corpo) return;
  const { nota } = await api<{ nota: LinhaNota }>(`/campanhas/${r.campanhaId}/notas`, "POST", { titulo: tituloNota(r.id), corpo, categoria: "roteiro" });
  notaDoRoteiro.set(r.id, nota.id_nota);
}

const roteiros = colecao<Roteiro>({
  async carregar() {
    const cs = (await campanhas.pronta()).filter((c) => c.papel === "mestre"); // roteiro é só do mestre
    const listas = await Promise.all(cs.map(async (c) => {
      const [{ sessoes }, { notas }] = await Promise.all([
        api<{ sessoes: LinhaSessao[] }>(`/campanhas/${c.id}/sessoes`), api<{ notas: LinhaNota[] }>(`/campanhas/${c.id}/notas`)]);
      return sessoes.map((s, i): Roteiro => {
        const nota = notas.find((n) => n.categoria === "roteiro" && n.titulo === tituloNota(s.id_sessao));
        if (nota) notaDoRoteiro.set(s.id_sessao, nota.id_nota);
        const ex = lerExtra<Roteiro>("roteiros", s.id_sessao);
        return {
          numero: i + 1, ...ex, ...separar(nota?.corpo === "(em branco)" ? "" : nota?.corpo),
          id: s.id_sessao, campanhaId: c.id, titulo: s.titulo ?? "", status: s.status === "concluida" ? "encerrada" : "rascunho",
          resumo: ex.resumo ?? (s.resumo ? [{ id: "servidor", tipo: "texto", texto: s.resumo }] : []),
        };
      });
    }));
    return listas.flat();
  },
  async criar(r) {
    const resumo = resumoEmTexto(r.resumo);
    const { sessao } = await api<{ sessao: LinhaSessao }>(`/campanhas/${r.campanhaId}/sessoes`, "POST",
      { ...(r.titulo.trim() && { titulo: r.titulo.trim() }), status: statusServidor(r), ...(resumo && { resumo }) });
    await gravarTextoRoteiro({ ...r, id: sessao.id_sessao });
    return sessao.id_sessao;
  },
  async atualizar(r, a) {
    if (r.titulo !== a.titulo || r.status !== a.status || resumoEmTexto(r.resumo) !== resumoEmTexto(a.resumo))
      await api(`/campanhas/${r.campanhaId}/sessoes/${r.id}`, "PATCH",
        { titulo: r.titulo.trim() || undefined, status: statusServidor(r), resumo: resumoEmTexto(r.resumo) || undefined });
    await gravarTextoRoteiro(r, a);
  },
  async remover(r) {
    await api(`/campanhas/${r.campanhaId}/sessoes/${r.id}`, "DELETE");
    const n = notaDoRoteiro.get(r.id); if (n) await api(`/campanhas/${r.campanhaId}/notas/${n}`, "DELETE");
  },
  local: (r) => gravarExtra("roteiros", r.id, { numero: r.numero, sessaoId: r.sessaoId, encerradaEm: r.encerradaEm, resumo: r.resumo }),
});
export const useRoteiros = roteiros.usar;

// ---------- sessões marcadas no calendário ↔ /eventos + RSVP ----------
type LinhaEvento = { id_evento: string; titulo: string; dt_evento: string };
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const dia = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
// Número e local vão no título do evento, para os jogadores também verem.
const tituloEvento = (s: Sessao) => `Sessão ${s.numero}${s.local ? ` · ${s.local}` : ""}`.slice(0, 100);
const corpoEvento = (s: Sessao) => ({ titulo: tituloEvento(s), dt_evento: new Date(`${s.data}T${s.inicio}`).toISOString() });

const sessoes = colecao<Sessao>({
  async carregar() {
    const cs = await campanhas.pronta();
    const eu = meuId();
    const listas = await Promise.all(cs.map(async (c) => {
      const { eventos } = await api<{ eventos: LinhaEvento[] }>(`/campanhas/${c.id}/eventos`);
      return Promise.all(eventos.map(async (ev): Promise<Sessao> => {
        const { rsvps } = await api<{ rsvps: { id_usuario: string; status: StatusConvite }[] }>(`/eventos/${ev.id_evento}`);
        const resp = Object.fromEntries(rsvps.map((r) => [r.id_usuario, r.status]));
        const { convidados, ...ex } = lerExtra<Sessao & { convidados: string[] }>("sessoes", ev.id_evento);
        // o back-end não guarda quem foi convidado: o jogador sempre se vê convidado; o mestre vê quem ele marcou
        const quem = c.papel === "mestre" ? [...(convidados ?? []), ...Object.keys(resp)] : [eu!];
        const m = ev.titulo.match(/^Sessão (\d+)(?: · (.*))?$/);
        const d = new Date(ev.dt_evento);
        return {
          fim: "", nivel: c.nivel, sinopse: "", ...ex,
          id: ev.id_evento, campanhaId: c.id, data: dia(d), inicio: hhmm(d), numero: Number(m?.[1] ?? 1), local: m?.[2] ?? (m ? "" : ev.titulo),
          convites: Object.fromEntries([...new Set(quem)].map((id) => [id, resp[id] ?? "pendente"])),
        };
      }));
    }));
    return listas.flat();
  },
  async criar(s) {
    const { evento } = await api<{ evento: LinhaEvento }>(`/campanhas/${s.campanhaId}/eventos`, "POST", corpoEvento(s));
    return evento.id_evento;
  },
  async atualizar(s, a) {
    if (tituloEvento(s) !== tituloEvento(a) || s.data !== a.data || s.inicio !== a.inicio)
      await api(`/campanhas/${s.campanhaId}/eventos/${s.id}`, "PATCH", corpoEvento(s));
    const eu = meuId()!, st = s.convites[eu];
    if (st !== a.convites[eu] && st !== "pendente" && st) await api(`/eventos/${s.id}/${st === "confirmado" ? "confirmar" : "recusar"}`, "PATCH");
  },
  remover: (s) => api(`/campanhas/${s.campanhaId}/eventos/${s.id}`, "DELETE"),
  local: (s) => gravarExtra("sessoes", s.id, { fim: s.fim, nivel: s.nivel, sinopse: s.sinopse, convidados: Object.keys(s.convites) }),
});
export const useSessoes = sessoes.usar;

// ---------- arquivos de contexto ↔ /documentos ----------
const arquivos = colecao<Arquivo>({
  async carregar() {
    const cs = (await campanhas.pronta()).filter((c) => c.papel === "mestre"); // documentos são só do mestre
    const listas = await Promise.all(cs.map(async (c) => {
      const { documentos } = await api<{ documentos: { id_documento: string; nome: string; dt_upload: string }[] }>(`/campanhas/${c.id}/documentos`);
      return documentos.map((d): Arquivo => ({ tamanho: 0, ...lerExtra<Arquivo>("arquivos", d.id_documento), id: d.id_documento, campanhaId: c.id, nome: d.nome, enviadoEm: d.dt_upload }));
    }));
    return listas.flat();
  },
  async criar(a) {
    const tipo = a.nome.split(".").pop()!.toLowerCase().slice(0, 10);
    const { documento } = await api<{ documento: { id_documento: string } }>(`/campanhas/${a.campanhaId}/documentos`, "POST",
      { nome: a.nome.slice(0, 150), tipo, ...(a.pdf ? { pdf: a.pdf } : { conteudo: a.conteudo }) });
    return documento.id_documento;
  },
  remover: (a) => api(`/campanhas/${a.campanhaId}/documentos/${a.id}`, "DELETE"),
  local: (a) => gravarExtra("arquivos", a.id, { tamanho: a.tamanho }),
});
export const useArquivos = arquivos.usar;

// Depois de aceitar um convite, tudo pode mudar: recarrega as campanhas e o que depende delas.
export async function recarregarTudo() {
  await campanhas.recarregar();
  await Promise.all([entidades.recarregar(), roteiros.recarregar(), sessoes.recarregar(), arquivos.recarregar()]);
}

// ---------- chamadas avulsas ----------
// Mensagem curta para quando a IA falha (as do provedor de IA podem ser enormes).
export const motivo = (e: Error) => { console.warn(e); return e.message.length <= 80 ? ` (${e.message})` : ""; };
export async function perguntarIA(campanhaId: string, pergunta: string, tipo = "pergunta") {
  const { consulta } = await api<{ consulta: { resposta: string } }>(`/campanhas/${campanhaId}/ia`, "POST", { pergunta, tipo });
  return consulta.resposta;
}
export const salvarNota = (campanhaId: string, titulo: string, corpo: string, categoria: string) =>
  api(`/campanhas/${campanhaId}/notas`, "POST", { titulo: titulo.slice(0, 100), corpo, categoria }).catch((e) => avisar(`A nota não foi salva no servidor: ${e.message}`));
