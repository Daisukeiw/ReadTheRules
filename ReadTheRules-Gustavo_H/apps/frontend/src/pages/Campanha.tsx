import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";

type Campo = { n: string; l: string; t?: "area" | "data" | string[] };
type Aba = { nome: string; path: string; id: string; campos: Campo[]; mestre?: boolean; arquivo?: boolean };

const nome: Campo = { n: "nome", l: "Nome" };
const desc: Campo = { n: "descricao", l: "Descrição", t: "area" };

const ABAS: Aba[] = [
  { nome: "Sessões", path: "sessoes", id: "id_sessao", campos: [{ n: "titulo", l: "Título" }, { n: "status", l: "Status", t: ["planejada", "em andamento", "concluida"] }, { n: "resumo", l: "Resumo", t: "area" }] },
  { nome: "Notas", path: "notas", id: "id_nota", campos: [{ n: "titulo", l: "Título" }, { n: "categoria", l: "Categoria", t: ["lore", "regra", "npc", "gancho", "outro"] }, { n: "corpo", l: "Texto", t: "area" }] },
  { nome: "Personagens", path: "personagens", id: "id_personagem", campos: [nome, { n: "tipo", l: "Tipo", t: ["npc", "jogador"] }, desc] },
  { nome: "Itens", path: "itens", id: "id_item", campos: [nome, { n: "raridade", l: "Raridade", t: ["comum", "incomum", "raro", "lendario"] }, desc] },
  { nome: "Locais", path: "locais", id: "id_local", campos: [nome, { n: "tipo", l: "Tipo" }, desc] },
  { nome: "Criaturas", path: "criaturas", id: "id_criatura", campos: [nome, { n: "tipo", l: "Tipo" }, desc] },
  { nome: "Deuses", path: "deuses", id: "id_deus", campos: [nome, { n: "dominio", l: "Domínio" }, desc] },
  { nome: "Alianças", path: "aliancas", id: "id_alianca", campos: [nome, desc] },
  { nome: "Conceitos", path: "conceitos", id: "id_conceito", campos: [nome, desc] },
  { nome: "Calendário", path: "eventos", id: "id_evento", campos: [{ n: "titulo", l: "Título" }, { n: "dt_evento", l: "Data", t: "data" }] },
  { nome: "Documentos", path: "documentos", id: "id_documento", mestre: true, arquivo: true, campos: [nome, { n: "conteudo", l: "Conteúdo (ou carregue um .txt, .md ou .pdf)", t: "area" }] },
];

export default function Campanha() {
  const { id } = useParams();
  const [camp, setCamp] = useState<any>();
  const [aba, setAba] = useState("Sessões");

  useEffect(() => {
    api("/campanhas").then((r) => setCamp(r.membro.find((c: any) => c.id_campanha === id)));
  }, [id]);

  const mestre = camp?.role === "mestre";
  const abas = [...ABAS.filter((a) => !a.mestre || mestre).map((a) => a.nome), "Busca", ...(mestre ? ["Membros", "Assistente IA"] : [])];
  const base = `/campanhas/${id}`;
  const atual = ABAS.find((a) => a.nome === aba);

  return (
    <div className="pagina">
      <header className="topo">
        <Link to="/" className="marca pequena">READ THE RULES</Link>
        <span className="tag">{camp?.role}</span>
      </header>
      <h1 className="titulo">{camp?.titulo}</h1>
      <p>{camp?.descricao}</p>
      <nav className="abas">
        {abas.map((a) => <button key={a} className={a === aba ? "ativa" : ""} onClick={() => setAba(a)}>{a}</button>)}
      </nav>
      {atual && <Lista key={atual.path} aba={atual} base={base} />}
      {aba === "Busca" && <Busca base={base} />}
      {aba === "Membros" && <Membros id={id!} base={base} />}
      {aba === "Assistente IA" && <IA base={base} />}
    </div>
  );
}

// Lista + formulário de criação + excluir, genérico para qualquer recurso da campanha.
function Lista({ aba, base }: { aba: Aba; base: string }) {
  const url = `${base}/${aba.path}`;
  const vazio = () => Object.fromEntries(aba.campos.map((c) => [c.n, Array.isArray(c.t) ? c.t[0] : ""]));
  const [itens, setItens] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, string>>(vazio);
  const [aberto, setAberto] = useState<any>();
  const [erro, setErro] = useState("");

  // cada rota devolve { <nome>: [...] }: pega o primeiro array
  const carregar = () => api(url).then((r) => setItens(Object.values(r).find(Array.isArray) as any[])).catch((e) => setErro(e.message));
  useEffect(() => { carregar(); }, [url]);
  const rodar = (p: Promise<unknown>) => { setErro(""); return p.then(carregar).catch((e) => setErro(e.message)); };

  // PDF vai em base64 e o backend extrai o texto; .txt/.md vão direto como texto.
  const lerArquivo = async (f?: File) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf")) return setForm({ ...form, nome: form.nome || f.name, conteudo: await f.text(), pdf: "" });
    const url = await new Promise<string>((ok) => { const r = new FileReader(); r.onload = () => ok(r.result as string); r.readAsDataURL(f); });
    setForm({ ...form, nome: form.nome || f.name, conteudo: "", pdf: url.split(",")[1]! });
  };

  return (
    <section>
      {erro && <p className="erro">{erro}</p>}
      <form className="card form" onSubmit={(e) => {
        e.preventDefault();
        const corpo = aba.path === "eventos" ? { ...form, dt_evento: new Date(form.dt_evento).toISOString() } : form;
        rodar(api(url, "POST", corpo).then(() => setForm(vazio())));
      }}>
        {aba.campos.map((c) => {
          const p = { value: form[c.n], placeholder: c.l, onChange: (e: any) => setForm({ ...form, [c.n]: e.target.value }) };
          if (c.t === "area") return <textarea key={c.n} {...p} />;
          if (Array.isArray(c.t)) return <select key={c.n} {...p}>{c.t.map((o) => <option key={o}>{o}</option>)}</select>;
          return <input key={c.n} {...p} type={c.t === "data" ? "datetime-local" : "text"} required={c.n === "nome" || c.n === "titulo"} />;
        })}
        {aba.arquivo && <input type="file" accept=".txt,.md,.pdf" onChange={(e) => lerArquivo(e.target.files?.[0])} />}
        <button className="btn">Adicionar</button>
      </form>
      <ul className="lista">
        {itens.map((i) => (
          <li key={i[aba.id]} className="card">
            <h3>{i.nome ?? i.titulo ?? "Sem título"}</h3>
            <small className="tag">{[i.status, i.categoria, i.tipo, i.raridade, i.dominio, i.dt_evento && new Date(i.dt_evento).toLocaleString("pt-BR")].filter(Boolean).join(" · ")}</small>
            <p className="corpo">{i.descricao ?? i.resumo ?? i.corpo}</p>
            {aberto?.[aba.id] === i[aba.id] && <pre className="corpo">{aberto.conteudo}</pre>}
            <div className="acoes">
              {aba.arquivo && <button className="btn outline" onClick={() => api(`${url}/${i[aba.id]}`).then((r) => setAberto(r.documento))}>Ver</button>}
              {aba.path === "eventos" && <>
                <button className="btn outline" onClick={() => rodar(api(`/eventos/${i.id_evento}/confirmar`, "PATCH"))}>Vou</button>
                <button className="btn outline" onClick={() => rodar(api(`/eventos/${i.id_evento}/recusar`, "PATCH"))}>Não vou</button>
              </>}
              <button className="btn perigo" onClick={() => rodar(api(`${url}/${i[aba.id]}`, "DELETE"))}>Excluir</button>
            </div>
          </li>
        ))}
        {!itens.length && <p>Nada aqui ainda.</p>}
      </ul>
    </section>
  );
}

function Busca({ base }: { base: string }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Record<string, any[]>>();
  const [erro, setErro] = useState("");
  return (
    <section>
      <form className="card form linha" onSubmit={(e) => { e.preventDefault(); setErro(""); api(`${base}/busca?q=${encodeURIComponent(q)}`).then(setRes).catch((e) => setErro(e.message)); }}>
        <input placeholder="Buscar regra, NPC, lugar..." value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn">Buscar</button>
      </form>
      {erro && <p className="erro">{erro}</p>}
      {res && Object.entries(res).filter(([, v]) => v.length).map(([grupo, v]) => (
        <div key={grupo}>
          <h2>{grupo === "relacionados" ? "trechos relacionados (por significado)" : grupo}</h2>
          <ul className="lista">
            {v.map((i, k) => <li key={k} className="card"><h3>{i.nome ?? i.titulo}</h3><p className="corpo">{i.trecho ?? i.descricao ?? i.corpo}</p></li>)}
          </ul>
        </div>
      ))}
      {res && !Object.values(res).some((v) => v.length) && <p>Nada encontrado.</p>}
    </section>
  );
}

function Membros({ id, base }: { id: string; base: string }) {
  const [membros, setMembros] = useState<any[]>([]);
  const [novo, setNovo] = useState("");
  const [erro, setErro] = useState("");
  const carregar = () => api(`${base}/membros`).then((r) => setMembros(r.membros)).catch((e) => setErro(e.message));
  useEffect(() => { carregar(); }, []);
  const rodar = (p: Promise<unknown>) => { setErro(""); p.then(carregar).catch((e) => setErro(e.message)); };
  return (
    <section>
      {erro && <p className="erro">{erro}</p>}
      <form className="card form linha" onSubmit={(e) => { e.preventDefault(); rodar(api(`/membros/${id}/convidar`, "POST", { email: novo.trim() }).then(() => setNovo(""))); }}>
        <input type="email" placeholder="Email do jogador (ele precisa ter conta)" value={novo} onChange={(e) => setNovo(e.target.value)} required />
        <button className="btn">Convidar</button>
      </form>
      <ul className="lista">
        {membros.map((m) => (
          <li key={m.id_membro} className="card">
            <h3>{m.Usuario?.nome_usuario}</h3>
            <small className="tag">{m.Usuario?.email_usuario} · {m.status}</small>
            <div className="acoes"><button className="btn perigo" onClick={() => rodar(api(`${base}/remover/${m.id_usuario}`, "DELETE"))}>Remover</button></div>
          </li>
        ))}
        {!membros.length && <p>Nenhum jogador ainda.</p>}
      </ul>
    </section>
  );
}

function IA({ base }: { base: string }) {
  const [pergunta, setPergunta] = useState("");
  const [hist, setHist] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const carregar = () => api(`${base}/ia`).then((r) => setHist(r.historico)).catch((e) => setErro(e.message));
  useEffect(() => { carregar(); }, []);
  return (
    <section>
      <form className="card form" onSubmit={(e) => {
        e.preventDefault(); setErro(""); setCarregando(true);
        api(`${base}/ia`, "POST", { pergunta }).then(() => { setPergunta(""); return carregar(); }).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
      }}>
        <textarea placeholder="Pergunte sobre regras, lore ou peça ideias para a próxima sessão..." value={pergunta} onChange={(e) => setPergunta(e.target.value)} required />
        <button className="btn" disabled={carregando}>{carregando ? "Pensando..." : "Perguntar"}</button>
      </form>
      {erro && <p className="erro">{erro}</p>}
      <ul className="lista">
        {hist.map((h) => (
          <li key={h.id_consulta} className="card">
            <h3>{h.pergunta}</h3>
            <small className="tag">{new Date(h.dt_consulta).toLocaleString("pt-BR")}</small>
            <p className="corpo">{h.resposta}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
