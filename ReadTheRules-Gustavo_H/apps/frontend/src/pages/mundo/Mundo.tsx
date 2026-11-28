import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { BookMarked, Bot, CalendarDays, Feather, GitFork, History, Mountain, Plus, ScrollText, Shapes, Swords } from "lucide-react";
import { BotaoOuro } from "@/components/Campo";
import { reduzMovimento } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { nomeJogador, useCampanhas, useRoteiros, useSessoes, type Campanha, type Roteiro } from "../homeLogada/dados";
import { BarraLateral, Carregando, Foto, Sair, Simbolo, Vazio, type Ferramenta } from "./Moldura";

type Secao = "pre" | "intra" | "pos";
const SECOES: { id: Secao; nome: string }[] = [
  { id: "pre", nome: "Pré Sessão" }, { id: "intra", nome: "Intra Sessão" }, { id: "pos", nome: "Pós Sessão" },
];
const FERRAMENTAS_PRE = [
  { nome: "Criar entidades", icone: Shapes, rota: "entidades" },
  { nome: "Linha do tempo", icone: History, rota: "linha-do-tempo" },
  { nome: "Árvore de ideias", icone: GitFork, rota: "ideias" },
  { nome: "Calendário", icone: CalendarDays, rota: "calendario" },
  { nome: "Compêndio", icone: BookMarked, rota: "compendio" },
  { nome: "Módulo de IA", icone: Bot, rota: "ia" },
];

export const useCampanha = () => useOutletContext<Campanha>();

// Página da campanha ("Escrever Mundo"): barra superior com as seções e, depois de escolher uma, a barra lateral.
export default function Mundo() {
  const { id } = useParams();
  const [campanhas] = useCampanhas();
  const campanha = campanhas.find((c) => c.id === id);
  const { pathname } = useLocation();
  const nav = useNavigate();
  const base = `/mundo/${id}`;
  const resto = pathname.slice(base.length).replace(/^\//, "");
  const [preAberta, setPreAberta] = useState(false);
  const [carregando, setCarregando] = useState<Secao | null>(null);

  const secaoDaRota: Secao | null = resto.startsWith("intra") ? "intra" : resto.startsWith("pos") ? "pos" : resto ? "pre" : null;
  const secao = secaoDaRota ?? (preAberta ? "pre" : null);

  const escolher = (s: Secao) => {
    if (carregando) return;
    setCarregando(s);
    window.setTimeout(() => {
      setCarregando(null);
      if (s === "pre") { setPreAberta(true); if (secaoDaRota !== "pre") nav(base); }
      else nav(`${base}/${s}`);
    }, reduzMovimento() ? 250 : 1400);
  };

  if (!campanha) return (
    <div className="grid min-h-svh place-items-center bg-noite p-6 font-serif text-texto">
      <Vazio icone={Mountain} titulo="Campanha não encontrada" texto="Ela pode ter sido apagada deste navegador." acao={<Link to="/" className="font-display text-ouro">Voltar ao início</Link>} />
    </div>
  );

  const ferramentas: Ferramenta[] = FERRAMENTAS_PRE.map((f) => ({ nome: f.nome, icone: f.icone, ativa: resto.startsWith(f.rota), onClick: () => nav(`${base}/${f.rota}`) }));

  return (
    <div className="min-h-svh bg-noite font-serif text-texto">
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-noite/85 px-3 backdrop-blur-md sm:px-6">
        <Link to="/" aria-label="Voltar para a home" className="shrink-0"><Simbolo className="size-9" /></Link>
        <Link to={base} className="hidden max-w-56 truncate font-display text-base text-ouro hover:text-texto lg:block">{campanha.nome}</Link>
        <nav aria-label="Seções" className="mx-auto flex gap-1 rounded-full border border-border bg-card/70 p-1">
          {SECOES.map((s) => (
            <button key={s.id} aria-current={secao === s.id ? "page" : undefined} onClick={() => escolher(s.id)}
              className={cn("cursor-pointer rounded-full border-0 px-2.5 py-1.5 font-display text-[0.7rem] tracking-wide transition-colors duration-200 sm:px-5 sm:text-sm",
                secao === s.id ? "bg-ouro text-noite" : "bg-transparent text-pergaminho/80 hover:text-ouro")}>
              {s.nome}
            </button>
          ))}
        </nav>
        <Foto className="size-10" />
        <Sair />
      </header>

      {secao === "pre" && <BarraLateral ferramentas={ferramentas} chave="pre" />}
      {carregando && <Carregando nome={SECOES.find((s) => s.id === carregando)!.nome} />}

      <main className={cn("pt-16 transition-[padding] duration-300", secao === "pre" && "pl-[4.5rem] sm:pl-24")}>
        <Outlet context={campanha} />
      </main>
    </div>
  );
}

// Topo da campanha: nome sobre a imagem de capa (referência "Imagem 1").
export function Capa({ campanha, pequena }: { campanha: Campanha; pequena?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden border-b border-ouro/30", pequena ? "h-40" : "h-64 sm:h-80")}>
      {campanha.imagem
        ? <img src={campanha.imagem} alt="" className="absolute inset-0 size-full object-cover" />
        : <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(189,155,96,.35),transparent_60%),linear-gradient(160deg,#3a2f1e,#1f1f29_60%,#14141c)]" />}
      <div className="absolute inset-0 bg-gradient-to-t from-noite via-noite/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-6 sm:px-8">
        <p className="m-0 font-display text-xs tracking-[0.25em] text-ouro uppercase">{campanha.sistema} · Nível {campanha.nivel}</p>
        <h1 className={cn("mt-1 mb-0 font-display font-semibold text-texto drop-shadow-[0_2px_12px_rgba(0,0,0,.8)]", pequena ? "text-2xl sm:text-3xl" : "text-4xl sm:text-5xl")}>{campanha.nome}</h1>
      </div>
    </div>
  );
}

export function VisaoGeral() {
  const campanha = useCampanha();
  const [roteiros] = useRoteiros();
  const [sessoes] = useSessoes();
  const nav = useNavigate();
  const minhas = roteiros.filter((r) => r.campanhaId === campanha.id).sort((a, b) => a.numero - b.numero);
  const escrever = () => nav(`/mundo/${campanha.id}/sessao/nova`);

  return (
    <>
      <Capa campanha={campanha} />
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-8">
        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          <p className="m-0 text-lg leading-relaxed text-texto/85">{campanha.descricao || "Sem descrição."}</p>
          <div className="rounded-xl border border-border bg-card/60 p-4">
            <p className="m-0 font-display text-sm text-pergaminho">Jogadores</p>
            <p className="mt-1 mb-0 text-base text-texto/70">{campanha.jogadores.length ? campanha.jogadores.map(nomeJogador).join(", ") : "Nenhum ainda."}</p>
          </div>
        </div>

        <section aria-labelledby="t-sessoes">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 id="t-sessoes" className="m-0 font-display text-2xl font-semibold text-sangue-claro sm:text-3xl">Sessões</h2>
            {minhas.length > 0 && <BotaoOuro onClick={escrever}><Plus /> Escrever sessão</BotaoOuro>}
          </div>
          {minhas.length === 0 ? (
            <Vazio icone={ScrollText} titulo="Nenhuma sessão ainda" texto="Comece escrevendo a primeira sessão desta campanha."
              acao={<BotaoOuro onClick={escrever}><Plus /> Escrever primeira sessão</BotaoOuro>} />
          ) : (
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 p-0">
              {minhas.map((r) => <CartaoSessao key={r.id} r={r} data={sessoes.find((s) => s.id === r.sessaoId)?.data} />)}
            </ul>
          )}
        </section>

        <p className="m-0 flex items-center gap-2 text-base text-texto/55">
          <Swords className="size-4" /> Use a barra de cima para entrar na Pré, Intra ou Pós Sessão desta campanha.
        </p>
      </div>
    </>
  );
}

function CartaoSessao({ r, data }: { r: Roteiro; data?: string }) {
  return (
    <li>
      <Link to={`/mundo/${r.campanhaId}/sessao/${r.id}`} className="flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-5 text-texto transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-ouro/50">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-xs tracking-wider text-ouro uppercase">Sessão {r.numero}</span>
          <span className={cn("rounded-full border px-2 py-0.5 text-xs", r.status === "encerrada" ? "border-emerald-400/40 text-emerald-300" : "border-pergaminho/40 text-pergaminho")}>
            {r.status === "encerrada" ? "Encerrada" : "Rascunho"}
          </span>
        </div>
        <span className="font-display text-lg leading-tight">{r.titulo || "Sem título"}</span>
        <span className="line-clamp-2 text-base text-texto/60">{r.texto || "Ainda em branco."}</span>
        <span className="mt-auto flex items-center gap-1.5 pt-2 text-sm text-texto/50">
          <Feather className="size-3.5" /> {data ? `Anexada ao dia ${data.split("-").reverse().join("/")}` : "Sem dia no calendário"}
        </span>
      </Link>
    </li>
  );
}

// Intra Sessão começa escolhendo qual sessão escrita será jogada.
export function EscolherSessao() {
  const campanha = useCampanha();
  const [roteiros] = useRoteiros();
  const nav = useNavigate();
  const abertas = roteiros.filter((r) => r.campanhaId === campanha.id && r.status === "rascunho").sort((a, b) => a.numero - b.numero);
  return (
    <>
      <Capa campanha={campanha} pequena />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <h2 className="mt-0 mb-2 font-display text-2xl text-sangue-claro">Qual sessão vai ser jogada?</h2>
        {abertas.length === 0 ? (
          <Vazio icone={ScrollText} titulo="Nenhuma sessão para jogar"
            texto="Para entrar na Intra Sessão, escreva uma sessão primeiro. Sessões já encerradas ficam na Pós Sessão."
            acao={<BotaoOuro onClick={() => nav(`/mundo/${campanha.id}/sessao/nova`)}><Plus /> Escrever sessão</BotaoOuro>} />
        ) : (
          <ul className="m-0 mt-6 flex list-none flex-col gap-3 p-0">
            {abertas.map((r) => (
              <li key={r.id}>
                <button onClick={() => nav(`/mundo/${campanha.id}/intra/${r.id}`)}
                  className="flex w-full cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-ouro/60">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full border border-ouro/40 font-display text-lg text-ouro">{r.numero}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg text-texto">{r.titulo || `Sessão ${r.numero}`}</span>
                    <span className="block truncate text-base text-texto/60">{r.texto || "Sem roteiro escrito."}</span>
                  </span>
                  <Swords className="size-5 text-ouro" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
