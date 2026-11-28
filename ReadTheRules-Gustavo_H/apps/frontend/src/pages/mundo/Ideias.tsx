import { useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { BotaoOuro } from "@/components/Campo";
import { cn } from "@/lib/utils";
import { novoId, useIdeias, type Ideia } from "../homeLogada/dados";
import { Pagina } from "./Moldura";
import { useCampanha } from "./Mundo";

const LARGURA = 2400, ALTURA = 1500;
const NO_L = 200, NO_A = 104;
// Onde nasce a ideia filha quando se clica no + de cada lado.
const LADOS = [
  { lado: "cima", dx: 0, dy: -190, pos: "left-1/2 -top-4 -translate-x-1/2" },
  { lado: "direita", dx: 290, dy: 0, pos: "top-1/2 -right-4 -translate-y-1/2" },
  { lado: "baixo", dx: 0, dy: 190, pos: "left-1/2 -bottom-4 -translate-x-1/2" },
  { lado: "esquerda", dx: -290, dy: 0, pos: "top-1/2 -left-4 -translate-y-1/2" },
];

// Mapa mental: ideias ligadas umas às outras, arrastáveis, com + em cada lado para criar uma ideia ligada.
export function ArvoreIdeias() {
  const campanha = useCampanha();
  const [todas, setIdeias] = useIdeias();
  const ideias = todas.filter((i) => i.campanhaId === campanha.id);
  const [sel, setSel] = useState<string>();
  const [recem, setRecem] = useState<string>();
  const [arrasto, setArrasto] = useState<{ id: string; x: number; y: number; ox: number; oy: number }>();
  const area = useRef<HTMLDivElement>(null);

  useEffect(() => { // começa com a árvore no centro da tela
    const a = area.current; if (!a) return;
    const cx = ideias.length ? ideias.reduce((s, i) => s + i.x, 0) / ideias.length : LARGURA / 2;
    const cy = ideias.length ? ideias.reduce((s, i) => s + i.y, 0) / ideias.length : ALTURA / 2;
    a.scrollTo(cx - a.clientWidth / 2, cy - a.clientHeight / 2);
  }, [campanha.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const pos = (i: Ideia) => (arrasto?.id === i.id ? arrasto : i);
  const mudar = (id: string, m: Partial<Ideia>) => setIdeias((l) => l.map((i) => (i.id === id ? { ...i, ...m } : i)));
  const criar = (x: number, y: number, pai?: string, vertical?: boolean) => {
    // desliza a nova ideia até achar um lugar vazio, para não nascer em cima de outra
    for (let n = 0; n < 12 && ideias.some((i) => Math.abs(i.x - x) < NO_L + 20 && Math.abs(i.y - y) < NO_A + 30); n++) vertical ? (x += NO_L + 40) : (y += NO_A + 40);
    const nova: Ideia = { id: novoId(), campanhaId: campanha.id, x: Math.min(LARGURA - 120, Math.max(120, x)), y: Math.min(ALTURA - 70, Math.max(70, y)), texto: "", pai };
    setIdeias((l) => [...l, nova]); setSel(nova.id); setRecem(nova.id);
  };
  const excluir = (id: string) => {
    const pai = todas.find((i) => i.id === id)?.pai;
    setIdeias((l) => l.filter((i) => i.id !== id).map((i) => (i.pai === id ? { ...i, pai } : i))); // os filhos sobem para o avô
    setSel(undefined);
  };
  const centro = () => { const a = area.current!; criar(a.scrollLeft + a.clientWidth / 2, a.scrollTop + a.clientHeight / 2); };

  return (
    <Pagina titulo="Árvore de ideias" texto="Selecione uma ideia e use os + para ligar novas ideias a ela. Arraste para organizar. Dois cliques no fundo criam uma ideia solta."
      extra={<div className="flex gap-2">
        {sel && <BotaoOuro variant="outline" onClick={() => excluir(sel)}><Trash2 /> Excluir ideia</BotaoOuro>}
        <BotaoOuro onClick={centro}><Plus /> Nova ideia</BotaoOuro>
      </div>}>
      <div ref={area} data-lenis-prevent className="h-[68svh] overflow-auto rounded-2xl border border-border bg-[#111118] [background-image:radial-gradient(rgba(232,228,220,.07)_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="relative" style={{ width: LARGURA, height: ALTURA }}
          onPointerDown={(e) => { if (e.target === e.currentTarget) setSel(undefined); }}
          onDoubleClick={(e) => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); criar(e.clientX - r.left, e.clientY - r.top); } }}
          onPointerMove={(e) => { if (arrasto) { const r = e.currentTarget.getBoundingClientRect(); setArrasto({ ...arrasto, x: e.clientX - r.left - arrasto.ox, y: e.clientY - r.top - arrasto.oy }); } }}
          onPointerUp={() => { if (arrasto) { mudar(arrasto.id, { x: arrasto.x, y: arrasto.y }); setArrasto(undefined); } }}>
          <svg className="pointer-events-none absolute inset-0" width={LARGURA} height={ALTURA} aria-hidden>
            {ideias.filter((i) => i.pai).map((i) => {
              const p = ideias.find((x) => x.id === i.pai); if (!p) return null;
              const a = pos(p), b = pos(i), mx = (a.x + b.x) / 2;
              return <path key={i.id} d={`M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`} fill="none" stroke="#bd9b60" strokeOpacity=".45" strokeWidth="2" strokeDasharray="6 6" />;
            })}
          </svg>

          {ideias.map((i) => {
            const { x, y } = pos(i);
            const ativa = sel === i.id;
            return (
              <div key={i.id} className="absolute" style={{ left: x - NO_L / 2, top: y - NO_A / 2, width: NO_L, minHeight: NO_A, zIndex: ativa ? 2 : 1 }}>
                <div onPointerDown={(e) => {
                    setSel(i.id);
                    if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
                    const r = area.current!.firstElementChild!.getBoundingClientRect();
                    setArrasto({ id: i.id, x, y, ox: e.clientX - r.left - x, oy: e.clientY - r.top - y });
                  }}
                  className={cn("relative flex min-h-[104px] cursor-grab flex-col rounded-xl border bg-card p-3 shadow-[0_12px_30px_-12px_rgba(0,0,0,.8)] transition-[border-color,box-shadow] active:cursor-grabbing",
                    ativa ? "border-ouro shadow-[0_0_0_3px_rgba(189,155,96,.2)]" : i.pai ? "border-border" : "border-sangue/70 bg-[linear-gradient(160deg,rgba(158,27,27,.25),#1f1f29)]")}>
                  <textarea aria-label="Texto da ideia" value={i.texto} autoFocus={recem === i.id} placeholder="Escreva a ideia…" rows={3}
                    onChange={(e) => mudar(i.id, { texto: e.target.value })}
                    className="min-h-0 flex-1 resize-none border-0 bg-transparent p-0 text-center font-serif text-base leading-snug text-texto placeholder:text-texto/35 focus:outline-none" />
                  {ativa && LADOS.map((l) => (
                    <button key={l.lado} aria-label={`Ligar nova ideia para ${l.lado}`} onPointerDown={(e) => e.stopPropagation()} onClick={() => criar(i.x + l.dx, i.y + l.dy, i.id, l.dx === 0)}
                      className={cn("absolute grid size-8 cursor-pointer place-items-center rounded-full border border-ouro bg-noite text-ouro shadow-[0_0_14px_rgba(189,155,96,.45)] transition-transform hover:scale-110", l.pos)}>
                      <Plus className="size-4" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Pagina>
  );
}
