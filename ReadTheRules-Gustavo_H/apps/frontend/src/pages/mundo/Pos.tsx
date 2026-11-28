import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Bot, FileText, Lightbulb, ScrollText, Sparkles, Trash2, Upload } from "lucide-react";
import { BotaoOuro } from "@/components/Campo";
import { cn } from "@/lib/utils";
import { novoId, useArquivos, useRoteiros, type Arquivo, type Roteiro } from "../homeLogada/dados";
import { avisar, motivo, perguntarIA } from "../homeLogada/servidor";
import { BlocoResumo } from "./Intra";
import { Vazio } from "./Moldura";
import { useCampanha } from "./Mundo";

const dataBr = (d?: string) => d?.split("-").reverse().join("/") ?? "";
const kb = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);
const primeiraFrase = (r: Roteiro) => (r.resumo.find((b) => b.tipo === "texto" && b.texto.trim()) as { texto: string } | undefined)?.texto.split(/(?<=[.!?])\s/)[0] ?? "Sem resumo escrito.";

// Reserva montada no navegador, para quando a IA do servidor não responder.
function resumoCampanha(nome: string, sessoes: Roteiro[], arquivos: Arquivo[]) {
  if (!sessoes.length) return "Ainda não há sessões encerradas para resumir.";
  const combates = sessoes.reduce((n, r) => n + r.resumo.filter((b) => b.tipo === "combate" && b.estado === "inicio").length, 0);
  return [`${nome}, até aqui: ${sessoes.length} ${sessoes.length > 1 ? "sessões jogadas" : "sessão jogada"} e ${combates} ${combates === 1 ? "combate" : "combates"}.`,
    ...sessoes.map((r) => `• Sessão ${r.numero}${r.titulo ? ` (${r.titulo})` : ""}: ${primeiraFrase(r)}`),
    arquivos.length ? `Também considerei ${arquivos.length} ${arquivos.length > 1 ? "arquivos" : "arquivo"} de contexto que você enviou.` : ""].filter(Boolean).join("\n");
}
function conselhos(sessoes: Roteiro[]) {
  const notas = sessoes.flatMap((r) => r.resumo.filter((b) => b.tipo === "nota").map((b) => (b as { texto: string }).texto));
  return ["Ideias para a próxima sessão:",
    ...notas.slice(-3).map((n) => `• Retome a nota que ficou pendente: "${n}"`),
    "• Abra com uma consequência direta do fim da última sessão, para dar sensação de mundo vivo.",
    "• Dê a cada jogador um momento de destaque ligado ao passado do personagem.",
    "• Alterne o ritmo: depois de combate, uma cena de investigação ou de conversa."].join("\n");
}

// Pós Sessão (sem barra lateral): sessões encerradas à esquerda, leitura e IA no centro, arquivos de contexto à direita.
export function Pos() {
  const campanha = useCampanha();
  const [roteiros] = useRoteiros();
  const [arquivos, setArquivos] = useArquivos();
  const [params, setParams] = useSearchParams();
  const [ia, setIa] = useState<string>();
  const [pensando, setPensando] = useState(false);
  const pedir = (pergunta: string, tipo: string, reserva: () => string) => {
    setPensando(true); setIa(undefined);
    perguntarIA(campanha.id, `(Sistema da campanha: ${campanha.sistema}.)\n${pergunta}`, tipo)
      .catch((e: Error) => `A IA do servidor não respondeu${motivo(e)}. Versão montada no navegador:\n\n${reserva()}`)
      .then((r) => { setIa(r); setPensando(false); });
  };
  const base64 = (f: File) => new Promise<string>((ok, falha) => {
    const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1]); r.onerror = falha; r.readAsDataURL(f);
  });
  const encerradas = roteiros.filter((r) => r.campanhaId === campanha.id && r.status === "encerrada").sort((a, b) => b.numero - a.numero);
  const meus = arquivos.filter((a) => a.campanhaId === campanha.id);
  const atual = encerradas.find((r) => r.id === params.get("sessao"));

  const enviar = async (lista: FileList | null) => {
    if (!lista) return;
    // o back-end lê texto puro e PDF (em base64); DOCX ainda não
    const aceitos = [...lista].filter((f) => /\.(txt|md|pdf)$/i.test(f.name) || (avisar(`${f.name}: o servidor só lê .txt, .md e .pdf.`), false));
    const novos = await Promise.all(aceitos.map(async (f): Promise<Arquivo> => ({
      id: novoId(), campanhaId: campanha.id, nome: f.name, tamanho: f.size, enviadoEm: new Date().toISOString(),
      ...(/\.pdf$/i.test(f.name) ? { pdf: await base64(f) } : { conteudo: await f.text() }),
    })));
    setArquivos((l) => [...novos, ...l]);
  };

  return (
    <div className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-[280px_1fr_320px]">
      {/* histórico de sessões, como as conversas antigas de um chat */}
      <aside aria-label="Sessões encerradas" className="border-b border-border bg-card/40 p-4 lg:border-r lg:border-b-0">
        <button onClick={() => setParams({})} aria-current={!atual}
          className={cn("mb-4 flex w-full cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-left font-display text-sm transition-colors",
            !atual ? "border-ouro/60 bg-ouro/10 text-ouro" : "border-border bg-card text-pergaminho hover:border-pergaminho/50")}>
          <Sparkles className="size-4" /> Visão geral da campanha
        </button>
        <p className="mt-0 mb-2 font-display text-xs tracking-[0.2em] text-texto/45 uppercase">Sessões encerradas</p>
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {encerradas.map((r) => (
            <li key={r.id}>
              <button onClick={() => setParams({ sessao: r.id })} aria-current={atual?.id === r.id}
                className={cn("w-full cursor-pointer rounded-lg border-0 px-3 py-2.5 text-left transition-colors", atual?.id === r.id ? "bg-input" : "bg-transparent hover:bg-input/60")}>
                <span className="block truncate font-display text-sm text-texto">Sessão {r.numero}{r.titulo && ` · ${r.titulo}`}</span>
                <span className="block text-sm text-texto/45">Encerrada em {dataBr(r.encerradaEm)}</span>
              </button>
            </li>
          ))}
          {!encerradas.length && <li className="px-3 text-base text-texto/50">Nenhuma sessão encerrada ainda.</li>}
        </ul>
      </aside>

      <section className="min-w-0 px-4 py-8 sm:px-8">
        {atual ? (
          <article className="mx-auto max-w-3xl">
            <p className="m-0 font-display text-xs tracking-[0.2em] text-ouro uppercase">Sessão {atual.numero} · {dataBr(atual.encerradaEm)}</p>
            <h1 className="mt-1 mb-6 font-display text-3xl text-texto">{atual.titulo || `Sessão ${atual.numero}`}</h1>
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/70 px-5 py-6 sm:px-8">
              {atual.resumo.length ? atual.resumo.map((b) => <BlocoResumo key={b.id} b={b} leitura />) : <p className="m-0 text-texto/50">O resumo ficou em branco.</p>}
            </div>
          </article>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <div>
              <h1 className="m-0 font-display text-3xl font-semibold text-sangue-claro">Pós Sessão</h1>
              <p className="mt-1 mb-0 text-lg text-texto/60">Releia as sessões e peça ajuda à IA para continuar a história.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <BotaoOuro disabled={pensando} onClick={() => pedir("Resuma a campanha até aqui, sessão por sessão, destacando ganchos em aberto.", "resumo", () => resumoCampanha(campanha.nome, [...encerradas].reverse(), meus))}><ScrollText /> Resumir a campanha</BotaoOuro>
              <BotaoOuro variant="outline" disabled={pensando} onClick={() => pedir("Dê ideias concretas para a próxima sessão, retomando notas e ganchos pendentes.", "conselho", () => conselhos([...encerradas].reverse()))}><Lightbulb /> Como seguir a história?</BotaoOuro>
            </div>
            {pensando ? <p className="m-0 text-lg text-texto/60">A IA está lendo a campanha…</p> : ia ? (
              <div className="flex gap-3 rounded-2xl border border-ouro/30 bg-card p-5 animate-[surgir_.3s_var(--ease-out)]">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-ouro/40 bg-ouro/10 text-ouro"><Bot className="size-4" /></span>
                <p className="m-0 text-lg leading-relaxed whitespace-pre-line text-texto/90">{ia}</p>
              </div>
            ) : <Vazio icone={Bot} titulo="A IA da campanha" texto="Ela lê as sessões encerradas e os arquivos que você enviar. Escolha uma das opções acima." />}
            <p className="m-0 text-sm text-texto/40">A IA do servidor lê as sessões encerradas, as notas, as entidades e os arquivos desta campanha.</p>
          </div>
        )}
      </section>

      <aside aria-label="Arquivos de contexto" className="border-t border-border bg-card/40 p-4 lg:border-t-0 lg:border-l">
        <p className="mt-0 mb-1 font-display text-sm text-pergaminho">Arquivos de contexto</p>
        <p className="mt-0 mb-3 text-sm text-texto/50">Anotações, mapas, histórias feitas fora daqui. A IA usa como conhecimento.</p>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-ouro/40 bg-input/40 px-4 py-6 text-center text-pergaminho transition-colors hover:border-ouro hover:text-ouro"
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); enviar(e.dataTransfer.files); }}>
          <Upload className="size-6" />
          <span className="font-display text-sm">Enviar arquivos</span>
          <span className="text-xs text-texto/45">.txt, .md, .pdf · ou arraste aqui</span>
          <input type="file" multiple accept=".txt,.md,.pdf" className="sr-only" onChange={(e) => { enviar(e.target.files); e.target.value = ""; }} />
        </label>
        <p className="mt-5 mb-2 font-display text-xs tracking-[0.2em] text-texto/45 uppercase">Histórico</p>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {meus.map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
              <FileText className="size-4 shrink-0 text-ouro" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base text-texto">{a.nome}</span>
                <span className="block text-xs text-texto/45">{a.tamanho ? `${kb(a.tamanho)} · ` : ""}{new Date(a.enviadoEm).toLocaleDateString("pt-BR")}</span>
              </span>
              <button aria-label={`Remover ${a.nome}`} onClick={() => setArquivos((l) => l.filter((x) => x.id !== a.id))} className="grid size-7 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-texto/40 hover:text-sangue-claro"><Trash2 className="size-4" /></button>
            </li>
          ))}
          {!meus.length && <li className="text-sm text-texto/45">Nenhum arquivo enviado.</li>}
        </ul>
      </aside>
    </div>
  );
}
