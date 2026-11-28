import { useState } from "react";
import { Ban, CalendarCheck, CalendarPlus, CalendarX, Lock, ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import { BotaoOuro, Campo } from "@/components/Campo";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { iso, nomeJogador, novoId, useCampanhas, useImpedimentos, usePersistido, useRoteiros, useSessoes, type Campanha, type Roteiro, type Sessao, type StatusConvite } from "./dados";
import { Modal, Rotulo, TituloSecao, campoTexto } from "./ui";
import { meuId } from "./servidor";

const SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const SEMANA_PLURAL = ["domingos", "segundas", "terças", "quartas", "quintas", "sextas", "sábados"];

// Dias desativados pelo mestre: dias da semana inteiros, dias soltos e as exceções reativadas de um dia da semana desativado.
type Bloqueios = { semana: number[]; dias: string[]; liberados: string[] };
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const dataBr = (d: string) => d.split("-").reverse().join("/");

const STATUS: Record<StatusConvite, { rotulo: string; cor: string }> = {
  pendente: { rotulo: "Pendente", cor: "border-pergaminho/40 text-pergaminho" },
  confirmado: { rotulo: "Confirmado", cor: "border-emerald-400/40 text-emerald-300" },
  recusado: { rotulo: "Recusado", cor: "border-sangue-claro/50 text-sangue-claro" },
};

// Com campanhaId, mostra só as sessões daquela campanha (página da campanha); sem ele, todas (home).
export function CalendarioColaborativo({ campanhaId }: { campanhaId?: string }) {
  const [todasCampanhas] = useCampanhas();
  const [todasSessoes, setSessoes] = useSessoes();
  const [impedimentos, setImpedimentos] = useImpedimentos();
  const [roteiros] = useRoteiros();
  const campanhas = campanhaId ? todasCampanhas.filter((c) => c.id === campanhaId) : todasCampanhas;
  const sessoes = campanhaId ? todasSessoes.filter((s) => s.campanhaId === campanhaId) : todasSessoes;
  const hoje = iso(new Date());
  const [mes, setMes] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [sel, setSel] = useState<string>();
  const [aviso, setAviso] = useState("");
  const [marcar, setMarcar] = useState(false);
  const [convidar, setConvidar] = useState<Sessao>();
  const [verConvidados, setVerConvidados] = useState(false);
  const [bloq, setBloq] = usePersistido<Bloqueios>("rtr-bloqueios", { semana: [], dias: [], liberados: [] });

  const passado = (k: string) => k < hoje;
  const semanaDe = (k: string) => new Date(k + "T12:00").getDay();
  const desativado = (k: string) => bloq.dias.includes(k) || (bloq.semana.includes(semanaDe(k)) && !bloq.liberados.includes(k));
  const indisponivel = (k: string) => passado(k) || desativado(k);
  const sem = (l: string[], k: string) => l.filter((x) => x !== k);
  const desativar = (k: string) => setBloq({ ...bloq, dias: [...sem(bloq.dias, k), k], liberados: sem(bloq.liberados, k) });
  const ativar = (k: string) => setBloq({ ...bloq, dias: sem(bloq.dias, k), liberados: bloq.semana.includes(semanaDe(k)) ? [...sem(bloq.liberados, k), k] : bloq.liberados });
  // Alternar um dia da semana inteiro zera as exceções daquele dia da semana.
  const alternarSemana = (n: number) => setBloq({
    semana: bloq.semana.includes(n) ? bloq.semana.filter((x) => x !== n) : [...bloq.semana, n],
    dias: bloq.dias.filter((k) => semanaDe(k) !== n),
    liberados: bloq.liberados.filter((k) => semanaDe(k) !== n),
  });

  const eu = meuId() ?? "";
  const campanha = (id: string) => campanhas.find((c) => c.id === id);
  // Cada sessão é vista como mestre ou como jogador, conforme o papel na campanha dela.
  const mestreDe = (s: Sessao) => campanha(s.campanhaId)?.papel === "mestre";
  const minhas = campanhas.filter((c) => c.papel === "mestre");
  const mestre = !campanhas.length || minhas.length > 0; // ferramentas de marcar e bloquear dias
  const doDia = (d: string) => sessoes.filter((s) => s.data === d);

  // Semanas que cobrem o mês, começando no domingo.
  const inicio = new Date(mes.getFullYear(), mes.getMonth(), 1 - mes.getDay());
  const total = Math.ceil((mes.getDay() + new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()) / 7) * 7;
  const dias = Array.from({ length: total }, (_, i) => new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i));
  const mudarMes = (n: number) => { setMes(new Date(mes.getFullYear(), mes.getMonth() + n, 1)); setSel(undefined); };

  // Ações sobre o dia selecionado; dias que já passaram nunca podem ser usados nem reativados.
  const exigirDia = (acao: (k: string) => void, livre = false) => () => {
    if (!sel) return setAviso("Selecione um dia para poder marcar sua sessão.");
    if (passado(sel)) return setAviso("Esse dia já passou e não pode ser alterado.");
    if (!livre && desativado(sel)) return setAviso("Esse dia está desativado. Ative-o para usar.");
    setAviso(""); acao(sel);
  };
  const responder = (s: Sessao, st: StatusConvite) => setSessoes((l) => l.map((x) => x.id === s.id ? { ...x, convites: { ...x.convites, [eu]: st } } : x));

  return (
    <section id="calendario" aria-labelledby="t-calendario" className="scroll-mt-24" data-surge>
      <TituloSecao id="t-calendario">Calendário colaborativo</TituloSecao>

      <div>
        <span className="inline-block bg-sangue py-1.5 pr-9 pl-4 font-display text-sm font-semibold tracking-wide text-texto [clip-path:polygon(0_0,85%_0,100%_100%,0_100%)]">Calendário</span>
        <div className="rounded-tr-2xl rounded-b-2xl border border-border bg-card/50 p-3 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h3 className="m-0 font-display text-2xl text-sangue-claro sm:text-3xl" aria-live="polite">
              {MESES[mes.getMonth()]} <span className="text-lg text-pergaminho/60">{mes.getFullYear()}</span>
            </h3>
            <div className="flex gap-1">
              <button aria-label="Mês anterior" onClick={() => mudarMes(-1)} className="grid size-9 cursor-pointer place-items-center rounded-full border border-border bg-transparent text-pergaminho hover:border-ouro hover:text-ouro"><ChevronLeft className="size-4" /></button>
              <button aria-label="Próximo mês" onClick={() => mudarMes(1)} className="grid size-9 cursor-pointer place-items-center rounded-full border border-border bg-transparent text-pergaminho hover:border-ouro hover:text-ouro"><ChevronRight className="size-4" /></button>
            </div>
            {mestre && <BotaoOuro variant="outline" className="ml-auto h-9 px-4 text-sm" onClick={() => setVerConvidados(true)}><Users /> Jogadores convidados</BotaoOuro>}
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-7 bg-ouro">
              {SEMANA.map((d, n) => {
                const off = bloq.semana.includes(n);
                const cls = cn("py-2 text-center font-display text-xs font-semibold tracking-wider text-noite uppercase sm:text-sm", off && "line-through opacity-50");
                return mestre ? (
                  <button key={d} onClick={() => alternarSemana(n)} aria-pressed={off} title={`${off ? "Reativar" : "Desativar"} todas as ${SEMANA_PLURAL[n]}`}
                    className={cn(cls, "cursor-pointer border-0 bg-transparent hover:bg-black/10")}>{d}</button>
                ) : <div key={d} className={cls}>{d}</div>;
              })}
            </div>
            <div role="grid" aria-label="Dias do mês" className="grid grid-cols-7 gap-px bg-border">
              {dias.map((d) => {
                const k = iso(d);
                const fora = d.getMonth() !== mes.getMonth();
                const ss = doDia(k);
                const bloqueado = mestre && impedimentos.includes(k);
                const off = mestre && !fora && !passado(k) && desativado(k);
                return (
                  <button
                    key={k} role="gridcell" aria-selected={sel === k}
                    aria-label={`${d.getDate()} de ${MESES[d.getMonth()]}${ss.length ? `, ${ss.length} sessão` : ""}${bloqueado ? ", impedimento" : ""}${off ? ", desativado" : ""}${passado(k) ? ", já passou" : ""}`}
                    onClick={() => { setSel(sel === k ? undefined : k); setAviso(""); }}
                    className={cn(
                      "relative flex min-h-16 cursor-pointer flex-col items-stretch gap-1 border-0 bg-card p-1 text-left transition-colors sm:min-h-24 sm:p-2",
                      "hover:bg-input",
                      fora && "bg-noite/70 text-texto/30",
                      !fora && passado(k) && "bg-noite/60 text-texto/35",
                      off && "bg-noite text-texto/35",
                      ss.length > 0 && "bg-sangue/25 hover:bg-sangue/35",
                      bloqueado && "bg-[repeating-linear-gradient(135deg,#1f1f29_0_8px,#2a1a1f_8px_16px)]",
                      sel === k && "z-10 outline-2 -outline-offset-2 outline-ouro",
                    )}
                  >
                    <span className={cn("self-end font-display text-sm sm:text-lg",
                      k === hoje && "grid size-7 place-items-center rounded-full bg-ouro text-noite sm:size-8")}>{d.getDate()}</span>
                    {ss.map((s) => {
                      const st = mestreDe(s) ? undefined : s.convites[eu];
                      return (
                        <span key={s.id} className={cn("truncate rounded px-1 py-0.5 font-display text-[0.6rem] font-semibold sm:text-xs",
                          st === "pendente" ? "border border-dashed border-ouro text-ouro" : st === "recusado" ? "bg-input text-texto/50 line-through" : "bg-ouro text-noite")}>
                          <span className="sm:hidden">S{s.numero}</span>
                          <span className="hidden sm:inline">Sessão {s.numero}</span>
                        </span>
                      );
                    })}
                    {off && <span className="flex items-center gap-1 text-[0.6rem] text-texto/45 sm:text-xs"><Lock className="size-3" /><span className="hidden sm:inline">Desativado</span></span>}
                    {bloqueado && <span className="flex items-center gap-1 text-[0.6rem] text-sangue-claro sm:text-xs"><Ban className="size-3" /><span className="hidden sm:inline">Impedimento</span></span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1">
              {sel && <DetalhesDia dia={sel} sessoes={doDia(sel)} campanha={campanha} mestreDe={mestreDe} eu={eu} responder={responder} roteiros={roteiros} />}
              {!sel && <p className="m-0 text-base text-texto/60">{mestre ? "Clique em um dia para ver ou marcar sessões. Clique no nome de um dia da semana para desativar ou reativar todos eles." : "Clique em um dia com sessão para confirmar ou recusar sua presença."}</p>}
            </div>
            {mestre && (
              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="flex flex-wrap justify-end gap-2">
                  {sel && desativado(sel) && !passado(sel)
                    ? <BotaoOuro variant="outline" className="h-10 text-sm" onClick={exigirDia(ativar, true)}><CalendarCheck /> Ativar</BotaoOuro>
                    : <BotaoOuro variant="outline" className="h-10 text-sm" onClick={exigirDia(desativar)}><CalendarX /> Desativar</BotaoOuro>}
                  <BotaoOuro variant="outline" className="h-10 text-sm" onClick={exigirDia((k) =>
                    setImpedimentos((l) => l.includes(k) ? l.filter((d) => d !== k) : [...l, k]))}>
                    <Ban /> {sel && impedimentos.includes(sel) ? "Remover impedimento" : "Adicionar impedimento"}
                  </BotaoOuro>
                  <BotaoOuro className="h-10 text-sm" onClick={exigirDia(() => setMarcar(true))}><CalendarPlus /> Marcar sessão</BotaoOuro>
                </div>
                <p role="alert" className="m-0 min-h-6 text-base text-sangue-claro">{aviso}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {marcar && sel && (
        <MarcarSessao dia={sel} campanhas={minhas} sessoes={sessoes} aoFechar={() => setMarcar(false)}
          adicionar={(s) => { setSessoes((l) => [...l, s]); setMarcar(false); setConvidar(s); }} />
      )}
      {convidar && (
        <EnviarConvites sessao={convidar} jogadores={campanha(convidar.campanhaId)?.jogadores ?? []}
          aoFechar={() => setConvidar(undefined)}
          enviar={(ids) => {
            setSessoes((l) => l.map((x) => x.id === convidar.id ? { ...x, convites: Object.fromEntries(ids.map((i) => [i, "pendente" as const])) } : x));
            setConvidar(undefined);
          }} />
      )}
      <Modal aberto={verConvidados} aoFechar={() => setVerConvidados(false)} titulo="Jogadores convidados" descricao="Quem já respondeu às próximas sessões.">
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {sessoes.filter((s) => s.data >= hoje && mestreDe(s)).sort((a, b) => a.data.localeCompare(b.data)).map((s) => (
            <li key={s.id} className="rounded-xl border border-border bg-input/40 p-4">
              <p className="m-0 font-display text-base text-ouro">Sessão {s.numero} · {dataBr(s.data)}</p>
              <p className="m-0 text-sm text-texto/60">{campanha(s.campanhaId)?.nome ?? "Sem campanha"}</p>
              <Convidados convites={s.convites} />
            </li>
          ))}
          {!sessoes.some((s) => s.data >= hoje && mestreDe(s)) && <li className="text-texto/60">Nenhuma sessão marcada daqui para frente.</li>}
        </ul>
      </Modal>
    </section>
  );
}

function Convidados({ convites }: { convites: Sessao["convites"] }) {
  const lista = Object.entries(convites);
  if (!lista.length) return <p className="mt-2 mb-0 text-sm text-texto/50">Nenhum convite enviado.</p>;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {lista.map(([id, st]) => (
        <span key={id} className={cn("rounded-full border px-2.5 py-0.5 text-sm", STATUS[st].cor)}>{nomeJogador(id)} · {STATUS[st].rotulo}</span>
      ))}
    </div>
  );
}

function DetalhesDia({ dia, sessoes, campanha, mestreDe, eu, responder, roteiros }: {
  dia: string; sessoes: Sessao[]; campanha: (id: string) => Campanha | undefined; mestreDe: (s: Sessao) => boolean; eu: string; responder: (s: Sessao, st: StatusConvite) => void; roteiros: Roteiro[];
}) {
  if (!sessoes.length) return <p className="m-0 text-base text-texto/70">{dataBr(dia)}: nenhuma sessão neste dia.</p>;
  return (
    <div className="flex flex-col gap-3">
      {sessoes.map((s) => (
        <article key={s.id} className="rounded-xl border border-ouro/25 bg-card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="m-0 font-display text-lg text-ouro">Sessão {s.numero} · {campanha(s.campanhaId)?.nome ?? "Sem campanha"}</h4>
            <span className="font-display text-xs text-pergaminho/80">Nível {s.nivel}</span>
          </div>
          <p className="mt-1 mb-0 flex flex-wrap gap-x-4 text-base text-texto/70">
            <span className="flex items-center gap-1"><MapPin className="size-4" />{s.local || "Local a definir"}</span>
            <span className="flex items-center gap-1"><Clock className="size-4" />{s.inicio}{s.fim && ` às ${s.fim}`}</span>
          </p>
          {s.sinopse && <p className="mt-2 mb-0 text-base">{s.sinopse}</p>}
          {mestreDe(s) && roteiros.filter((r) => r.sessaoId === s.id).map((r) => (
            <Link key={r.id} to={`/mundo/${r.campanhaId}/sessao/${r.id}`} className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-ouro/40 px-3 py-0.5 font-display text-xs text-ouro hover:bg-ouro/10">
              Roteiro anexado: {r.titulo || `Sessão ${r.numero}`} (só você vê)
            </Link>
          ))}
          {mestreDe(s) ? <Convidados convites={s.convites} /> : (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full border px-2.5 py-0.5 text-sm", STATUS[(s.convites[eu] ?? "pendente")].cor)}>{STATUS[(s.convites[eu] ?? "pendente")].rotulo}</span>
              {(s.convites[eu] ?? "pendente") !== "confirmado" && <BotaoOuro className="h-9 text-sm" onClick={() => responder(s, "confirmado")}>Confirmar presença</BotaoOuro>}
              {(s.convites[eu] ?? "pendente") !== "recusado" && <BotaoOuro variant="outline" className="h-9 text-sm" onClick={() => responder(s, "recusado")}>Não vou poder</BotaoOuro>}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function MarcarSessao({ dia, campanhas, sessoes, aoFechar, adicionar }: {
  dia: string; campanhas: Campanha[]; sessoes: Sessao[]; aoFechar: () => void; adicionar: (s: Sessao) => void;
}) {
  const proximo = (cid: string) => Math.max(0, ...sessoes.filter((s) => s.campanhaId === cid).map((s) => s.numero)) + 1;
  const c0 = campanhas[0];
  const [f, setF] = useState({ campanhaId: c0?.id ?? "", numero: proximo(c0?.id ?? ""), local: "", inicio: "19:00", fim: "23:00", nivel: c0?.nivel ?? 1, sinopse: "" });
  const trocarCampanha = (id: string) => setF({ ...f, campanhaId: id, numero: proximo(id), nivel: campanhas.find((c) => c.id === id)?.nivel ?? f.nivel });

  return (
    <Modal aberto aoFechar={aoFechar} titulo={<>Marcar sessão <span className="ml-2 font-serif text-lg text-pergaminho">{dataBr(dia)}</span></>}>
      <form className="flex flex-col gap-4" onSubmit={(e) => {
        e.preventDefault();
        adicionar({ ...f, id: novoId(), data: dia, local: f.local.trim(), sinopse: f.sinopse.trim(), convites: {} });
      }}>
        <div className="grid grid-cols-[1fr_6.5rem] gap-3">
          <Rotulo texto="Campanha">
            <select className={campoTexto} value={f.campanhaId} onChange={(e) => trocarCampanha(e.target.value)}>
              {campanhas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              {!campanhas.length && <option value="">Sem campanha</option>}
            </select>
          </Rotulo>
          <Campo label="Sessão Nº" type="number" min={1} required value={f.numero} onChange={(e) => setF({ ...f, numero: Number(e.target.value) })} />
        </div>
        <Campo label="Local onde irá ocorrer" required value={f.local} onChange={(e) => setF({ ...f, local: e.target.value })} placeholder="Casa do Bruno, Discord, loja…" />
        <div className="grid grid-cols-3 gap-3">
          <Campo label="Chegada" type="time" required value={f.inicio} onChange={(e) => setF({ ...f, inicio: e.target.value })} />
          <Campo label="Término" type="time" required value={f.fim} onChange={(e) => setF({ ...f, fim: e.target.value })} />
          <Campo label="Nível da mesa" type="number" min={1} max={20} required value={f.nivel} onChange={(e) => setF({ ...f, nivel: Number(e.target.value) })} />
        </div>
        <Rotulo texto="Sinopse da sessão">
          <textarea className={cn(campoTexto, "min-h-24")} maxLength={500} value={f.sinopse} onChange={(e) => setF({ ...f, sinopse: e.target.value })} placeholder="O que vai acontecer (sem spoilers para os jogadores)?" />
        </Rotulo>
        <div className="mt-2 flex justify-end gap-3">
          <BotaoOuro type="button" variant="outline" onClick={aoFechar}>Cancelar</BotaoOuro>
          <BotaoOuro type="submit">Adicionar</BotaoOuro>
        </div>
      </form>
    </Modal>
  );
}

function EnviarConvites({ sessao, jogadores, aoFechar, enviar }: { sessao: Sessao; jogadores: string[]; aoFechar: () => void; enviar: (ids: string[]) => void }) {
  const [marcados, setMarcados] = useState(jogadores);
  return (
    <Modal aberto aoFechar={aoFechar} titulo="Enviar pedido de confirmação" descricao={`Sessão ${sessao.numero} em ${dataBr(sessao.data)}. O convite aparece no calendário de cada jogador.`}>
      {jogadores.length ? (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {jogadores.map((id) => (
            <li key={id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-input/40 px-4 py-3 font-serif text-lg text-texto hover:border-ouro/50">
                <input type="checkbox" className="size-5 accent-[#bd9b60]" checked={marcados.includes(id)}
                  onChange={() => setMarcados(marcados.includes(id) ? marcados.filter((m) => m !== id) : [...marcados, id])} />
                {nomeJogador(id)}
              </label>
            </li>
          ))}
        </ul>
      ) : <p className="text-texto/70">Essa campanha ainda não tem jogadores.</p>}
      <div className="mt-6 flex justify-end gap-3">
        <BotaoOuro variant="outline" onClick={aoFechar}>Agora não</BotaoOuro>
        <BotaoOuro disabled={!marcados.length} onClick={() => enviar(marcados)}>Enviar pedidos</BotaoOuro>
      </div>
    </Modal>
  );
}
