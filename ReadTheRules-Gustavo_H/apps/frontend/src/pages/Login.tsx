import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../api";

export default function Login() {
  const [cadastro, setCadastro] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", senha: "" });
  const [erro, setErro] = useState("");
  const nav = useNavigate();
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    try {
      if (cadastro) await api("/auth/register", "POST", form);
      const { token } = await api("/auth/login", "POST", { email: form.email, senha: form.senha });
      setToken(token);
      nav("/");
    } catch (err: any) { setErro(err.message); }
  };

  return (
    <div className="login">
      <div>
        <h1 className="titulo">{cadastro ? "Crie sua conta" : "Bem-vindo de volta!"}</h1>
        <p className="subtitulo">{cadastro ? "Sua próxima campanha começa aqui." : "Pronto para a próxima Sessão?"}</p>
        <form className="card login-card" onSubmit={enviar}>
          {cadastro && (<label>Nome:<input value={form.name} onChange={set("name")} placeholder="Seu nome" required /></label>)}
          <label>E-mail:<input type="email" value={form.email} onChange={set("email")} placeholder="exemplar@gmail.com" required /></label>
          <label>Senha:<input type="password" value={form.senha} onChange={set("senha")} placeholder="Digite aqui..." required /></label>
          {!cadastro && <span className="esqueci" title="Ainda não disponível">Esqueci minha senha</span>}
          {erro && <p className="erro">{erro}</p>}
          <button className="btn pill">{cadastro ? "Cadastrar" : "Entrar"}</button>
          <p className="troca">
            {cadastro ? "Já possui uma conta?" : "Não possui uma conta?"}<br />
            <a onClick={() => { setCadastro(!cadastro); setErro(""); }}>{cadastro ? "Entrar" : "Cadastre-se!"}</a>
          </p>
        </form>
      </div>
      <div className="marca">READ THE RULES</div>
    </div>
  );
}
