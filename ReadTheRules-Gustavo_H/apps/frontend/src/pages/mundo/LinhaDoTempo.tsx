import { useMemo, useState } from "react";
import { History, ImagePlus, Minus, Plus, Trash2 } from "lucide-react";
import { BotaoOuro, Campo } from "@/components/Campo";
import { cn } from "@/lib/utils";
import { lerImagem, novoId, useEntidades, type Entidade } from "../homeLogada/dados";
import { Modal, Rotulo, campoTexto } from "../homeLogada/ui";
import { Pagina, Vazio } from "./Moldura";
import { useCampanha } from "./Mundo";

export const CORES: Record<string, { nome: string; ponto: string; pilula: string }> = {
  ouro: { nome: "Ouro", ponto: "bg-[#bd9b60]", pilula: "border-[#bd9b60]/70 bg-[#bd9b60]/20 text-[#e3c98f]" },
  sangue: { nome: "Sangue", ponto: "bg-[#d9584f]", pilula: "border-[#d9584f]/70 bg-[#9e1b1b]/35 text-[#f0a49d]" },
  pergaminho: { nome: "Pergaminho", ponto: "bg-[#d4c2a1]", pilula: "border-[#d4c2a1]/60 bg-[#d4c2a1]/15 text-[#e8dcc4]" },
  violeta: { nome: "Violeta", ponto: "bg-[#a78bfa]", pilula: "border-[#a78bfa]/60 bg-[#a78bfa]/15 text-[#c9b8fc]" },
  esmeralda: { nome: "Esmeralda", ponto: "bg-[#34d399]", pilula: "border-[#34d399]/55 bg-[#34d399]/12 text-[#86e8bf]" },
  azul: { nome: "Azul", ponto: "bg-[#60a5fa]", pilula: "border-[#60a5fa]/60 bg-[#60a5fa]/12 text-[#a5cbfc]" },
};

const REGUA = 64; // altura da régua
const FAIXA = 48; // altura de cada faixa de acontecimentos

type Rascunho = { id?: string; nome: string; inicio: number; fim: number; cor: string; texto: string; imagem?: string };

// Linha do tempo da campanha. Cada acontecimento é guardado como uma entidade do tipo Evento.
export function LinhaDoTempo() {
  const campanha = useCampanha();
  const [entidades, setEntidades] = useEntidades();
  const [k, setK] = useState(14); // pixels por ano
  const [fantasma, setFantasma] = useState<number>();
  const [rascunho, setRascunho] = useState<Rascunho>();

  const eventos = entidades.filter((e) => e.campanhaId === campanha.id && e.tipo === "eventos" && e.evento) as (Entidade & { evento: NonNullable<Entidade["evento"]> })[];
  const min = Math.floor((Math.min(0, ...eventos.map((e) => e.evento.inicio)) - 10) / 10) * 10;
  const max = Math.ceil((Math.max(100, ...eventos.map((e) => e.evento.fim)) + 20) / 10) * 10;
  const x = (ano: number) => 24 + (ano - min) * k;
  // largura da pílula: o período em anos, mas nunca menor que o nome (que fica sempre legível)
  const largura = (e: Entidade & { evento: NonNullable<Entidade["evento"]> }) => Math.max((e.evento.fim - e.evento.inicio) * k, e.nome.length * 9.5 + 32);

  // Distribui os acontecimentos em faixas para que não se sobreponham.
  const { faixaDe, faixas } = useMemo(() => {
    const fins: number[] = []; const faixaDe = new Map<string, number>();
    [...eventos].sort((a, b) => a.evento.inicio - b.evento.inicio).forEach((e) => {
      const ini = x(e.evento.inicio);
      let f = fins.findIndex((fim) => fim + 8 <= ini);
      if (f < 0) { f = fins.length; fins.push(0); }
      fins[f] = ini + largura(e); faixaDe.set(e.id, f);
    });
    return { faixaDe, faixas: fins.length };
  }, [eventos, k, min]); // eslint-disable-line react-hooks/exhaustive-deps

  const altura = REGUA + 24 + (faixas + 1) * FAIXA + 40;
  const anoDoMouse = (ev: React.MouseEvent<HTMLDivElement>) => Math.round((ev.clientX - ev.currentTarget.getBoundingClientRect().left - 24) / k + min);

  const salvar = (r: Rascunho) => {
    const ent: Entidade = { id: r.id ?? novoId(), tipo: "eventos", nome: r.nome.trim(), texto: r.texto, respostas: {}, campanhaId: campanha.id,
      evento: { inicio: Math.min(r.inicio, r.fim), fim: Math.max(r.inicio, r.fim), cor: r.cor, imagem: r.imagem } };
    const antigo = entidades.find((e) => e.id === ent.id);
    setEntidades((l) => antigo ? l.map((e) => e.id === ent.id ? { ...antigo, ...ent, respostas: antigo.respostas } : e) : [...l, ent]);
    setRascunho(undefined);
  };

  return (
    <Pagina titulo="Linha do tempo" texto="Passe o mouse sob a régua e clique para criar um acontecimento. Cada um vira uma entidade Evento."
      extra={
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-sm text-pergaminho">Zoom</span>
          <button aria-label="Diminuir zoom" onClick={() => setK((v) => Math.max(5, v - 3))} className="grid size-9 cursor-pointer place-items-center rounded-full border border-border bg-transparent text-pergaminho hover:border-ouro hover:text-ouro"><Minus className="size-4" /></button>
          <button aria-label="Aumentar zoom" onClick={() => setK((v) => Math.min(40, v + 3))} className="grid size-9 cursor-pointer place-items-center rounded-full border border-border bg-transparent text-pergaminho hover:border-ouro hover:text-ouro"><Plus className="size-4" /></button>
          <BotaoOuro className="ml-2" onClick={() => setRascunho({ nome: "", inicio: 0, fim: 10, cor: "ouro", texto: "" })}><Plus /> Novo acontecimento</BotaoOuro>
        </div>
      }>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card/40 [background-image:radial-gradient(rgba(232,228,220,.07)_1px,transparent_1px)] [background-size:22px_22px]">
        <div className="relative" style={{ width: x(max) + 48, height: altura }}
          onMouseMove={(ev) => setFantasma((ev.target as HTMLElement).closest("[data-evento]") ? undefined : anoDoMouse(ev))}
          onMouseLeave={() => setFantasma(undefined)}
          onClick={(ev) => { if (!(ev.target as HTMLElement).closest("[data-evento]")) { const a = anoDoMouse(ev); setRascunho({ nome: "", inicio: a, fim: a + 10, cor: "ouro", texto: "" }); } }}>
          {/* régua */}
          <div className="absolute inset-x-0 h-px bg-pergaminho/50" style={{ top: REGUA }} />
          {Array.from({ length: (max - min) / 2 + 1 }, (_, i) => min + i * 2).map((ano) => {
            const dez = ano % 10 === 0; const cinquenta = ano % 50 === 0;
            return (
              <div key={ano} className="pointer-events-none absolute" style={{ left: x(ano), top: REGUA - (dez ? 6 : 3) }}>
                <div className={cn("w-px bg-pergaminho/60", dez ? "h-3" : "h-1.5")} />
                {dez && <span className={cn("absolute top-4 -translate-x-1/2 font-display text-xs", cinquenta ? "font-semibold text-texto" : "text-texto/50")}>{ano}</span>}
              </div>
            );
          })}

          {eventos.map((e) => {
            const c = CORES[e.evento.cor] ?? CORES.ouro;
            return (
              <button key={e.id} data-evento title={`${e.nome} (${e.evento.inicio} a ${e.evento.fim})`}
                onClick={() => setRascunho({ id: e.id, nome: e.nome, inicio: e.evento.inicio, fim: e.evento.fim, cor: e.evento.cor, texto: e.texto, imagem: e.evento.imagem })}
                className={cn("absolute h-9 cursor-pointer overflow-hidden rounded-full border px-3 font-display text-sm whitespace-nowrap transition-[filter,transform] hover:brightness-125 active:scale-[0.98] animate-[surgir_.3s_var(--ease-out)]", c.pilula)}
                style={{ left: x(e.evento.inicio), width: largura(e), top: REGUA + 40 + (faixaDe.get(e.id) ?? 0) * FAIXA }}>
                {e.evento.imagem && <img src={e.evento.imagem} alt="" className="absolute inset-0 size-full object-cover opacity-30" />}
                <span className="relative">{e.nome}</span>
              </button>
            );
          })}

          {fantasma !== undefined && (
            <div className="pointer-events-none absolute" style={{ left: x(fantasma), top: REGUA + 40 + faixas * FAIXA }}>
              <div className="h-9 rounded-full border border-dashed border-ouro/70 bg-ouro/10" style={{ width: Math.max(72, 10 * k) }} />
              <span className="mt-1.5 inline-block rounded-md bg-noite/90 px-2 py-0.5 text-sm whitespace-nowrap text-texto">
                Ano {fantasma} – {fantasma + 10} <span className="text-texto/50">· clique para adicionar</span>
              </span>
            </div>
          )}
        </div>
      </div>
      {eventos.length === 0 && <div className="mt-6"><Vazio icone={History} titulo="Nenhum acontecimento ainda" texto="Clique em qualquer ponto abaixo da régua para criar o primeiro." /></div>}

      {rascunho && <EditarAcontecimento r={rascunho} fechar={() => setRascunho(undefined)} salvar={salvar}
        excluir={rascunho.id ? () => { setEntidades((l) => l.filter((e) => e.id !== rascunho.id)); setRascunho(undefined); } : undefined} />}
    </Pagina>
  );
}

function EditarAcontecimento({ r, fechar, salvar, excluir }: { r: Rascunho; fechar: () => void; salvar: (r: Rascunho) => void; excluir?: () => void }) {
  const [f, setF] = useState(r);
  return (
    <Modal aberto aoFechar={fechar} titulo={r.id ? "Editar acontecimento" : "Novo acontecimento"}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); salvar(f); }}>
        <Campo label="Nome do acontecimento" autoFocus required maxLength={100} value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} placeholder="Ex.: A Queda de Valdris, Era da Fuligem…" />
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Início (ano)" type="number" required value={f.inicio} onChange={(e) => setF({ ...f, inicio: Number(e.target.value) })} />
          <Campo label="Fim (ano)" type="number" required value={f.fim} onChange={(e) => setF({ ...f, fim: Number(e.target.value) })} />
        </div>
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2 font-display text-sm tracking-wide text-pergaminho">Cor</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CORES).map(([id, c]) => (
              <button key={id} type="button" aria-pressed={f.cor === id} onClick={() => setF({ ...f, cor: id })}
                className={cn("flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 font-serif text-base transition-colors",
                  f.cor === id ? "border-ouro bg-ouro/10 text-texto" : "border-border bg-transparent text-texto/70 hover:border-pergaminho/60")}>
                <span className={cn("size-3 rounded-full", c.ponto)} /> {c.nome}
              </button>
            ))}
          </div>
        </fieldset>
        <Rotulo texto="Descrição">
          <textarea className={cn(campoTexto, "min-h-20")} value={f.texto} onChange={(e) => setF({ ...f, texto: e.target.value })} placeholder="Uma breve descrição deste acontecimento…" />
        </Rotulo>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 font-display text-sm text-pergaminho hover:border-ouro hover:text-ouro">
          <ImagePlus className="size-4" /> {f.imagem ? "Trocar imagem de fundo" : "Imagem de fundo (opcional)"}
          <input type="file" accept="image/*" className="sr-only" onChange={async (e) => { const a = e.target.files?.[0]; if (a) setF({ ...f, imagem: await lerImagem(a, 480) }); }} />
        </label>
        <div className="mt-2 flex items-center gap-3">
          {excluir && <button type="button" onClick={excluir} className="flex cursor-pointer items-center gap-1.5 border-0 bg-transparent font-display text-sm text-sangue-claro hover:underline"><Trash2 className="size-4" /> Excluir</button>}
          <BotaoOuro type="button" variant="outline" className="ml-auto" onClick={fechar}>Cancelar</BotaoOuro>
          <BotaoOuro type="submit" disabled={!f.nome.trim()}>{r.id ? "Salvar" : "Criar"}</BotaoOuro>
        </div>
      </form>
    </Modal>
  );
}
