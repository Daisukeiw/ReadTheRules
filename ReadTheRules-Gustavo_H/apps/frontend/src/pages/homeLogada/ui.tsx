import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalProps = {
  aberto: boolean; aoFechar: () => void; titulo: React.ReactNode; descricao?: React.ReactNode;
  children: React.ReactNode; className?: string;
};

// Pop-up padrão (Radix cuida de foco, Esc e leitor de tela).
export function Modal({ aberto, aoFechar, titulo, descricao, children, className }: ModalProps) {
  return (
    <Dialog.Root open={aberto} onOpenChange={(o) => !o && aoFechar()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px] animate-[aparecer_.2s_ease-out]" />
        <Dialog.Content
          data-lenis-prevent
          className={cn(
            "fixed top-1/2 left-1/2 z-50 max-h-[90svh] w-[min(92vw,540px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto",
            "rounded-2xl border border-ouro/25 bg-card p-6 font-serif text-texto shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)] animate-[surgir_.25s_var(--ease-out)]",
            className,
          )}
        >
          <Dialog.Title className="m-0 pr-8 font-display text-xl text-ouro">{titulo}</Dialog.Title>
          <Dialog.Description className={descricao ? "mt-1 mb-0 text-pergaminho/80" : "sr-only"}>{descricao ?? titulo}</Dialog.Description>
          <Dialog.Close aria-label="Fechar" className="absolute top-4 right-4 grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-pergaminho/70 transition-colors hover:bg-input hover:text-ouro">
            <X className="size-5" />
          </Dialog.Close>
          <div className="mt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Rótulo em volta de textarea/select (o Campo do lote 1 cobre os inputs).
export function Rotulo({ texto, children, className }: { texto: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-2 font-display text-sm tracking-wide text-pergaminho", className)}>
      {texto}
      {children}
    </label>
  );
}

export const campoTexto = "w-full rounded-md border border-sangue/70 bg-input px-3.5 py-2 font-serif text-lg text-texto placeholder:text-muted-foreground/70 focus:border-ouro";

// Título das seções, no vermelho dos wireframes.
export function TituloSecao({ id, children, extra }: { id: string; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <h2 id={id} className="m-0 font-display text-2xl font-semibold text-sangue-claro sm:text-3xl">{children}</h2>
      {extra}
    </div>
  );
}

export const iniciais = (nome: string) => nome.slice(0, 2).toUpperCase();
