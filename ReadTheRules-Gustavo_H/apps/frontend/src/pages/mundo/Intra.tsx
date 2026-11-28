import { useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BookMarked, Bot, ChevronDown, Dices, Flag, NotebookPen, StickyNote, Swords, Timer } from "lucide-react";
import { BotaoOuro } from "@/components/Campo";
import { cn } from "@/lib/utils";
import { iso, novoId, useRoteiros, type Bloco } from "../homeLogada/dados";
import { Modal, campoTexto } from "../homeLogada/ui";
import { salvarNota } from "../homeLogada/servidor";
import { Compendio } from "./Compendio";
import { ChatIA } from "./IA";
import { Janela } from "./Janela";
import { BarraLateral, type Ferramenta } from "./Moldura";
import { useCampanha } from "./Mundo";
import { CriarIniciativa, JanelaDados, JanelaIniciativa, JanelaTimer, mmss, useTimer, type Iniciativa } from "./Ferramentas";

type Aberta = "iniciativa" | "notas" | "timer" | "dados" | "compendio";

// Intra Sessão: o centro é um grande resumo escrito durante o jogo; a barra lateral traz as ferramentas da mesa.
export function Intra() {
  const campanha = useCampanha();
  const { sid } = useParams();
  const nav = useNavigate();
  const [roteiros, setRoteiros] = useRoteiros();
  const roteiro = roteiros.find((r) => r.id === sid && r.campanhaId === campanha.id);
  const [abertas, setAbertas] = useState<Set<Aberta>>(new Set());
  const [criarIni, setCriarIni] = useState(false);
  const [ini, setIni] = useState<Iniciativa>();
  const [nota, setNota] = useState("");
  const [timer, setTimer] = useTimer();
  const [ia, setIa] = useState(true);
  const [encerrar, setEncerrar] = useState(false);
  const foco = useRef<string>(undefined);
  const encerrando = useRef(false);

  if (encerrando.current) return null;
  if (!roteiro || roteiro.status === "encerrada") return <Navigate to={`/mundo/${campanha.id}/intra`} replace />;

  const resumo: Bloco[] = roteiro.resumo.length ? roteiro.resumo : [{ id: "inicio", tipo: "texto", texto: "" }];
  const salvarResumo = (b: Bloco[]) => setRoteiros((l) => l.map((r) => (r.id === roteiro.id ? { ...r, resumo: b } : r)));
  // Marcos (combate, nota) entram no fim do resumo, seguidos de um novo trecho de texto já focado.
  const marcar = (b: Bloco) => {
    const t: Bloco = { id: novoId(), tipo: "texto", texto: "" }; foco.current = t.id;
    const ult = resumo[resumo.length - 1];
    const base = ult?.tipo === "texto" && !ult.texto.trim() && resumo.length > 1 ? resumo.slice(0, -1) : resumo; // não deixa trechos vazios entre marcos
    salvarResumo([...base, b, t]);
  };
  const abrir = (a: Aberta) => setAbertas((s) => new Set(s).add(a));
  const fechar = (a: Aberta) => setAbertas((s) => { const n = new Set(s); n.delete(a); return n; });
  const notas = resumo.filter((b) => b.tipo === "nota").length;

  const ferramentas: Ferramenta[] = [
    { nome: ini ? "Iniciativa" : "Criar iniciativa", icone: Swords, ativa: !!ini, onClick: () => (ini ? abrir("iniciativa") : setCriarIni(true)) },
    { nome: "Notas rápidas", icone: NotebookPen, ativa: abertas.has("notas"), onClick: () => abrir("notas") },
    { nome: timer.rodando ? mmss(timer.restante) : "Timer", icone: Timer, ativa: abertas.has("timer") || timer.rodando, onClick: () => abrir("timer") },
    { nome: "Rolador de dados", icone: Dices, ativa: abertas.has("dados"), onClick: () => abrir("dados") },
    { nome: "Compêndio", icone: BookMarked, ativa: abertas.has("compendio"), onClick: () => abrir("compendio") },
    { nome: "Módulo de IA", icone: Bot, ativa: ia, onClick: () => setIa(!ia) },
  ];

  return (
    <>
      <BarraLateral ferramentas={ferramentas} chave="intra" />
      <div className="pl-[4.5rem] sm:pl-24">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-sangue-claro/50 bg-sangue/20 px-3 py-1 font-display text-xs tracking-wider text-sangue-claro uppercase">
              <span className="size-2 animate-pulse rounded-full bg-sangue-claro" /> Ao vivo
            </span>
            <h1 className="m-0 font-display text-2xl text-texto sm:text-3xl">Sessão {roteiro.numero}{roteiro.titulo && ` · ${roteiro.titulo}`}</h1>
          </div>

          {/* folha do resumo */}
          <div className="rounded-2xl border border-border bg-card/70 px-5 py-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,.9)] sm:px-8">
            <p className="mt-0 mb-4 font-display text-sm tracking-[0.15em] text-ouro uppercase">Resumo da sessão</p>
            <div className="flex flex-col gap-3">
              {resumo.map((b) => <BlocoResumo key={b.id} b={b} focar={foco.current === b.id}
                mudar={(texto) => salvarResumo(resumo.map((x) => (x.id === b.id && x.tipo === "texto" ? { ...x, texto } : x)))} />)}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <BotaoOuro className="bg-sangue text-texto shadow-[0_8px_24px_-10px_rgba(158,27,27,.8)] hover:bg-[#b52222]" onClick={() => setEncerrar(true)}><Flag /> Encerrar sessão</BotaoOuro>
          </div>
        </div>
      </div>

      {criarIni && <CriarIniciativa aoFechar={() => setCriarIni(false)} criar={(ordem) => {
        setIni({ ordem, iniciada: false, historico: [] }); setCriarIni(false); abrir("iniciativa");
        marcar({ id: novoId(), tipo: "combate", estado: "inicio" });
      }} />}
      {ini && abertas.has("iniciativa") && <JanelaIniciativa ini={ini} setIni={setIni} fechar={() => fechar("iniciativa")}
        terminar={() => { setIni(undefined); fechar("iniciativa"); marcar({ id: novoId(), tipo: "combate", estado: "fim" }); }} />}

      {abertas.has("notas") && (
        <Janela titulo={`Nota rápida ${notas + 1}`} icone={StickyNote} aoFechar={() => fechar("notas")} x={window.innerWidth - 400} y={260} largura={340}>
          <textarea aria-label="Texto da nota" autoFocus value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Anote a ideia antes que ela fuja…" className={cn(campoTexto, "min-h-32 text-base")} />
          <div className="mt-3 flex justify-end">
            <BotaoOuro className="h-10 text-sm" disabled={!nota.trim()} onClick={() => {
              marcar({ id: novoId(), tipo: "nota", n: notas + 1, texto: nota.trim() }); setNota(""); fechar("notas");
              salvarNota(campanha.id, `Sessão ${roteiro.numero} · Nota ${notas + 1}`, nota.trim(), "sessao");
            }}>Salvar nota</BotaoOuro>
          </div>
        </Janela>
      )}
      {abertas.has("timer") && <JanelaTimer t={timer} setT={setTimer} fechar={() => fechar("timer")} />}
      {abertas.has("dados") && <JanelaDados fechar={() => fechar("dados")} />}
      {abertas.has("compendio") && (
        <Janela titulo={`Compêndio · ${campanha.sistema}`} icone={BookMarked} aoFechar={() => fechar("compendio")} x={window.innerWidth - 480} y={100} largura={440}>
          <Compendio sistema={campanha.sistema} compacto />
        </Janela>
      )}

      {/* IA fixa no canto inferior esquerdo, ao lado da barra lateral */}
      <div role="complementary" aria-label="Módulo de IA" className={cn("fixed bottom-4 left-[5.25rem] z-40 overflow-hidden rounded-2xl border border-ouro/30 bg-card shadow-[0_24px_70px_-18px_rgba(0,0,0,.9)] transition-[width,height] duration-300 sm:left-28",
        ia ? "h-[26rem] w-[min(22rem,calc(100vw-6rem))]" : "h-12 w-44")}>
        <button onClick={() => setIa(!ia)} aria-expanded={ia} className="flex h-12 w-full cursor-pointer items-center gap-2 border-0 border-b border-border bg-input/60 px-4 font-display text-sm text-pergaminho">
          <Bot className="size-4 text-ouro" /> <span className="flex-1 text-left">IA · {campanha.sistema}</span>
          <ChevronDown className={cn("size-4 transition-transform", !ia && "rotate-180")} />
        </button>
        {ia && <ChatIA campanhaId={campanha.id} sistema={campanha.sistema} className="h-[calc(100%-3rem)] p-3" saudacao="Estou aqui durante a sessão. Pergunte sobre qualquer regra." />}
      </div>

      <Modal aberto={encerrar} aoFechar={() => setEncerrar(false)} titulo="Encerrar sessão?" descricao="O resumo vai para a Pós Sessão e esta sessão sai da lista de sessões para jogar.">
        <div className="flex justify-end gap-3">
          <BotaoOuro variant="outline" onClick={() => setEncerrar(false)}>Continuar jogando</BotaoOuro>
          <BotaoOuro onClick={() => {
            encerrando.current = true; // evita o redirecionamento para a escolha de sessão enquanto a navegação acontece
            nav(`/mundo/${campanha.id}/pos?sessao=${roteiro.id}`);
            setRoteiros((l) => l.map((r) => (r.id === roteiro.id ? { ...r, resumo, status: "encerrada", encerradaEm: iso(new Date()) } : r)));
          }}><Flag /> Encerrar</BotaoOuro>
        </div>
      </Modal>
    </>
  );
}

// Um trecho do resumo: texto livre, linha de combate de ponta a ponta ou a elipse de uma nota rápida.
export function BlocoResumo({ b, mudar, focar, leitura }: { b: Bloco; mudar?: (t: string) => void; focar?: boolean; leitura?: boolean }) {
  const [aberta, setAberta] = useState(false);
  if (b.tipo === "combate") return (
    <div className="relative -mx-5 my-3 flex items-center sm:-mx-8" role="separator" aria-label={b.estado === "inicio" ? "Combate iniciado" : "Combate encerrado"}>
      <div className="h-0 flex-1 border-t-2 border-dashed border-sangue-claro/80" />
      <span className={cn("mx-3 flex items-center gap-1.5 rounded-full border px-3 py-0.5 font-display text-xs tracking-wider uppercase",
        b.estado === "inicio" ? "border-sangue-claro bg-sangue/30 text-sangue-claro" : "border-pergaminho/50 bg-noite text-pergaminho")}>
        <Swords className="size-3.5" /> {b.estado === "inicio" ? "Combate iniciado" : "Combate encerrado"}
      </span>
      <div className="h-0 flex-1 border-t-2 border-dashed border-sangue-claro/80" />
    </div>
  );
  if (b.tipo === "nota") return (
    <div>
      <button onClick={() => setAberta(!aberta)} aria-expanded={aberta || leitura}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ouro/60 bg-ouro/10 px-3 py-0.5 font-display text-xs text-ouro hover:bg-ouro/20">
        <StickyNote className="size-3.5" /> Nota {b.n}
      </button>
      {(aberta || leitura) && <p className="mt-1.5 mb-0 border-l-2 border-ouro/40 pl-3 text-base text-texto/75 italic">{b.texto}</p>}
    </div>
  );
  if (leitura) return b.texto ? <p className="m-0 text-lg leading-relaxed whitespace-pre-line text-texto/90">{b.texto}</p> : null;
  return (
    <textarea aria-label="Resumo" value={b.texto} autoFocus={focar} onChange={(e) => mudar?.(e.target.value)} placeholder="Escreva o que acontece na mesa…"
      className="min-h-16 w-full resize-none border-0 bg-transparent p-0 text-lg leading-relaxed text-texto [field-sizing:content] placeholder:text-texto/30 focus:outline-none" />
  );
}
