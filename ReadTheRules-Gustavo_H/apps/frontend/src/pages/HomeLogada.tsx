import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLenis } from "lenis/react";
import {
  BookOpenText, CalendarDays, Clapperboard, Coins, Dices, Feather, Flag, History, LayoutDashboard, Library, LogOut,
  MessageSquare, Music, NotebookPen, ScrollText, Shapes, Swords, TrendingUp, type LucideIcon,
} from "lucide-react";
import { setToken } from "@/api";
import { gsap, useGSAP, reduzMovimento } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import simbolo from "@/assets/logo-simbolo.png";
import { lerImagem, usePersistido, useCampanhas, useEntidades, useImpedimentos, useSessoes } from "./homeLogada/dados";
import { CampanhasCriadas } from "./homeLogada/Campanhas";
import { EntidadesCriadas } from "./homeLogada/Entidades";
import { CalendarioColaborativo } from "./homeLogada/Calendario";

type Ferramenta = { nome: string; icone: LucideIcon; alvo?: string };
type Secao = "pre" | "intra" | "pos";

const SECOES: { id: Secao; nome: string }[] = [
  { id: "pre", nome: "Pré Sessão" }, { id: "intra", nome: "Intra Sessão" }, { id: "pos", nome: "Pós Sessão" },
];

// 6 ferramentas por seção. As que têm "alvo" levam a um bloco desta página; as outras ainda serão construídas.
const FERRAMENTAS: Record<Secao, Ferramenta[]> = {
  pre: [
    { nome: "Painel", icone: LayoutDashboard, alvo: "#topo" },
    { nome: "Campanhas", icone: ScrollText, alvo: "#campanhas" },
    { nome: "Wiki de entidades", icone: Shapes, alvo: "#entidades" },
    { nome: "Calendário", icone: CalendarDays, alvo: "#calendario" },
    { nome: "Roteiro da sessão", icone: Clapperboard },
    { nome: "Biblioteca", icone: Library },
  ],
  intra: [
    { nome: "Iniciativa", icone: Swords }, { nome: "Rolador de dados", icone: Dices }, { nome: "Fichas", icone: NotebookPen },
    { nome: "Consulta de regras", icone: BookOpenText }, { nome: "Notas rápidas", icone: Feather }, { nome: "Ambientação", icone: Music },
  ],
  pos: [
    { nome: "Resumo da sessão", icone: ScrollText }, { nome: "Experiência e nível", icone: TrendingUp }, { nome: "Tesouros e itens", icone: Coins },
    { nome: "Linha do tempo", icone: History }, { nome: "Ganchos pendentes", icone: Flag }, { nome: "Feedback da mesa", icone: MessageSquare },
  ],
};

export default function HomeLogada() {
  // Sem seção escolhida a home fica sem barra lateral; ao escolher, passa pela tela de carregamento.
  const [secao, setSecao] = useState<Secao | null>(null);
  const [carregando, setCarregando] = useState<Secao | null>(null);
  const [foto, setFoto] = usePersistido<string | null>("rtr-foto", null);
  const [campanhas, setCampanhas] = useCampanhas();
  const [entidades, setEntidades] = useEntidades();
  const [sessoes, setSessoes] = useSessoes();
  const [impedimentos, setImpedimentos] = useImpedimentos();
  const [aviso, setAviso] = useState("");
  const avisoT = useRef<number>(undefined);
  const lenis = useLenis();
  const nav = useNavigate();
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reduzMovimento()) return;
    gsap.from("[data-surge]", { opacity: 0, y: 18, duration: 0.6, stagger: 0.08, ease: "rtr-out" });
  }, { scope: raiz });

  const escolher = (s: Secao | null) => {
    if (s === secao || carregando) return;
    if (!s) return setSecao(null);
    setCarregando(s);
    window.setTimeout(() => { setSecao(s); setCarregando(null); }, reduzMovimento() ? 250 : 1400);
  };
  const avisar = (t: string) => { setAviso(t); clearTimeout(avisoT.current); avisoT.current = window.setTimeout(() => setAviso(""), 2600); };
  const usar = (f: Ferramenta) => f.alvo
    ? (lenis ? lenis.scrollTo(f.alvo === "#topo" ? 0 : f.alvo, { offset: -88 }) : document.querySelector(f.alvo)?.scrollIntoView())
    : avisar(`${f.nome}: em breve.`);

  return (
    <div ref={raiz} id="topo" className="min-h-svh bg-noite font-serif text-texto">
      {/* barra do topo: seções do site */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-noite/85 px-3 backdrop-blur-md sm:px-6">
        <button onClick={() => escolher(null)} aria-label="Início" className="flex shrink-0 cursor-pointer items-center gap-3 border-0 bg-transparent p-0">
          <img src={simbolo} alt="" className="size-9 object-contain" />
          <span className="marca pequena hidden md:inline">READ THE RULES</span>
        </button>
        <nav aria-label="Seções" className="mx-auto flex gap-1 rounded-full border border-border bg-card/70 p-1">
          {SECOES.map((s) => (
            <button key={s.id} aria-current={secao === s.id ? "page" : undefined} onClick={() => escolher(s.id)}
              className={cn("cursor-pointer rounded-full border-0 px-2.5 py-1.5 font-display text-[0.7rem] tracking-wide transition-colors duration-200 sm:px-5 sm:text-sm",
                secao === s.id ? "bg-ouro text-noite" : "bg-transparent text-pergaminho/80 hover:text-ouro")}>
              {s.nome}
            </button>
          ))}
        </nav>
        <button onClick={() => { setToken(null); nav("/login"); }} aria-label="Sair"
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-border bg-transparent px-3 py-1.5 font-display text-sm text-pergaminho/80 hover:border-ouro hover:text-ouro">
          <LogOut className="size-4" /><span className="hidden sm:inline">Sair</span>
        </button>
      </header>

      {/* barra lateral: foto fixa no topo + 6 ferramentas da seção atual */}
      {secao && <aside aria-label="Ferramentas" className="fixed top-16 bottom-0 left-0 z-30 flex w-[4.5rem] flex-col border-r border-border bg-card/80 animate-[entrar-lado_.45s_var(--ease-out)] sm:w-24">
        <label className="group relative grid aspect-square cursor-pointer place-items-center bg-[linear-gradient(160deg,#9e1b1b,#5c1010)]" title="Adicionar foto">
          <span className="grid size-12 place-items-center overflow-hidden rounded-full border-2 border-ouro/70 bg-noite/60 text-pergaminho/80 transition-transform duration-200 group-hover:scale-105 sm:size-16">
            {foto ? <img src={foto} alt="Sua foto" className="size-full object-cover" /> : <Silhueta />}
          </span>
          <span className="sr-only">{foto ? "Trocar foto" : "Adicionar foto"}</span>
          <input type="file" accept="image/*" className="sr-only" onChange={async (e) => {
            const a = e.target.files?.[0];
            if (a) setFoto(await lerImagem(a, 256));
          }} />
        </label>
        <ul key={secao} className="m-0 flex flex-1 list-none flex-col p-0">
          {FERRAMENTAS[secao].map((f, i) => (
            <li key={f.nome} className="flex-1 border-b border-border/70 animate-[surgir_.3s_var(--ease-out)_both]" style={{ animationDelay: `${i * 35}ms` }}>
              <button onClick={() => usar(f)} title={f.alvo ? f.nome : `${f.nome} (em breve)`}
                className={cn("flex size-full cursor-pointer flex-col items-center justify-center gap-1 border-0 bg-transparent px-1 py-2 text-center transition-colors hover:bg-input",
                  f.alvo ? "text-pergaminho hover:text-ouro" : "text-pergaminho/45")}>
                <f.icone className="size-5" strokeWidth={1.6} />
                <span className="font-display text-[0.6rem] leading-tight sm:text-[0.68rem]">{f.nome}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>}

      {carregando && <Carregando nome={SECOES.find((s) => s.id === carregando)!.nome} />}

      <main className={cn("pt-16 transition-[padding] duration-300", secao && "pl-[4.5rem] sm:pl-24")}>
        <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 py-10 sm:px-8">
          <div data-surge>
            <p className="m-0 font-display text-xs tracking-[0.25em] text-ouro uppercase">{secao ? SECOES.find((s) => s.id === secao)!.nome : "Início"}</p>
            <h1 className="mt-1 mb-0 font-display text-3xl font-semibold text-texto sm:text-4xl">Bem-vindo de volta, mestre</h1>
          </div>
          <CampanhasCriadas campanhas={campanhas} criar={(c) => setCampanhas((l) => [c, ...l])} />
          <EntidadesCriadas entidades={entidades} criar={(e) => setEntidades((l) => [...l, e])} />
          <CalendarioColaborativo campanhas={campanhas} sessoes={sessoes} setSessoes={setSessoes} impedimentos={impedimentos} setImpedimentos={setImpedimentos} />
        </div>
      </main>

      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
        {aviso && <span className="rounded-full border border-ouro/40 bg-card px-5 py-2 font-display text-sm text-pergaminho shadow-lg animate-[surgir_.2s_var(--ease-out)]">{aviso}</span>}
      </div>
    </div>
  );
}

// Tela de carregamento ao trocar de seção: símbolo com anel girando, nome da seção e barra enchendo.
function Carregando({ nome }: { nome: string }) {
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
          <img src={simbolo} alt="" className="size-24 object-contain drop-shadow-[0_0_24px_rgba(189,155,96,.45)]" />
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

// Silhueta do torso de um bonequinho, enquanto não há foto.
function Silhueta() {
  return (
    <svg viewBox="0 0 64 64" className="size-3/4" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" aria-hidden>
      <circle cx="32" cy="20" r="9" />
      <path d="M32 29v30M32 38l-15 11M32 38l15 11" />
    </svg>
  );
}
