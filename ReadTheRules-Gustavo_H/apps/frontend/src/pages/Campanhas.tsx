import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, meuId, setToken } from "../api";

export default function Campanhas() {
  const [lista, setLista] = useState<any[]>([]);
  const [form, setForm] = useState({ titulo: "", descricao: "" });
  const [erro, setErro] = useState("");
  const nav = useNavigate();

  const carregar = () => api("/campanhas").then((r) => setLista(r.membro)).catch((e) => setErro(e.message));
  useEffect(() => { carregar(); }, []);

  const rodar = (p: Promise<unknown>) => p.then(carregar).catch((e) => setErro(e.message));

  return (
    <div className="pagina">
      <header className="topo">
        <span className="marca pequena">READ THE RULES</span>
        <button className="btn outline" onClick={() => { setToken(null); nav("/login"); }}>Sair</button>
      </header>
      <p className="dica">Seu ID (passe para o mestre te convidar): <code>{meuId()}</code></p>
      {erro && <p className="erro">{erro}</p>}

      <h2>Minhas campanhas</h2>
      <ul className="lista">
        {lista.map((c) => (
          <li key={c.id_campanha} className="card">
            {c.status === "ativo" ? <Link to={`/campanhas/${c.id_campanha}`}><h3>{c.titulo}</h3></Link> : <h3>{c.titulo}</h3>}
            <p>{c.descricao}</p>
            <small className="tag">{c.role} · {c.status}</small>
            {c.status === "pendente" && (
              <div className="acoes">
                <button className="btn" onClick={() => rodar(api(`/membros/${c.id_campanha}/aceitar`, "PATCH"))}>Aceitar convite</button>
                <button className="btn outline" onClick={() => rodar(api(`/membros/${c.id_campanha}/recusar`, "PATCH"))}>Recusar</button>
              </div>
            )}
          </li>
        ))}
        {!lista.length && <p>Nenhuma campanha ainda.</p>}
      </ul>

      <h2>Nova campanha</h2>
      <form className="card form" onSubmit={(e) => { e.preventDefault(); rodar(api("/campanhas", "POST", form).then(() => setForm({ titulo: "", descricao: "" }))); }}>
        <input placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
        <textarea placeholder="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
        <button className="btn">Criar</button>
      </form>
    </div>
  );
}
