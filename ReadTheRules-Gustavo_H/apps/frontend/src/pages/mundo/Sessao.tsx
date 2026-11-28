import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, EyeOff } from "lucide-react";
import { BotaoOuro } from "@/components/Campo";
import { cn } from "@/lib/utils";
import { novoId, useRoteiros, useSessoes } from "../homeLogada/dados";
import { campoTexto } from "../homeLogada/ui";
import { useCampanha } from "./Mundo";

type Pergunta = { p: string; opcoes?: string[]; chave?: string };
const PERGUNTAS: Pergunta[] = [
  { p: "Haverá combate?", opcoes: ["Sim", "Não", "Talvez"], chave: "combate" },
  { p: "Qual o clima da sessão?", opcoes: ["Ação", "Mistério", "Drama", "Exploração", "Horror", "Humor"], chave: "clima" },
  { p: "Qual o objetivo dos jogadores nesta sessão?" },
  { p: "Algo de muito importante vai acontecer? O quê?" },
  { p: "Qual o gancho de abertura?" },
  { p: "Onde a sessão se passa?" },
  { p: "Quais NPCs devem aparecer?" },
  { p: "Que segredo ou pista pode ser revelado?" },
  { p: "Que recompensas estão previstas?" },
  { p: "Plano B: e se os jogadores fugirem do roteiro?" },
  { p: "Como a sessão deve terminar?" },
];
const dataBr = (d: string) => d.split("-").reverse().join("/");

// "Escrever Sessão": mesmo esquema do criar entidade, com texto livre e perguntas que segmentam a sessão.
export function EscreverSessao() {
  const campanha = useCampanha();
  const { sid } = useParams();
  const nav = useNavigate();
  const [roteiros, setRoteiros] = useRoteiros();
  const [sessoes] = useSessoes();
  const daCampanha = roteiros.filter((r) => r.campanhaId === campanha.id);
  const existente = daCampanha.find((r) => r.id === sid);
  const [f, setF] = useState(() => existente ?? {
    id: novoId(), campanhaId: campanha.id, numero: Math.max(0, ...daCampanha.map((r) => r.numero)) + 1,
    titulo: "", texto: "", respostas: {} as Record<string, string>, status: "rascunho" as const, resumo: [], sessaoId: undefined as string | undefined,
  });
  const resp = (k: string, v: string) => setF({ ...f, respostas: { ...f.respostas, [k]: v } });
  const marcadas = sessoes.filter((s) => s.campanhaId === campanha.id).sort((a, b) => a.data.localeCompare(b.data));
  const palavras = f.texto.trim() ? f.texto.trim().split(/\s+/).length : 0;
  const voltar = () => nav(`/mundo/${campanha.id}`);

  const salvar = () => {
    setRoteiros((l) => {
      // um dia do calendário guarda só um roteiro: anexar aqui solta o anterior
      const solto = l.map((r) => (f.sessaoId && r.sessaoId === f.sessaoId && r.id !== f.id ? { ...r, sessaoId: undefined } : r));
      return solto.some((r) => r.id === f.id) ? solto.map((r) => (r.id === f.id ? f : r)) : [...solto, f];
    });
    voltar();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      <button onClick={voltar} className="flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 font-display text-sm text-pergaminho/80 hover:text-ouro">
        <ArrowLeft className="size-4" /> {campanha.nome}
      </button>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-ouro/40 px-3 py-1 font-display text-xs text-ouro">Sessão {f.numero}</span>
        <input aria-label="Título da sessão" placeholder="Título da sessão" value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 font-display text-3xl font-semibold text-texto placeholder:text-texto/30 focus:outline-none sm:text-4xl" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 rounded-xl border border-border bg-card/60 p-4 font-display text-sm text-pergaminho">
            Anexar a um dia do calendário
            <select className={cn(campoTexto, "text-base")} value={f.sessaoId ?? ""} onChange={(e) => setF({ ...f, sessaoId: e.target.value || undefined })}>
              <option value="">Não anexar</option>
              {marcadas.map((s) => <option key={s.id} value={s.id}>Sessão {s.numero} · {dataBr(s.data)} · {s.local}</option>)}
            </select>
            <span className="flex items-center gap-1.5 font-serif text-sm text-texto/55"><EyeOff className="size-3.5" /> Só você, mestre, vê o roteiro anexado. Os jogadores veem apenas a sessão marcada.</span>
          </label>
          <textarea value={f.texto} onChange={(e) => setF({ ...f, texto: e.target.value })} placeholder="Escreva a sessão livremente: cenas, falas, encontros, o que você quiser lembrar na mesa."
            className="min-h-[50svh] flex-1 rounded-xl border border-border bg-card p-5 text-lg leading-relaxed focus:border-ouro/60" />
          <p className="m-0 text-right text-sm text-texto/50">{palavras} palavras · {f.texto.length} caracteres</p>
        </div>
        <aside className="rounded-xl border border-border bg-card p-5">
          <h3 className="m-0 font-display text-sm tracking-[0.15em] text-ouro uppercase">Perguntas para guiar</h3>
          <p className="mt-1 mb-4 text-base text-texto/60">Responda as que ajudarem a enxergar a sessão.</p>
          <div className="flex flex-col gap-4">
            {PERGUNTAS.map(({ p, opcoes, chave }) => (
              opcoes ? (
                <fieldset key={p} className="m-0 border-0 p-0">
                  <legend className="mb-2 text-base text-pergaminho">{p}</legend>
                  <div className="flex flex-wrap gap-2">
                    {opcoes.map((o) => {
                      const ativo = f.respostas[chave!] === o;
                      return (
                        <button key={o} type="button" aria-pressed={ativo} onClick={() => resp(chave!, ativo ? "" : o)}
                          className={cn("cursor-pointer rounded-full border px-3.5 py-1 font-serif text-base transition-colors",
                            ativo ? "border-ouro bg-ouro/15 text-ouro" : "border-border bg-transparent text-texto/70 hover:border-pergaminho/60")}>{o}</button>
                      );
                    })}
                  </div>
                </fieldset>
              ) : (
                <label key={p} className="flex flex-col gap-1.5 text-base text-pergaminho">
                  <span className="font-serif">{p}</span>
                  <textarea rows={2} value={f.respostas[p] ?? ""} onChange={(e) => resp(p, e.target.value)} className={cn(campoTexto, "min-h-0 text-base")} />
                </label>
              )
            ))}
          </div>
        </aside>
      </div>

      <div className="sticky bottom-0 mt-6 flex justify-end gap-3 bg-gradient-to-t from-noite from-60% py-4">
        <BotaoOuro variant="outline" onClick={voltar}>Cancelar</BotaoOuro>
        <BotaoOuro onClick={salvar}>Salvar sessão</BotaoOuro>
      </div>
    </div>
  );
}
