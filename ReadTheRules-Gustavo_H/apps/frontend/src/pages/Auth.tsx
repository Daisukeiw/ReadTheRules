import { useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, setToken } from "../api";
import { Flip, gsap, reduzMovimento, useGSAP } from "@/lib/gsap";
import { morfarLogo } from "@/components/morfarLogo";
import { Campo, BotaoOuro } from "@/components/Campo";
import logo from "@/assets/logo.png";

// Força da senha de 0 a 3 (-1 = vazia), só para orientar quem está criando a conta.
export function forcaSenha(s: string) {
  if (!s) return -1;
  if (s.length < 6) return 0;
  const extras = [s.length >= 10, /[a-z]/.test(s) && /[A-Z]/.test(s), /\d/.test(s), /[^A-Za-z0-9]/.test(s)].filter(Boolean).length;
  return extras >= 3 ? 3 : extras >= 1 ? 2 : 1;
}
const NIVEIS = ["Muito curta", "Fraca", "Média", "Forte"];

export default function Auth() {
  const { pathname } = useLocation();
  const cadastro = pathname === "/cadastro";
  const nav = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [esqueci, setEsqueci] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const raiz = useRef<HTMLDivElement>(null);
  const painel = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const antes = useRef<{ rect: DOMRect; flip: Flip.FlipState } | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  // Guarda onde estavam a logo e o formulário antes de trocar de tela.
  const trocar = (e: React.MouseEvent) => {
    e.preventDefault();
    if (antes.current) return;
    setErro(""); setAviso(""); setEsqueci(false);
    if (!reduzMovimento() && logoRef.current && painel.current) {
      antes.current = { rect: logoRef.current.getBoundingClientRect(), flip: Flip.getState(painel.current) };
    }
    nav(cadastro ? "/login" : "/cadastro");
  };

  // Depois da troca: o formulário desliza para o outro lado e a logo se desfaz e se remonta.
  useLayoutEffect(() => {
    const a = antes.current;
    if (!a || !logoRef.current || !painel.current || !canvas.current) return;
    const img = logoRef.current;
    const para = img.getBoundingClientRect();
    gsap.set(img, { opacity: 0 });
    Flip.from(a.flip, { duration: 0.9, ease: "power3.inOut" });
    gsap.fromTo(painel.current.querySelectorAll("[data-surge]"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.45, stagger: 0.05, ease: "rtr-out" });
    morfarLogo(img, a.rect, para, canvas.current).then(() => {
      gsap.fromTo(img, { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.35, ease: "rtr-out" });
      antes.current = null;
    });
  }, [cadastro]);

  // Entrada da página: uma vez só, curta.
  useGSAP(() => {
    if (reduzMovimento()) return;
    gsap.from(logoRef.current, { opacity: 0, scale: 0.94, filter: "blur(10px)", duration: 1, ease: "rtr-out" });
    gsap.from("[data-surge]", { opacity: 0, y: 16, duration: 0.6, stagger: 0.06, ease: "rtr-out", delay: 0.1 });
  }, { scope: raiz });

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(""); setAviso(""); setEnviando(true);
    try {
      if (esqueci) return setAviso((await api("/auth/esqueci-senha", "POST", { email: form.email })).message);
      if (cadastro) await api("/auth/register", "POST", form);
      const { token } = await api("/auth/login", "POST", { email: form.email, senha: form.senha });
      setToken(token);
      nav("/");
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const forca = forcaSenha(form.senha);

  return (
    <div ref={raiz} className="relative min-h-svh overflow-hidden bg-noite font-serif">
      <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-50 size-full" />

      <Link to="/" className="absolute top-5 left-4 z-10 font-display text-sm tracking-wide text-pergaminho/80 transition-colors duration-200 hover:text-ouro sm:left-8">
        ← Voltar ao início
      </Link>

      <main className="relative mx-auto grid min-h-svh max-w-6xl items-center gap-10 px-4 py-20 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className={`relative ${cadastro ? "lg:order-1" : "lg:order-2"}`}>
          <div aria-hidden className="absolute inset-0 -z-0 bg-[radial-gradient(closest-side,rgba(189,155,96,.16),transparent)]" />
          <img
            ref={logoRef}
            src={logo}
            alt="Read the Rules"
            className="relative mx-auto w-[min(70vw,300px)] select-none drop-shadow-[0_18px_40px_rgba(0,0,0,.55)] lg:w-[min(36vw,460px)]"
            draggable={false}
          />
        </div>

        <div ref={painel} className={`mx-auto w-full max-w-md ${cadastro ? "lg:order-2" : "lg:order-1"}`}>
          <h1 data-surge className="m-0 text-center font-display text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.15] font-normal text-texto">
            {cadastro ? "Bem vindo" : "Bem vindo de volta"}<br />ao<br /><span className="font-semibold text-ouro">Read the Rules</span>
          </h1>
          <p data-surge className="mt-3 mb-7 text-center text-lg text-pergaminho">
            {esqueci ? "Mandamos um link para você criar uma senha nova." : cadastro ? "Vamos começar a dar vida ao seu mundo?" : "Pronto para a próxima sessão?"}
          </p>

          <form
            data-surge
            onSubmit={enviar}
            className="flex flex-col gap-5 rounded-2xl border border-white/5 bg-card p-7 shadow-[0_24px_60px_-20px_rgba(0,0,0,.7)] sm:p-9"
          >
            {cadastro && <h2 className="m-0 text-center font-display text-xl text-texto">Quem irá criar?</h2>}
            {cadastro && <Campo label="Nome completo" value={form.name} onChange={set("name")} placeholder="Como você quer ser chamado" autoComplete="name" required />}
            <Campo label="E-mail" type="email" value={form.email} onChange={set("email")} placeholder="voce@exemplo.com" autoComplete="email" required />
            {!esqueci && (
              <div className="flex flex-col gap-2">
                <Campo
                  label="Senha"
                  type="password"
                  value={form.senha}
                  onChange={set("senha")}
                  placeholder={cadastro ? "Pelo menos 6 caracteres" : "Sua senha"}
                  autoComplete={cadastro ? "new-password" : "current-password"}
                  minLength={cadastro ? 6 : undefined}
                  required
                />
                {cadastro && forca >= 0 && (
                  <div className="flex items-center gap-3" aria-live="polite">
                    <div className="flex flex-1 gap-1.5">
                      {[1, 2, 3].map((n) => (
                        <span key={n} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${forca >= n ? (forca === 1 ? "bg-sangue" : forca === 2 ? "bg-pergaminho" : "bg-ouro") : "bg-white/10"}`} />
                      ))}
                    </div>
                    <span className="w-24 text-right text-sm text-muted-foreground">Senha {NIVEIS[forca].toLowerCase()}</span>
                  </div>
                )}
              </div>
            )}

            {!cadastro && (
              <button
                type="button"
                onClick={() => { setEsqueci(!esqueci); setErro(""); setAviso(""); }}
                className="-mt-2 self-end font-serif text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-200 hover:text-ouro"
              >
                {esqueci ? "Voltar para o login" : "Esqueci minha senha"}
              </button>
            )}

            {erro && <p role="alert" className="m-0 rounded-md border border-sangue/60 bg-sangue/15 px-3 py-2 text-[#f3b4b4]">{erro}</p>}
            {aviso && <p role="status" className="m-0 rounded-md border border-ouro/40 bg-ouro/10 px-3 py-2 text-pergaminho">{aviso}</p>}

            <BotaoOuro disabled={enviando} className="mt-1 self-center px-12">
              {enviando ? "Aguarde…" : esqueci ? "Enviar link" : cadastro ? "Criar conta" : "Entrar"}
            </BotaoOuro>

            <p className="m-0 text-center text-base text-texto/80">
              {cadastro ? "Já possui uma conta?" : "Não possui uma conta?"}{" "}
              <a href={cadastro ? "/login" : "/cadastro"} onClick={trocar} className="font-display font-semibold text-ouro underline-offset-4 hover:underline">
                {cadastro ? "Entrar" : "Cadastre-se!"}
              </a>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
