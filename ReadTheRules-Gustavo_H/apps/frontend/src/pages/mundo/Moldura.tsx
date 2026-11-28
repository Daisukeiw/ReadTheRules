import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, type LucideIcon } from "lucide-react";
import { setToken } from "@/api";
import { gsap, useGSAP, reduzMovimento } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import simbolo from "@/assets/logo-simbolo.png";
import { lerImagem, usarFoto } from "../homeLogada/dados";

// Peças compartilhadas pela home logada e pela página da campanha.

export function Silhueta() {
  return (
    <svg viewBox="0 0 64 64" className="size-3/4" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" aria-hidden>
      <circle cx="32" cy="20" r="9" />
      <path d="M32 29v30M32 38l-15 11M32 38l15 11" />
    </svg>
  );
}

// Campo de foto: sem foto mostra a silhueta; clicar escolhe ou troca a imagem.
export function Foto({ className }: { className?: string }) {
  const [foto, setFoto] = usarFoto();
  return (
    <label title={foto ? "Trocar foto" : "Adicionar foto"} className={cn("grid shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-ouro/70 bg-[linear-gradient(160deg,#9e1b1b,#5c1010)] text-pergaminho/80 transition-transform duration-200 hover:scale-105", className)}>
      {foto ? <img src={foto} alt="Sua foto" className="size-full object-cover" /> : <Silhueta />}
      <span className="sr-only">{foto ? "Trocar foto" : "Adicionar foto"}</span>
      <input type="file" accept="image/*" className="sr-only" onChange={async (e) => {
        const a = e.target.files?.[0];
        if (a) setFoto(await lerImagem(a, 256));
      }} />
    </label>
  );
}

export function Sair() {
  const nav = useNavigate();
  return (
    <button onClick={() => { setToken(null); nav("/login"); }} aria-label="Sair"
      className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-border bg-transparent px-3 py-1.5 font-display text-sm text-pergaminho/80 hover:border-ouro hover:text-ouro">
      <LogOut className="size-4" /><span className="hidden sm:inline">Sair</span>
    </button>
  );
}

export const Simbolo = ({ className }: { className?: string }) => <img src={simbolo} alt="" className={cn("object-contain", className)} />;

export type Ferramenta = { nome: string; icone: LucideIcon; ativa?: boolean; onClick: () => void };

// Barra lateral: foto fixa no topo e 6 ferramentas.
export function BarraLateral({ ferramentas, chave }: { ferramentas: Ferramenta[]; chave: string }) {
  return (
    <aside aria-label="Ferramentas" className="fixed top-16 bottom-0 left-0 z-30 flex w-[4.5rem] flex-col border-r border-border bg-card/80 animate-[entrar-lado_.45s_var(--ease-out)] sm:w-24">
      <div className="grid aspect-square place-items-center bg-[linear-gradient(160deg,#9e1b1b,#5c1010)]">
        <Foto className="size-12 sm:size-16" />
      </div>
      <ul key={chave} className="m-0 flex flex-1 list-none flex-col p-0">
        {ferramentas.map((f, i) => (
          <li key={f.nome} className="flex-1 border-b border-border/70 animate-[surgir_.3s_var(--ease-out)_both]" style={{ animationDelay: `${i * 35}ms` }}>
            <button onClick={f.onClick} aria-current={f.ativa ? "page" : undefined}
              className={cn("flex size-full cursor-pointer flex-col items-center justify-center gap-1 border-0 px-1 py-2 text-center transition-colors hover:bg-input hover:text-ouro",
                f.ativa ? "bg-ouro/10 text-ouro shadow-[inset_3px_0_0_#bd9b60]" : "bg-transparent text-pergaminho")}>
              <f.icone className="size-5" strokeWidth={1.6} />
              <span className="font-display text-[0.6rem] leading-tight sm:text-[0.68rem]">{f.nome}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// Tela de carregamento ao trocar de seção: símbolo com anel girando, nome da seção e barra enchendo.
export function Carregando({ nome }: { nome: string }) {
  const raiz = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (reduzMovimento()) return;
    const tl = gsap.timeline({ defaults: { ease: "rtr-out" } });
    tl.from(raiz.current, { opacity: 0, duration: 0.25 })
      .from("[data-simbolo]", { scale: 0.7, opacity: 0, filter: "blur(8px)", duration: 0.6 }, 0.05)
      .from("[data-letra]", { opacity: 0, y: 10, duration: 0.4, stagger: 0.03 }, 0.2)
      .fromTo("[data-barra]", { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0.15);
    gsap.to("[data-anel]", { rotate: 360, duration: 2.4, ease: "none", repeat: -1 });
  }, { scope: raiz });

  return (
    <div ref={raiz} role="status" aria-live="polite" className="fixed inset-0 z-[60] grid place-items-center bg-noite">
      <div className="flex flex-col items-center gap-6">
        <div data-simbolo className="relative grid size-36 place-items-center">
          <svg data-anel viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
            <circle cx="50" cy="50" r="47" fill="none" stroke="#bd9b60" strokeOpacity=".25" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="47" fill="none" stroke="#bd9b60" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="70 226" />
          </svg>
          <Simbolo className="size-24 drop-shadow-[0_0_24px_rgba(189,155,96,.45)]" />
        </div>
        <p className="m-0 font-display text-2xl tracking-[0.2em] text-ouro uppercase" aria-label={`Carregando ${nome}`}>
          {[...nome].map((l, i) => <span key={i} data-letra className="inline-block whitespace-pre">{l}</span>)}
        </p>
        <div className="h-0.5 w-48 overflow-hidden rounded-full bg-border">
          <div data-barra className="h-full origin-left bg-ouro" />
        </div>
      </div>
    </div>
  );
}

// Estado vazio no estilo da referência: caixa tracejada, ícone, título, texto e botão.
export function Vazio({ icone: Icone, titulo, texto, acao }: { icone: LucideIcon; titulo: string; texto: string; acao?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-input text-pergaminho"><Icone className="size-5" /></span>
      <p className="m-0 font-display text-xl text-texto">{titulo}</p>
      <p className="m-0 max-w-md text-base text-texto/60">{texto}</p>
      {acao && <div className="mt-2">{acao}</div>}
    </div>
  );
}

// Cabeçalho padrão das páginas de ferramenta.
export function Pagina({ titulo, texto, extra, children, larga }: { titulo: string; texto?: string; extra?: React.ReactNode; children: React.ReactNode; larga?: boolean }) {
  return (
    <div className={cn("mx-auto px-4 py-8 sm:px-8", larga ? "max-w-none" : "max-w-6xl")}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 font-display text-3xl font-semibold text-sangue-claro sm:text-4xl">{titulo}</h1>
          {texto && <p className="mt-1 mb-0 text-lg text-texto/60">{texto}</p>}
        </div>
        {extra}
      </div>
      {children}
    </div>
  );
}
