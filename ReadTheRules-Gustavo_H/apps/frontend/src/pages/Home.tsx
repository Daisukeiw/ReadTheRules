import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Play, ChevronDown, Check, X as Fechar, Clock } from "lucide-react";
import { gsap, useGSAP, reduzMovimento } from "@/lib/gsap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BotaoOuro } from "@/components/Campo";
import Particles from "@/components/reactbits/Particles";
import SplitText from "@/components/reactbits/SplitText";
import AnimatedContent from "@/components/reactbits/AnimatedContent";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import simbolo from "@/assets/logo-simbolo.png";
import { FASES, GLOSSARIO, SISTEMAS, SOBRE, TTRPG, type Fase } from "./home/conteudo";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="min-h-svh bg-noite font-serif text-texto">
      <Topo />
      <Hero />
      <main className="mx-auto flex max-w-6xl flex-col gap-28 px-4 pb-28 sm:px-8">
        <Sobre />
        <Paginas />
        <Ttrpg />
        <Sistemas />
        <Calendario />
      </main>
      <Rodape />
    </div>
  );
}

function Topo() {
  return (
    <header className="sticky top-0 z-40 border-b border-ouro/25 bg-noite/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
        <a href="#topo" className="flex items-center gap-3 text-ouro" aria-label="Read the Rules, início">
          <img src={simbolo} alt="" className="h-10 w-auto" />
          <span className="hidden font-display text-lg font-semibold tracking-wider sm:inline">READ THE RULES</span>
        </a>
        <nav className="flex items-center gap-2 sm:gap-3">
          <BotaoOuro asChild variant="outline" className="h-9 px-4 text-sm sm:px-5"><Link to="/login">Entrar</Link></BotaoOuro>
          <BotaoOuro asChild className="h-9 px-4 text-sm sm:px-5"><Link to="/cadastro">Criar conta</Link></BotaoOuro>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  const raiz = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (reduzMovimento()) return;
    gsap.from(".hero-logo", { opacity: 0, y: 24, scale: 0.92, filter: "blur(12px)", duration: 1.4, ease: "rtr-out" });
    gsap.to(".hero-logo", { y: -10, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.4 });
    gsap.from(".hero-surge", { opacity: 0, y: 14, duration: 0.8, stagger: 0.08, ease: "rtr-out", delay: 1.1 });
    // O símbolo afunda e some devagar quando a página desce.
    gsap.to(".hero-conteudo", { yPercent: 18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: raiz.current, start: "top top", end: "bottom top", scrub: true } });
  }, { scope: raiz });

  return (
    <section id="topo" ref={raiz} className="relative isolate flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden px-4">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Particles particleCount={160} particleSpread={12} speed={0.06} particleColors={["#bd9b60", "#d4c2a1", "#9e1b1b"]} particleBaseSize={70} alphaParticles glow={0.6} twinkle={0.5} moveParticlesOnHover={false} disableRotation drift="up" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_42%,rgba(189,155,96,.13),transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-noite" />
      </div>

      <div className="hero-conteudo flex max-w-3xl flex-col items-center text-center">
        <img src={simbolo} alt="" className="hero-logo w-[min(46vw,210px)] drop-shadow-[0_20px_45px_rgba(158,27,27,.35)]" />
        <h1 className="m-0 mt-8 flex flex-col items-center">
          <SplitText
            tag="span"
            text="Bem-vindo ao"
            className="block font-display text-[clamp(1.4rem,3.2vw,2.1rem)] font-normal tracking-[0.12em] text-pergaminho uppercase"
            splitType="chars"
            effect="blur"
            delay={35}
            duration={0.9}
            trigger="load"
          />
          <SplitText
            tag="span"
            text="Read the Rules"
            className="block font-display text-[clamp(2.6rem,8vw,5.5rem)] leading-[1.05] font-bold tracking-[0.02em] text-ouro uppercase"
            splitType="chars"
            effect="rise"
            delay={45}
            duration={1}
            trigger="load"
          />
        </h1>
        <p className="hero-surge mt-6 max-w-xl text-xl leading-relaxed text-texto/85">
          Suas regras, seu mundo e suas sessões num só lugar, com uma IA que responde direto dos seus livros.
        </p>
        <div className="hero-surge mt-9 flex flex-wrap justify-center gap-3">
          <BotaoOuro asChild className="px-8"><Link to="/cadastro">Começar minha campanha</Link></BotaoOuro>
          <BotaoOuro asChild variant="outline" className="px-8"><a href="#sobre">Conhecer o site</a></BotaoOuro>
        </div>
      </div>

      <a href="#sobre" aria-label="Rolar para baixo" className="hero-surge absolute bottom-6 left-1/2 -translate-x-1/2 text-pergaminho/60 transition-colors duration-200 hover:text-ouro">
        <ChevronDown className="size-7 motion-safe:animate-bounce" />
      </a>
    </section>
  );
}

/* ---------- Peças comuns ---------- */

function Titulo({ id, children }: { id: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (reduzMovimento()) return;
    gsap.from(ref.current!.querySelector("path"), { drawSVG: "50% 50%", duration: 1.1, ease: "rtr-out", scrollTrigger: { trigger: ref.current, start: "top 85%" } });
  }, { scope: ref });
  return (
    <div ref={ref} className="mb-8 flex flex-col gap-3">
      <h2 id={id} className="m-0 scroll-mt-24 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-semibold text-texto">{children}</h2>
      <svg aria-hidden viewBox="0 0 320 12" className="h-3 w-64 text-ouro" fill="none">
        <path d="M0 6 H140 L150 1 L160 6 L170 11 L180 6 H320" stroke="currentColor" strokeWidth="1.2" />
        <rect x="155.8" y="1.8" width="8.4" height="8.4" transform="rotate(45 160 6)" fill="#9e1b1b" />
      </svg>
    </div>
  );
}

const Painel = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("rounded-2xl border border-white/[0.06] bg-card shadow-[0_30px_70px_-35px_rgba(0,0,0,.8)]", className)}>{children}</div>
);

const Revela = ({ children }: { children: React.ReactNode }) => (
  <AnimatedContent distance={40} duration={0.9} ease="rtr-out" initialOpacity={0} blur={6} threshold={0.15}>{children}</AnimatedContent>
);

/* ---------- 1. O que é ---------- */

function Sobre() {
  return (
    <section aria-labelledby="sobre" className="pt-8">
      <Titulo id="sobre">O que é o Read the Rules?</Titulo>
      <Revela>
        <Painel className="grid gap-8 p-7 sm:p-10 md:grid-cols-[1.4fr_1fr] md:gap-12">
          <div className="flex max-w-[65ch] flex-col gap-4 text-lg leading-relaxed text-texto/90">
            {SOBRE.slice(0, -1).map((p) => <p key={p} className="m-0">{p}</p>)}
          </div>
          <blockquote className="m-0 flex items-center border-t border-ouro/20 pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-12">
            <p className="m-0 font-display text-[clamp(1.4rem,2.4vw,1.9rem)] leading-snug text-ouro">{SOBRE.at(-1)}</p>
          </blockquote>
        </Painel>
      </Revela>
    </section>
  );
}

/* ---------- 2. Páginas do site ---------- */

function Paginas() {
  return (
    <section aria-labelledby="paginas">
      <Titulo id="paginas">Páginas do site</Titulo>
      <Revela>
        <Tabs defaultValue={FASES[0].id} className="gap-0">
          <TabsList variant="line" className="h-auto max-w-full gap-1 overflow-x-auto p-0 sm:pl-4">
            {FASES.map((f) => (
              <TabsTrigger
                key={f.id}
                value={f.id}
                className={cn(
                  "h-11 flex-none rounded-b-none rounded-t-lg border-0 px-3 font-display text-[0.8rem] tracking-wide sm:px-6 sm:text-base",
                  "bg-card/60 text-pergaminho/70 transition-colors duration-200 hover:text-pergaminho after:hidden",
                  "data-[state=active]:bg-sangue data-[state=active]:text-texto dark:data-[state=active]:bg-sangue dark:data-[state=active]:text-texto",
                )}
              >
                {f.nome}
              </TabsTrigger>
            ))}
          </TabsList>
          {FASES.map((f) => (
            <TabsContent key={f.id} value={f.id} className="data-[state=active]:motion-safe:animate-[surgir_.35s_var(--ease-out)]">
              <Painel className="rounded-tl-none border-t-2 border-t-sangue p-6 sm:p-10">
                <p className="mt-0 mb-10 max-w-[70ch] text-lg leading-relaxed text-texto/90">{f.intro}</p>
                <ListaFerramentas fase={f} />
              </Painel>
            </TabsContent>
          ))}
        </Tabs>
      </Revela>
    </section>
  );
}

function ListaFerramentas({ fase }: { fase: Fase }) {
  const [aberta, setAberta] = useState(0);
  return (
    <ol className="relative m-0 flex list-none flex-col gap-5 p-0">
      <span aria-hidden className="absolute top-4 bottom-4 left-[11px] w-px bg-gradient-to-b from-ouro/50 via-sangue/50 to-transparent" />
      {fase.ferramentas.map((t, i) => {
        const ativa = aberta === i;
        const painelId = `${fase.id}-${i}`;
        return (
          <li key={t.nome} className="relative pl-10">
            <span aria-hidden className={cn("absolute top-2.5 left-0 size-[23px] rounded-full border-2 transition-colors duration-300", ativa ? "border-ouro bg-sangue" : "border-pergaminho/40 bg-noite")} />
            <button
              type="button"
              aria-expanded={ativa}
              aria-controls={painelId}
              onClick={() => setAberta(ativa ? -1 : i)}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-md border px-5 font-display text-base tracking-wide",
                "transition-[background-color,border-color,color,transform] duration-200 ease-[var(--ease-out)] active:scale-[0.97]",
                ativa ? "border-sangue bg-sangue text-texto" : "border-pergaminho/30 bg-transparent text-pergaminho hover:border-ouro hover:text-ouro",
              )}
            >
              {t.nome}
              <ChevronDown className={cn("size-4 transition-transform duration-300 ease-[var(--ease-out)]", ativa && "rotate-180")} />
            </button>
            <div id={painelId} className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out)]", ativa ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
              <div className="overflow-hidden" {...(ativa ? {} : { inert: "" })} /* React 18 não tipa inert */>
                <div className="mt-4 grid gap-6 rounded-xl border border-white/5 bg-input/60 p-5 sm:p-7 lg:grid-cols-[1.15fr_1fr] lg:items-center">
                  <div className="flex flex-col gap-3 text-[1.05rem] leading-relaxed text-texto/90">
                    {t.texto.map((p) => <p key={p} className="m-0">{p}</p>)}
                  </div>
                  <EspacoVideo nome={t.nome} />
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// Espaço reservado para o vídeo de demonstração de cada ferramenta.
function EspacoVideo({ nome }: { nome: string }) {
  return (
    <div role="img" aria-label={`Vídeo de demonstração de ${nome} (em breve)`} className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-ouro/20 bg-[linear-gradient(135deg,#1a1a23,#262632)]">
      <div className="flex size-16 items-center justify-center rounded-full border border-ouro/50 bg-noite/70 text-ouro">
        <Play className="ml-1 size-7" />
      </div>
      <span className="absolute bottom-3 left-4 font-display text-xs tracking-widest text-pergaminho/60 uppercase">Vídeo em breve</span>
    </div>
  );
}

/* ---------- 3. TTRPG ---------- */

function Ttrpg() {
  return (
    <section aria-labelledby="ttrpg">
      <Titulo id="ttrpg">O que é TTRPG?</Titulo>
      <Revela>
        <Painel className="p-7 sm:p-10">
          <div className="flex max-w-[70ch] flex-col gap-4 text-lg leading-relaxed text-texto/90">
            {TTRPG.map((p) => <p key={p} className="m-0">{p}</p>)}
          </div>
          <h3 className="mt-10 mb-5 font-display text-lg text-pergaminho">Palavras que você vai ouvir na mesa</h3>
          <dl className="m-0 grid gap-x-10 sm:grid-cols-2">
            {GLOSSARIO.map((g) => (
              <div key={g.termo} className="border-t border-white/[0.07] py-4">
                <dt className="font-display text-base font-semibold text-ouro">{g.termo}</dt>
                <dd className="m-0 mt-1 leading-relaxed text-texto/80">{g.def}</dd>
              </div>
            ))}
          </dl>
        </Painel>
      </Revela>
    </section>
  );
}

/* ---------- 4. Sistemas ---------- */

function Sistemas() {
  return (
    <section aria-labelledby="sistemas">
      <Titulo id="sistemas">Sistemas implementados</Titulo>
      <Revela>
        <Painel className="p-4 sm:p-8">
          <Tabs defaultValue={SISTEMAS[0].id} orientation="vertical" className="flex-col gap-6 md:flex-row md:gap-8">
            <TabsList variant="line" className="grid h-auto w-full grid-cols-2 gap-3 bg-transparent p-0 md:flex md:w-60 md:shrink-0 md:flex-col">
              {SISTEMAS.map((s) => (
                <TabsTrigger
                  key={s.id}
                  value={s.id}
                  aria-label={s.nome}
                  className={cn(
                    "h-24 w-full rounded-xl border border-white/[0.08] bg-input/50 px-4 py-3 after:hidden md:h-28",
                    "transition-[border-color,background-color,box-shadow,transform] duration-200 ease-[var(--ease-out)] hover:border-ouro/50 active:scale-[0.98]",
                    "data-[state=active]:border-ouro data-[state=active]:bg-input data-[state=active]:shadow-[0_10px_30px_-12px_rgba(189,155,96,.45)] dark:data-[state=active]:border-ouro dark:data-[state=active]:bg-input",
                  )}
                >
                  <img src={s.logo} alt="" className="max-h-full max-w-full object-contain" />
                </TabsTrigger>
              ))}
            </TabsList>
            {SISTEMAS.map((s) => (
              <TabsContent key={s.id} value={s.id} className="min-w-0 data-[state=active]:motion-safe:animate-[surgir_.35s_var(--ease-out)]">
                <SpotlightCard className="h-full rounded-xl border border-white/[0.06] bg-noite/70 p-6 sm:p-9" spotlightColor="rgba(189, 155, 96, 0.14)">
                  <h3 className="m-0 font-display text-2xl text-ouro">{s.nome}</h3>
                  <ul className="mt-4 mb-6 flex list-none flex-wrap gap-2 p-0">
                    {s.destaques.map((d) => (
                      <li key={d} className="rounded-full border border-sangue/60 bg-sangue/15 px-3 py-1 font-display text-xs tracking-wide text-pergaminho">{d}</li>
                    ))}
                  </ul>
                  <div className="flex max-w-[70ch] flex-col gap-4 text-lg leading-relaxed text-texto/90">
                    {s.resumo.map((p) => <p key={p} className="m-0">{p}</p>)}
                  </div>
                </SpotlightCard>
              </TabsContent>
            ))}
          </Tabs>
        </Painel>
      </Revela>
    </section>
  );
}

/* ---------- 5. Calendário (demonstração) ---------- */

const SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const JOGADORES = [
  { nome: "Marina", resposta: "sim" as const },
  { nome: "Rafa", resposta: "sim" as const },
  { nome: "Léo", resposta: "nao" as const },
  { nome: "Bia", resposta: "pendente" as const },
];

function Calendario() {
  // Mês de exemplo fixo, para a demonstração ser sempre igual.
  const ano = 2026, mes = 11; // dezembro
  const inicio = new Date(ano, mes, 1).getDay();
  const dias = new Date(ano, mes + 1, 0).getDate();
  const celulas = [...Array(inicio).fill(null), ...Array.from({ length: dias }, (_, i) => i + 1)];
  while (celulas.length % 7) celulas.push(null);

  const PASSADA = 5, PROPOSTA = 19, OUTRA = 12;
  const [selecionado, setSelecionado] = useState(PROPOSTA);
  const [minha, setMinha] = useState<"sim" | "nao" | "pendente">("pendente");

  const respostas = [...JOGADORES, { nome: "Você", resposta: minha }];
  const confirmados = respostas.filter((r) => r.resposta === "sim").length;

  return (
    <section aria-labelledby="calendario">
      <Titulo id="calendario">Calendário colaborativo</Titulo>
      <Revela>
        <Painel className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-6 py-5 sm:px-8">
            <p className="m-0 font-display text-2xl text-sangue-claro">Dezembro <span className="text-pergaminho/70">2026</span></p>
            <p className="m-0 rounded-full border border-ouro/30 px-3 py-1 text-sm text-pergaminho/80">Demonstração: nada aqui é salvo</p>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px]">
            <div className="p-3 sm:p-6">
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {SEMANA.map((d) => (
                  <div key={d} className="rounded-md bg-ouro py-2 text-center font-display text-xs font-semibold tracking-wider text-noite uppercase sm:text-sm">{d}</div>
                ))}
                {celulas.map((dia, i) => {
                  if (!dia) return <div key={i} aria-hidden className="aspect-square rounded-md bg-white/[0.02] sm:aspect-[4/3]" />;
                  const evento = dia === PROPOSTA || dia === PASSADA || dia === OUTRA;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!evento}
                      onClick={() => setSelecionado(dia)}
                      aria-pressed={selecionado === dia}
                      aria-label={`${dia} de dezembro${dia === PROPOSTA ? ", sessão proposta" : dia === PASSADA ? ", sessão realizada" : dia === OUTRA ? ", sessão recusada pelo grupo" : ""}`}
                      className={cn(
                        "relative flex aspect-square flex-col items-start justify-between rounded-md border p-1.5 text-left font-display text-sm tabular-nums sm:aspect-[4/3] sm:p-2.5 sm:text-lg",
                        "transition-[background-color,border-color,transform] duration-200 ease-[var(--ease-out)]",
                        evento ? "cursor-pointer active:scale-[0.96]" : "cursor-default",
                        dia === PROPOSTA ? "border-ouro bg-ouro text-noite" : "border-white/[0.06] bg-input/50 text-texto/70",
                        dia === PASSADA && "border-pergaminho/30 text-texto",
                        dia === OUTRA && "border-sangue/60 text-texto",
                        selecionado === dia && dia !== PROPOSTA && "border-ouro",
                        selecionado === dia && "ring-2 ring-ouro/40 ring-offset-2 ring-offset-card",
                      )}
                    >
                      {dia}
                      {evento && (
                        <span className={cn("hidden w-full truncate font-serif text-xs sm:block", dia === PROPOSTA ? "text-noite/80" : "text-pergaminho/70")}>
                          {dia === PROPOSTA ? "Sessão 12" : dia === PASSADA ? "Sessão 11" : "Recusada"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="border-t border-white/[0.06] bg-noite/40 p-6 sm:p-8 lg:border-t-0 lg:border-l" aria-live="polite">
              {selecionado === PROPOSTA ? (
                <>
                  <h3 className="m-0 mb-1 font-display text-xl text-texto">Sessão 12: A Cripta de Vel’Ahra</h3>
                  <p className="m-0 mb-2 text-sm text-ouro">Proposta do mestre</p>
                  <p className="m-0 flex items-center gap-2 text-pergaminho/80"><Clock className="size-4" /> Sábado, 19 de dezembro, às 19h</p>
                  <p className="mt-6 mb-3 text-sm text-texto/70">{confirmados} de {respostas.length} confirmaram</p>
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {respostas.map((r) => (
                      <li key={r.nome} className="flex items-center justify-between rounded-md bg-input/60 px-3 py-2">
                        <span className={r.nome === "Você" ? "font-semibold text-texto" : "text-texto/85"}>{r.nome}</span>
                        <Resposta r={r.resposta} />
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex gap-2">
                    <BotaoOuro className="h-10 flex-1 px-4 text-sm" onClick={() => setMinha("sim")} aria-pressed={minha === "sim"}>Aceitar</BotaoOuro>
                    <BotaoOuro variant="outline" className="h-10 flex-1 px-4 text-sm" onClick={() => setMinha("nao")} aria-pressed={minha === "nao"}>Recusar</BotaoOuro>
                  </div>
                </>
              ) : selecionado === PASSADA ? (
                <>
                  <h3 className="m-0 mb-1 font-display text-xl text-texto">Sessão 11: O Mapa Rasgado</h3>
                  <p className="m-0 mb-2 text-sm text-pergaminho/70">Sessão realizada</p>
                  <p className="m-0 text-pergaminho/80">Sábado, 5 de dezembro. Todos os 5 jogadores estiveram presentes.</p>
                </>
              ) : (
                <>
                  <h3 className="m-0 mb-1 font-display text-xl text-texto">Sábado, 12 de dezembro</h3>
                  <p className="m-0 mb-2 text-sm text-sangue-claro">Proposta recusada</p>
                  <p className="m-0 text-pergaminho/80">Três jogadores não podiam, então o mestre propôs uma nova data: dia 19.</p>
                </>
              )}
            </aside>
          </div>
        </Painel>
      </Revela>
    </section>
  );
}

function Resposta({ r }: { r: "sim" | "nao" | "pendente" }) {
  if (r === "sim") return <span className="flex items-center gap-1 text-sm text-ouro"><Check className="size-4" /> Vai</span>;
  if (r === "nao") return <span className="flex items-center gap-1 text-sm text-sangue-claro"><Fechar className="size-4" /> Não vai</span>;
  return <span className="text-sm text-texto/50">Aguardando</span>;
}

/* ---------- Rodapé ---------- */

const REDES = [
  { nome: "X", href: "https://x.com", d: "M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z" },
  { nome: "Facebook", href: "https://facebook.com", d: "M14 8.5V6.8c0-.8.5-1 1-1h2.3V2.1L14.2 2C10.8 2 10 4.5 10 6.2v2.3H7.6v3.9H10V22h4v-9.6h3l.4-3.9H14Z" },
  { nome: "Instagram", href: "https://instagram.com", d: "M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Zm6.1-8.1a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21.9 8.1c-.1-1.6-.4-3-1.6-4.2-1.2-1.2-2.6-1.5-4.2-1.6-1.6-.1-6.6-.1-8.3 0-1.6.1-3 .4-4.2 1.6S2.2 6.5 2.1 8.1c-.1 1.6-.1 6.6 0 8.3.1 1.6.4 3 1.6 4.2 1.2 1.2 2.6 1.5 4.2 1.6 1.6.1 6.6.1 8.3 0 1.6-.1 3-.4 4.2-1.6 1.2-1.2 1.5-2.6 1.6-4.2.1-1.6.1-6.6-.1-8.3Zm-2.1 10.1a3.3 3.3 0 0 1-1.9 1.9c-1.3.5-4.4.4-5.9.4s-4.6.1-5.9-.4a3.3 3.3 0 0 1-1.9-1.9c-.5-1.3-.4-4.4-.4-5.9s-.1-4.6.4-5.9a3.3 3.3 0 0 1 1.9-1.9c1.3-.5 4.4-.4 5.9-.4s4.6-.1 5.9.4a3.3 3.3 0 0 1 1.9 1.9c.5 1.3.4 4.4.4 5.9s.1 4.6-.4 5.9Z" },
];

function Rodape() {
  return (
    <footer className="border-t border-ouro/25 bg-[#101017]">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-8 md:grid-cols-3">
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-pergaminho/80">
          <li><a href="https://www.dndbeyond.com/srd" target="_blank" rel="noreferrer" className="text-pergaminho/80 underline-offset-4 transition-colors duration-200 hover:text-ouro hover:underline">SRD do D&amp;D</a></li>
          <li><a href="https://2e.aonprd.com" target="_blank" rel="noreferrer" className="text-pergaminho/80 underline-offset-4 transition-colors duration-200 hover:text-ouro hover:underline">Regras do Pathfinder</a></li>
          <li><span className="text-pergaminho/50">Termos de Uso (em breve)</span></li>
        </ul>
        <div className="flex justify-center gap-4">
          {REDES.map((r) => (
            <a key={r.nome} href={r.href} target="_blank" rel="noreferrer" aria-label={r.nome} className="flex size-11 items-center justify-center rounded-full border border-pergaminho/25 text-pergaminho transition-[color,border-color,transform] duration-200 ease-[var(--ease-out)] hover:border-ouro hover:text-ouro active:scale-[0.94]">
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden><path d={r.d} /></svg>
            </a>
          ))}
        </div>
        <div className="flex flex-col items-center gap-3 md:items-end">
          <p className="m-0 text-pergaminho/80">Não possui uma conta?</p>
          <BotaoOuro asChild className="h-10 px-6 text-sm"><Link to="/cadastro">Criar conta</Link></BotaoOuro>
        </div>
      </div>
      <p className="m-0 pb-8 text-center text-sm text-texto/40">© {new Date().getFullYear()} Read the Rules. As marcas dos sistemas pertencem aos seus donos.</p>
    </footer>
  );
}
