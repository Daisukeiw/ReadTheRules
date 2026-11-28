import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Dices, Flag, Pause, Play, Plus, RotateCcw, Swords, Timer as TimerIcone, X } from "lucide-react";
import { BotaoOuro, Campo } from "@/components/Campo";
import { Flip, reduzMovimento } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { novoId } from "../homeLogada/dados";
import { Modal } from "../homeLogada/ui";
import { Janela } from "./Janela";

/* ---------- Iniciativa ---------- */

export type Combatente = { id: string; nome: string };
export type Iniciativa = { ordem: Combatente[]; iniciada: boolean; historico: string[] };

// Pop-up para montar a iniciativa antes do combate.
export function CriarIniciativa({ aoFechar, criar }: { aoFechar: () => void; criar: (ordem: Combatente[]) => void }) {
  const [lista, setLista] = useState<Combatente[]>([]);
  const [nome, setNome] = useState("");
  const add = () => { if (nome.trim()) { setLista([...lista, { id: novoId(), nome: nome.trim() }]); setNome(""); } };
  return (
    <Modal aberto aoFechar={aoFechar} titulo="Criar iniciativa" descricao="Adicione os seres na ordem da iniciativa. Dá para reordenar depois, arrastando.">
      <form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <div className="flex-1"><Campo label="Nome" autoFocus value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ayla, Goblin 1…" /></div>
        <BotaoOuro type="submit" variant="outline" disabled={!nome.trim()}><Plus /> Adicionar</BotaoOuro>
      </form>
      <ol className="mt-4 mb-0 flex list-none flex-col gap-2 p-0">
        {lista.map((c, i) => (
          <li key={c.id} className="flex items-center gap-3 rounded-full border border-border bg-input/50 py-1.5 pr-2 pl-4">
            <span className="font-display text-sm text-ouro">{i + 1}</span>
            <span className="flex-1 text-lg">{c.nome}</span>
            <button aria-label={`Remover ${c.nome}`} onClick={() => setLista(lista.filter((x) => x.id !== c.id))} className="grid size-7 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-texto/50 hover:text-sangue-claro"><X className="size-4" /></button>
          </li>
        ))}
        {!lista.length && <li className="text-base text-texto/50">Ninguém na iniciativa ainda.</li>}
      </ol>
      <div className="mt-6 flex justify-end gap-3">
        <BotaoOuro variant="outline" onClick={aoFechar}>Cancelar</BotaoOuro>
        <BotaoOuro disabled={lista.length < 2} onClick={() => criar(lista)}><Swords /> Criar iniciativa</BotaoOuro>
      </div>
    </Modal>
  );
}

// Iniciativa em andamento: nomes em cima (andam a cada turno e podem ser arrastados), histórico e botões.
export function JanelaIniciativa({ ini, setIni, terminar, fechar }: {
  ini: Iniciativa; setIni: (i: Iniciativa) => void; terminar: () => void; fechar: () => void;
}) {
  const fila = useRef<HTMLOListElement>(null);
  const estado = useRef<Flip.FlipState>(undefined);
  const hist = useRef<HTMLDivElement>(null);
  const [arrastado, setArrastado] = useState<number>();
  const [adicionar, setAdicionar] = useState(false);
  const [novo, setNovo] = useState("");

  // Guarda as posições antes da mudança e anima até as novas (o nome da vez vai para o fim da fila).
  const animar = (prox: Iniciativa) => { if (!reduzMovimento()) estado.current = Flip.getState(fila.current!.children); setIni(prox); };
  useLayoutEffect(() => {
    if (estado.current) { Flip.from(estado.current, { duration: 0.55, ease: "rtr-out", absolute: true }); estado.current = undefined; }
    hist.current?.scrollTo({ top: hist.current.scrollHeight });
  }, [ini]);

  const { ordem, iniciada, historico } = ini;
  const proximo = () => {
    if (!iniciada) return animar({ ...ini, iniciada: true, historico: [...historico, ordem[0].nome] });
    const nova = [...ordem.slice(1), ordem[0]];
    animar({ ...ini, ordem: nova, historico: [...historico, nova[0].nome] });
  };
  const voltar = () => {
    const nova = [ordem[ordem.length - 1], ...ordem.slice(0, -1)];
    animar({ ...ini, ordem: nova, historico: [...historico, `↩ ${nova[0].nome}`] });
  };
  const soltar = (destino: number) => {
    if (arrastado === undefined || arrastado === destino) return;
    const nova = [...ordem]; const [m] = nova.splice(arrastado, 1); nova.splice(destino, 0, m);
    animar({ ...ini, ordem: nova }); setArrastado(undefined);
  };

  return (
    <Janela titulo="Iniciativa" icone={Swords} aoFechar={fechar} x={window.innerWidth - 470} y={96} largura={440}>
      <ol ref={fila} aria-label="Ordem da iniciativa" className="m-0 flex list-none flex-wrap gap-2 p-0">
        {ordem.map((c, i) => (
          <li key={c.id} data-flip-id={c.id} draggable onDragStart={() => setArrastado(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => soltar(i)}
            className={cn("cursor-grab rounded-full border px-4 py-1.5 font-display text-sm select-none active:cursor-grabbing",
              iniciada && i === 0 ? "border-ouro bg-ouro text-noite shadow-[0_0_18px_rgba(189,155,96,.5)]" : "border-border bg-input text-texto")}>
            {c.nome}
          </li>
        ))}
      </ol>
      <p className="mt-2 mb-0 text-sm text-texto/45">{iniciada ? `Vez de ${ordem[0].nome}. ` : "Aperte Iniciar quando o combate começar. "}Arraste os nomes para mudar a ordem.</p>

      <div ref={hist} aria-label="Histórico da iniciativa" className="mt-3 h-28 overflow-y-auto rounded-xl border border-border bg-noite/60 p-3">
        {historico.length
          ? <ol className="m-0 flex list-none flex-wrap gap-x-2 gap-y-1 p-0 text-base text-texto/75">{historico.map((h, i) => <li key={i}>{h}{i < historico.length - 1 && <span className="ml-2 text-texto/30">›</span>}</li>)}</ol>
          : <p className="m-0 text-sm text-texto/40">O histórico aparece aqui.</p>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <BotaoOuro className="h-10 text-sm" onClick={proximo}>{iniciada ? <>Próximo <ChevronRight /></> : <><Play /> Iniciar</>}</BotaoOuro>
        <BotaoOuro variant="outline" className="h-10 text-sm" disabled={!iniciada} onClick={voltar}><ChevronLeft /> Voltar</BotaoOuro>
        <BotaoOuro variant="outline" className="h-10 text-sm" onClick={() => setAdicionar(true)}><Plus /> Adicionar</BotaoOuro>
        <BotaoOuro variant="outline" className="h-10 border-sangue-claro/60 text-sm text-sangue-claro hover:border-sangue-claro hover:bg-sangue/20 hover:text-sangue-claro" onClick={terminar}><Flag /> Terminar combate</BotaoOuro>
      </div>

      <Modal aberto={adicionar} aoFechar={() => setAdicionar(false)} titulo="Adicionar à iniciativa" descricao="Entra no fim da fila.">
        <form className="flex flex-col gap-4" onSubmit={(e) => {
          e.preventDefault(); if (!novo.trim()) return;
          animar({ ...ini, ordem: [...ordem, { id: novoId(), nome: novo.trim() }], historico: [...historico, `+ ${novo.trim()}`] });
          setNovo(""); setAdicionar(false);
        }}>
          <Campo label="Nome" autoFocus value={novo} onChange={(e) => setNovo(e.target.value)} />
          <div className="flex justify-end gap-3">
            <BotaoOuro type="button" variant="outline" onClick={() => setAdicionar(false)}>Cancelar</BotaoOuro>
            <BotaoOuro type="submit" disabled={!novo.trim()}>Adicionar</BotaoOuro>
          </div>
        </form>
      </Modal>
    </Janela>
  );
}

/* ---------- Timer ---------- */

export type EstadoTimer = { nome: string; total: number; restante: number; rodando: boolean };

// Três bipes curtos com Web Audio, sem arquivo de som.
export function bipar() {
  try {
    const ctx = new AudioContext();
    [0, 0.25, 0.5].forEach((t) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.18);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.2);
    });
    window.setTimeout(() => ctx.close(), 1200);
  } catch { /* navegador sem áudio */ }
}

// O relógio roda na página (continua mesmo com o pop-up fechado).
export function useTimer() {
  const [t, setT] = useState<EstadoTimer>({ nome: "", total: 300, restante: 300, rodando: false });
  useEffect(() => {
    if (!t.rodando) return;
    const id = window.setInterval(() => setT((a) => {
      if (a.restante <= 1) { bipar(); return { ...a, restante: 0, rodando: false }; }
      return { ...a, restante: a.restante - 1 };
    }), 1000);
    return () => window.clearInterval(id);
  }, [t.rodando]);
  return [t, setT] as const;
}

export const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function JanelaTimer({ t, setT, fechar }: { t: EstadoTimer; setT: (t: EstadoTimer) => void; fechar: () => void }) {
  const [min, setMin] = useState(Math.floor(t.total / 60));
  const [seg, setSeg] = useState(t.total % 60);
  const configurar = (m: number, s: number) => { setMin(m); setSeg(s); const total = Math.max(1, m * 60 + s); setT({ ...t, total, restante: total, rodando: false }); };
  const acabou = t.restante === 0;
  return (
    <Janela titulo="Timer" icone={TimerIcone} aoFechar={fechar} x={window.innerWidth - 400} y={140} largura={330}>
      <Campo label="Nome" value={t.nome} onChange={(e) => setT({ ...t, nome: e.target.value })} placeholder="Ex.: Ritual completa, reforços chegam…" />
      <p className={cn("my-4 text-center font-display text-5xl tabular-nums", acabou ? "text-sangue-claro" : "text-ouro")} aria-live="polite">
        {acabou ? "Tempo!" : mmss(t.restante)}
      </p>
      {acabou && t.nome && <p className="-mt-2 mb-3 text-center text-base text-texto/70">{t.nome} terminou.</p>}
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Minutos" type="number" min={0} max={180} value={min} disabled={t.rodando} onChange={(e) => configurar(Number(e.target.value), seg)} />
        <Campo label="Segundos" type="number" min={0} max={59} value={seg} disabled={t.rodando} onChange={(e) => configurar(min, Number(e.target.value))} />
      </div>
      <div className="mt-4 flex gap-2">
        <BotaoOuro className="h-10 flex-1 text-sm" disabled={acabou} onClick={() => setT({ ...t, rodando: !t.rodando })}>{t.rodando ? <><Pause /> Pausar</> : <><Play /> Iniciar</>}</BotaoOuro>
        <BotaoOuro variant="outline" className="h-10 text-sm" onClick={() => setT({ ...t, restante: t.total, rodando: false })}><RotateCcw /> Zerar</BotaoOuro>
      </div>
    </Janela>
  );
}

/* ---------- Rolador de dados ---------- */

const FACES = [4, 6, 8, 10, 12, 20, 100];
type Rolagem = { id: string; expr: string; dados: number[]; total: number };

export function JanelaDados({ fechar }: { fechar: () => void }) {
  const [qtd, setQtd] = useState(1);
  const [mod, setMod] = useState(0);
  const [rolagens, setRolagens] = useState<Rolagem[]>([]);
  const rolar = (f: number) => {
    const dados = Array.from({ length: qtd }, () => 1 + Math.floor(Math.random() * f));
    const expr = `${qtd}d${f}${mod ? (mod > 0 ? ` + ${mod}` : ` − ${-mod}`) : ""}`;
    setRolagens((r) => [{ id: novoId(), expr, dados, total: dados.reduce((a, b) => a + b, 0) + mod }, ...r].slice(0, 12));
  };
  const ultima = rolagens[0];
  return (
    <Janela titulo="Rolador de dados" icone={Dices} aoFechar={fechar} x={window.innerWidth - 800} y={120} largura={340}>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Quantidade" type="number" min={1} max={20} value={qtd} onChange={(e) => setQtd(Math.max(1, Math.min(20, Number(e.target.value))))} />
        <Campo label="Modificador" type="number" min={-20} max={20} value={mod} onChange={(e) => setMod(Number(e.target.value))} />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {FACES.map((f) => (
          <button key={f} onClick={() => rolar(f)} className="cursor-pointer rounded-lg border border-ouro/40 bg-ouro/10 py-2 font-display text-sm text-ouro transition-[transform,background-color] hover:bg-ouro/20 active:scale-95">d{f}</button>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-border bg-noite/60 p-4 text-center" aria-live="polite">
        {ultima ? <>
          <p key={ultima.id} className="m-0 font-display text-5xl text-ouro animate-[surgir_.25s_var(--ease-out)]">{ultima.total}</p>
          <p className="mt-1 mb-0 text-sm text-texto/60">{ultima.expr} · [{ultima.dados.join(", ")}]</p>
        </> : <p className="m-0 text-base text-texto/45">Escolha um dado para rolar.</p>}
      </div>
      {rolagens.length > 1 && (
        <ul className="mt-3 mb-0 flex list-none flex-col gap-1 p-0 text-sm text-texto/55">
          {rolagens.slice(1).map((r) => <li key={r.id} className="flex justify-between"><span>{r.expr}</span><span className="font-display text-texto/75">{r.total}</span></li>)}
        </ul>
      )}
    </Janela>
  );
}
