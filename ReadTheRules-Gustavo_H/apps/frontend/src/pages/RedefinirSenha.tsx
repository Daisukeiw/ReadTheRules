import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";

// Aberta pelo link do email de "esqueci minha senha".
export default function RedefinirSenha() {
  const [params] = useSearchParams();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  return (
    <div className="login">
      <div>
        <h1 className="titulo">Nova senha</h1>
        <form className="card login-card" onSubmit={(e) => {
          e.preventDefault(); setErro("");
          api("/auth/redefinir-senha", "POST", { token: params.get("token"), senha }).then((r) => setOk(r.message)).catch((e) => setErro(e.message));
        }}>
          {ok ? <p>{ok} <Link to="/login">Entrar</Link></p> : <>
            <label>Nova senha:<input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} minLength={6} placeholder="Pelo menos 6 caracteres" required /></label>
            {erro && <p className="erro">{erro}</p>}
            <button className="btn pill">Salvar senha</button>
          </>}
        </form>
      </div>
      <div className="marca">READ THE RULES</div>
    </div>
  );
}
