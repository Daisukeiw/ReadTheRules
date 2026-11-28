import { useState } from "react";
import { Dialog } from "radix-ui";
import { ArrowLeft, Plus } from "lucide-react";
import { BotaoOuro, Campo } from "@/components/Campo";
import { cn } from "@/lib/utils";
import { TIPOS, novoId, tipo, useCampanhas, useEntidades, type Entidade, type TipoEntidade } from "./dados";
import { Modal, Rotulo, TituloSecao, campoTexto } from "./ui";

type Etapa = { passo: "tipo" } | { passo: "nome"; tipo: TipoEntidade } | { passo: "editor"; tipo: TipoEntidade; nome: string; campanha?: string; existente?: Entidade };

// Eventos nascem na Linha do tempo (precisam de início e fim), por isso ficam fora da escolha de tipo.
const CRIAVEIS = TIPOS.filter((t) => t.id !== "eventos");

// Com campanhaId, conta e cria entidades só daquela campanha e mostra a lista delas.
export function EntidadesCriadas({ campanhaId, comLista }: { campanhaId?: string; comLista?: boolean }) {
  const [todas, setEntidades] = useEntidades();
  const entidades = campanhaId ? todas.filter((e) => e.campanhaId === campanhaId) : todas;
  const [etapa, setEtapa] = useState<Etapa>();
  const fechar = () => setEtapa(undefined);
  const salvar = (e: Entidade) => setEntidades((l) => l.some((x) => x.id === e.id) ? l.map((x) => x.id === e.id ? e : x) : [...l, e]);

  return (
    <section id="entidades" aria-labelledby="t-entidades" className="scroll-mt-24" data-surge>
      <TituloSecao id="t-entidades">Entidades criadas</TituloSecao>
      <div className="rounded-2xl border border-border bg-card/50 p-4 sm:p-6">
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-x-4 gap-y-5 p-0">
          {TIPOS.map(({ id, nome, icone: Icone }) => (
            <li key={id} className="flex flex-col items-center gap-2">
              <div className="flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card">
                <div className="grid h-16 place-items-center"><Icone aria-hidden className="size-7 text-ouro" strokeWidth={1.5} /></div>
                <div className="border-t border-ouro/20 py-2 text-center font-display text-xl text-texto tabular-nums">
                  {entidades.filter((e) => e.tipo === id).length}
                </div>
              </div>
              <span className="font-display text-sm text-pergaminho">{nome}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-end">
          <BotaoOuro onClick={() => setEtapa({ passo: "tipo" })}><Plus /> Criar novo…</BotaoOuro>
        </div>
      </div>

      {comLista && (
        <div className="mt-8 flex flex-col gap-6">
          {TIPOS.map((t) => {
            const doTipo = entidades.filter((e) => e.tipo === t.id);
            if (!doTipo.length) return null;
            return (
              <div key={t.id}>
                <h3 className="mb-3 flex items-center gap-2 font-display text-base text-pergaminho"><t.icone className="size-4 text-ouro" /> {t.nome}</h3>
                <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 p-0">
                  {doTipo.map((e) => (
                    <li key={e.id}>
                      <button onClick={() => setEtapa({ passo: "editor", tipo: e.tipo, nome: e.nome, existente: e })}
                        className="flex w-full cursor-pointer flex-col gap-1 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-ouro/50">
                        <span className="font-display text-base text-texto">{e.nome}</span>
                        <span className="line-clamp-2 text-sm text-texto/55">{e.texto || (e.evento ? `Do ano ${e.evento.inicio} ao ${e.evento.fim}` : "Sem texto ainda.")}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <Modal aberto={etapa?.passo === "tipo"} aoFechar={fechar} titulo="Nova entidade" descricao="Escolha o tipo de entidade.">
        {/* 2 linhas x 4 colunas; as colunas que não cabem ficam escondidas à direita */}
        <div className="relative">
          <div className="grid snap-x grid-flow-col grid-rows-2 auto-cols-[44%] gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]">
            {CRIAVEIS.map(({ id, nome, icone: Icone }) => (
              <button key={id} onClick={() => setEtapa({ passo: "nome", tipo: id })}
                className="flex cursor-pointer snap-start items-center gap-3 rounded-xl border border-border bg-input/50 p-4 text-left transition-colors hover:border-ouro/60 hover:bg-input">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-ouro/30 bg-ouro/10"><Icone className="size-5 text-ouro" /></span>
                <span className="font-display text-base text-texto">{nome}</span>
              </button>
            ))}
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-card" />
        </div>
      </Modal>

      {etapa?.passo === "nome" && <NomeEntidade tipoId={etapa.tipo} escolherCampanha={!campanhaId} voltar={() => setEtapa({ passo: "tipo" })} fechar={fechar}
        avancar={(nome, campanha) => setEtapa({ passo: "editor", tipo: etapa.tipo, nome, campanha: campanha ?? campanhaId })} />}

      {etapa?.passo === "editor" && <EditorEntidade tipoId={etapa.tipo} nomeInicial={etapa.nome} existente={etapa.existente} fechar={fechar}
        salvar={(e) => { salvar({ campanhaId: etapa.campanha, ...e }); fechar(); }} />}
    </section>
  );
}

function NomeEntidade({ tipoId, escolherCampanha, voltar, fechar, avancar }: { tipoId: TipoEntidade; escolherCampanha: boolean; voltar: () => void; fechar: () => void; avancar: (n: string, campanha?: string) => void }) {
  const [nome, setNome] = useState("");
  const [campanhas] = useCampanhas();
  const [campanha, setCampanha] = useState(campanhas[0]?.id ?? "");
  const t = tipo(tipoId);
  return (
    <Modal aberto aoFechar={fechar} titulo={<span className="flex items-center gap-2"><t.icone className="size-5" /> {t.nome}</span>} descricao="Como essa entidade se chama?">
      <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); if (nome.trim()) avancar(nome.trim(), escolherCampanha ? campanha : undefined); }}>
        <Campo label="Nome" autoFocus required maxLength={100} value={nome} onChange={(e) => setNome(e.target.value)} />
        {escolherCampanha && (campanhas.length ? (
          <Rotulo texto="Campanha">
            <select className={campoTexto} value={campanha} onChange={(e) => setCampanha(e.target.value)}>
              {campanhas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </Rotulo>
        ) : <p role="alert" className="m-0 text-base text-sangue-claro">Crie uma campanha primeiro: toda entidade pertence a uma campanha.</p>)}
        <div className="flex justify-between gap-3">
          <BotaoOuro type="button" variant="outline" onClick={voltar}>Voltar</BotaoOuro>
          <BotaoOuro type="submit" disabled={escolherCampanha && !campanha}>Avançar</BotaoOuro>
        </div>
      </form>
    </Modal>
  );
}

function EditorEntidade({ tipoId, nomeInicial, existente, fechar, salvar }: { tipoId: TipoEntidade; nomeInicial: string; existente?: Entidade; fechar: () => void; salvar: (e: Entidade) => void }) {
  const t = tipo(tipoId);
  const [nome, setNome] = useState(nomeInicial);
  const [texto, setTexto] = useState(existente?.texto ?? "");
  const [respostas, setRespostas] = useState<Record<string, string>>(existente?.respostas ?? {});
  const palavras = texto.trim() ? texto.trim().split(/\s+/).length : 0;

  return (
    <Dialog.Root open onOpenChange={(o) => !o && fechar()}>
      <Dialog.Portal>
        <Dialog.Content data-lenis-prevent className="fixed inset-0 z-50 overflow-y-auto bg-noite font-serif text-texto animate-[aparecer_.2s_ease-out]">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
            <button onClick={fechar} className="flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 font-display text-sm text-pergaminho/80 hover:text-ouro">
              <ArrowLeft className="size-4" /> Entidades
            </button>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Dialog.Title asChild>
                <input aria-label="Nome da entidade" value={nome} onChange={(e) => setNome(e.target.value)}
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 font-display text-3xl font-semibold text-texto focus:outline-none sm:text-4xl" />
              </Dialog.Title>
              <span className="flex items-center gap-1.5 rounded-full border border-ouro/40 px-3 py-1 font-display text-xs text-ouro"><t.icone className="size-3.5" /> {t.nome}</span>
            </div>
            <Dialog.Description className="sr-only">Escreva livremente e use as perguntas para desenvolver a ideia.</Dialog.Description>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="flex flex-col">
                <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Comece a escrever… conte a história, a aparência, os segredos."
                  className="min-h-[50svh] flex-1 rounded-xl border border-border bg-card p-5 text-lg leading-relaxed focus:border-ouro/60" />
                <p className="mt-2 mb-0 text-right text-sm text-texto/50">{palavras} palavras · {texto.length} caracteres</p>
              </div>
              <aside className="rounded-xl border border-border bg-card p-5">
                <h3 className="m-0 font-display text-sm tracking-[0.15em] text-ouro uppercase">Perguntas para guiar</h3>
                <p className="mt-1 mb-4 text-base text-texto/60">Responda as que fizerem sentido. Nenhuma é obrigatória.</p>
                <div className="flex flex-col gap-4">
                  {t.perguntas.map((p) => (
                    <label key={p} className="flex flex-col gap-1.5 text-base text-pergaminho">
                      <span className="font-serif">{p}</span>
                      <textarea rows={2} value={respostas[p] ?? ""} onChange={(e) => setRespostas({ ...respostas, [p]: e.target.value })}
                        className={cn(campoTexto, "min-h-0 text-base")} />
                    </label>
                  ))}
                </div>
              </aside>
            </div>

            <div className="sticky bottom-0 mt-6 flex justify-end gap-3 bg-gradient-to-t from-noite from-60% py-4">
              <BotaoOuro variant="outline" onClick={fechar}>Cancelar</BotaoOuro>
              <BotaoOuro disabled={!nome.trim()} onClick={() => salvar({ ...existente, id: existente?.id ?? novoId(), tipo: tipoId, nome: nome.trim(), texto, respostas })}>Salvar entidade</BotaoOuro>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
