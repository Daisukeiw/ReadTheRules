import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Feather, ImagePlus, Mountain, Plus } from "lucide-react";
import { BotaoOuro, Campo } from "@/components/Campo";
import { cn } from "@/lib/utils";
import { JOGADORES, SISTEMAS, lerImagem, nomeJogador, novoId, type Campanha } from "./dados";
import { Modal, Rotulo, TituloSecao, campoTexto, iniciais } from "./ui";

type Props = { campanhas: Campanha[]; criar: (c: Campanha) => void };

export function CampanhasCriadas({ campanhas, criar }: Props) {
  const [aberto, setAberto] = useState(false);
  const [detalhe, setDetalhe] = useState<Campanha>();
  const nav = useNavigate();
  const trilho = useRef<HTMLDivElement>(null);
  const rolar = (lado: 1 | -1) => trilho.current?.scrollBy({ left: lado * 300, behavior: "smooth" });

  return (
    <section id="campanhas" aria-labelledby="t-campanhas" className="scroll-mt-24" data-surge>
      <TituloSecao id="t-campanhas" extra={campanhas.length > 0 && (
        <div className="flex gap-2">
          <Seta rotulo="Campanhas anteriores" onClick={() => rolar(-1)}><ChevronLeft /></Seta>
          <Seta rotulo="Próximas campanhas" onClick={() => rolar(1)}><ChevronRight /></Seta>
        </div>
      )}>Campanhas criadas</TituloSecao>

      <div className="rounded-2xl border border-border bg-card/50 p-4 sm:p-6">
        {campanhas.length === 0 ? (
          <div className="grid place-items-center py-10">
            <button
              onClick={() => setAberto(true)}
              aria-label="Criar nova campanha"
              className="grid size-40 cursor-pointer place-items-center rounded-full border-0 bg-ouro text-noite shadow-[0_18px_50px_-18px_rgba(189,155,96,.8)] transition-transform duration-200 ease-[var(--ease-out)] hover:scale-105 active:scale-95"
            >
              <Plus className="size-16" strokeWidth={1.5} />
            </button>
            <p className="mt-5 mb-0 text-lg text-pergaminho/80">Nenhuma campanha ainda. Crie a primeira.</p>
          </div>
        ) : (
          <>
            <div ref={trilho} className="-mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]">
              {campanhas.map((c) => <CartaoCampanha key={c.id} c={c} abrir={() => setDetalhe(c)} />)}
            </div>
            <div className="mt-4 flex justify-end">
              <BotaoOuro onClick={() => setAberto(true)}><Plus /> Criar nova campanha</BotaoOuro>
            </div>
          </>
        )}
      </div>

      <Modal aberto={!!detalhe} aoFechar={() => setDetalhe(undefined)} titulo={detalhe?.nome} descricao={detalhe && `${detalhe.sistema} · Nível ${detalhe.nivel}`} className="w-[min(92vw,560px)]">
        {detalhe && (
          <div className="flex flex-col gap-4">
            <div className="relative h-44 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#2a2a35,#1f1f29)]">
              {detalhe.imagem ? <img src={detalhe.imagem} alt="" className="size-full object-cover" /> : <Mountain aria-hidden className="absolute inset-0 m-auto size-16 text-ouro/40" strokeWidth={1.25} />}
            </div>
            <p className="m-0 text-lg leading-snug text-texto/85">{detalhe.descricao || "Sem descrição."}</p>
            <p className="m-0 text-base text-texto/60">Jogadores: {detalhe.jogadores.length ? detalhe.jogadores.map(nomeJogador).join(", ") : "nenhum ainda"}</p>
            <div className="mt-2 flex justify-end">
              <BotaoOuro onClick={() => nav(`/mundo/${detalhe.id}`)}><Feather /> Escrever Mundo</BotaoOuro>
            </div>
          </div>
        )}
      </Modal>

      <NovaCampanha aberto={aberto} aoFechar={() => setAberto(false)} criar={(c) => { criar(c); setAberto(false); }} />
    </section>
  );
}

function Seta({ rotulo, ...p }: React.ComponentProps<"button"> & { rotulo: string }) {
  return (
    <button aria-label={rotulo} className="grid size-10 cursor-pointer place-items-center rounded-full border border-ouro/40 bg-transparent text-ouro transition-colors hover:bg-ouro/10 [&_svg]:size-5" {...p} />
  );
}

function CartaoCampanha({ c, abrir }: { c: Campanha; abrir: () => void }) {
  return (
    <article onClick={abrir} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), abrir())} role="button" tabIndex={0} aria-label={`Abrir ${c.nome}`}
      className="group flex cursor-pointer w-[270px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border bg-card transition-[border-color,transform] duration-200 hover:-translate-y-1 hover:border-ouro/50">
      <div className="relative h-36 overflow-hidden bg-[linear-gradient(135deg,#2a2a35,#1f1f29)]">
        {c.imagem
          ? <img src={c.imagem} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
          : <Mountain aria-hidden className="absolute inset-0 m-auto size-14 text-ouro/40" strokeWidth={1.25} />}
        <span className="absolute top-3 left-3 rounded-full bg-noite/80 px-2.5 py-0.5 font-display text-xs tracking-wide text-ouro">{c.sistema}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="m-0 font-display text-lg leading-tight text-texto">{c.nome}</h3>
          <span className="shrink-0 font-display text-xs text-pergaminho/80">Nível {c.nivel}</span>
        </div>
        <p className="m-0 line-clamp-3 text-base leading-snug text-texto/75">{c.descricao || "Sem descrição."}</p>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <div className="flex -space-x-2">
            {c.jogadores.slice(0, 4).map((j) => (
              <span key={j} title={nomeJogador(j)} className="grid size-8 place-items-center rounded-full border-2 border-card bg-input font-display text-[0.65rem] text-pergaminho">
                {iniciais(nomeJogador(j))}
              </span>
            ))}
          </div>
          <span className="text-sm text-texto/60">{c.jogadores.length ? `${c.jogadores.length} jogadores` : "Sem jogadores"}</span>
        </div>
      </div>
    </article>
  );
}

const vazia = { nome: "", sistema: SISTEMAS[0], nivel: 1, descricao: "", imagem: undefined as string | undefined, jogadores: [] as string[] };

function NovaCampanha({ aberto, aoFechar, criar }: { aberto: boolean; aoFechar: () => void; criar: (c: Campanha) => void }) {
  const [f, setF] = useState(vazia);
  const fechar = () => { setF(vazia); aoFechar(); };
  const alternar = (id: string) => setF({ ...f, jogadores: f.jogadores.includes(id) ? f.jogadores.filter((j) => j !== id) : [...f.jogadores, id] });

  return (
    <Modal aberto={aberto} aoFechar={fechar} titulo="Nova campanha" descricao="Preencha o básico. Dá para mudar tudo depois.">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => { e.preventDefault(); criar({ ...f, nome: f.nome.trim(), id: novoId() }); setF(vazia); }}
      >
        <label className="group relative grid h-32 cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-ouro/40 bg-input/60 text-pergaminho/70 hover:border-ouro">
          {f.imagem
            ? <img src={f.imagem} alt="Capa escolhida" className="absolute inset-0 size-full object-cover" />
            : <span className="flex flex-col items-center gap-1 font-display text-sm"><ImagePlus className="size-7" /> Adicionar capa</span>}
          <input type="file" accept="image/*" className="sr-only" onChange={async (e) => {
            const a = e.target.files?.[0];
            if (a) setF({ ...f, imagem: await lerImagem(a) });
          }} />
        </label>
        <Campo label="Nome da campanha" required maxLength={100} value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} placeholder="A Coroa de Cinzas" />
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <Rotulo texto="Sistema">
            <select className={campoTexto} value={f.sistema} onChange={(e) => setF({ ...f, sistema: e.target.value })}>
              {SISTEMAS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Rotulo>
          <Campo label="Nível" type="number" min={1} max={20} required value={f.nivel} onChange={(e) => setF({ ...f, nivel: Number(e.target.value) })} />
        </div>
        <Rotulo texto="Breve descrição">
          <textarea className={cn(campoTexto, "min-h-24")} maxLength={300} value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} placeholder="Do que se trata essa história?" />
        </Rotulo>
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2 font-display text-sm tracking-wide text-pergaminho">Jogadores</legend>
          <div className="flex flex-wrap gap-2">
            {JOGADORES.map((j) => {
              const ativo = f.jogadores.includes(j.id);
              return (
                <button key={j.id} type="button" aria-pressed={ativo} onClick={() => alternar(j.id)}
                  className={cn("cursor-pointer rounded-full border px-3.5 py-1 font-serif text-base transition-colors",
                    ativo ? "border-ouro bg-ouro/15 text-ouro" : "border-border bg-transparent text-texto/70 hover:border-pergaminho/60")}>
                  {j.nome}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="mt-2 flex justify-end gap-3">
          <BotaoOuro type="button" variant="outline" onClick={fechar}>Cancelar</BotaoOuro>
          <BotaoOuro type="submit">Criar campanha</BotaoOuro>
        </div>
      </form>
    </Modal>
  );
}
