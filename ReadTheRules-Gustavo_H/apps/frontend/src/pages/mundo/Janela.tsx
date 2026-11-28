import { useRef, useState } from "react";
import { GripHorizontal, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Pop-up flutuante: arrasta pela barra do título para qualquer lugar da tela sem perder as funções.
export function Janela({ titulo, icone: Icone, aoFechar, children, x = 140, y = 110, largura = 360, className }: {
  titulo: string; icone: LucideIcon; aoFechar: () => void; children: React.ReactNode; x?: number; y?: number; largura?: number; className?: string;
}) {
  const [pos, setPos] = useState(() => ({ x: Math.min(x, window.innerWidth - largura - 8), y }));
  const inicio = useRef<{ px: number; py: number; x: number; y: number }>(undefined);

  return (
    <div role="dialog" aria-label={titulo} data-lenis-prevent
      className={cn("fixed z-50 flex max-h-[85svh] flex-col overflow-hidden rounded-2xl border border-ouro/30 bg-card font-serif text-texto shadow-[0_24px_70px_-18px_rgba(0,0,0,.9)] animate-[surgir_.25s_var(--ease-out)]", className)}
      style={{ left: Math.max(8, pos.x), top: Math.max(72, pos.y), width: `min(${largura}px, calc(100vw - 16px))` }}>
      <div
        onPointerDown={(e) => { if ((e.target as HTMLElement).closest("button")) return; e.currentTarget.setPointerCapture(e.pointerId); inicio.current = { px: e.clientX, py: e.clientY, ...pos }; }}
        onPointerMove={(e) => { const i = inicio.current; if (i) setPos({ x: Math.min(window.innerWidth - 80, i.x + e.clientX - i.px), y: Math.min(window.innerHeight - 48, i.y + e.clientY - i.py) }); }}
        onPointerUp={() => { inicio.current = undefined; }}
        className="flex cursor-move touch-none items-center gap-2 border-b border-border bg-input/60 px-4 py-2.5 select-none">
        <Icone className="size-4 text-ouro" />
        <span className="flex-1 font-display text-sm tracking-wide text-pergaminho">{titulo}</span>
        <GripHorizontal aria-hidden className="size-4 text-texto/30" />
        <button aria-label={`Fechar ${titulo}`} onClick={aoFechar} className="grid size-7 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-pergaminho/70 hover:bg-noite hover:text-ouro"><X className="size-4" /></button>
      </div>
      <div className="min-h-0 overflow-y-auto p-4">{children}</div>
    </div>
  );
}
