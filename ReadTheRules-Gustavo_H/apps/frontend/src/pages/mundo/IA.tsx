import { useEffect, useRef, useState } from "react";
import { Bot, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { procurarNoCompendio } from "./Compendio";

type Msg = { de: "voce" | "ia"; texto: string };

// Palavras que indicam pergunta sobre o jogo; fora disso a IA recusa.
const DO_JOGO = /regra|magia|feiti|classe|ra[çc]a|combate|ficha|teste|dano|n[íi]vel|mestre|jogador|sess[ãa]o|monstro|criatura|dado|d20|atributo|per[íi]cia|ritual|nex|sanidade|condi[çc][ãa]o|a[çc][ãa]o|turno|iniciativa|arma|armadura|pv|vida|cura|personagem|npc|encontro|xp|experi[êe]ncia|tesouro|campanha/i;

// shortcut: respostas de demonstração montadas no navegador; ligar ao /ia do back-end quando as campanhas daqui existirem na API.
function responder(sistema: string, pergunta: string): string {
  const item = procurarNoCompendio(sistema, pergunta);
  if (item) return `Sobre ${item.nome} em ${sistema}: ${item.texto ?? ""}${item.info?.length ? `\n(${item.info.join(" · ")})` : ""}`;
  if (!DO_JOGO.test(pergunta) && !pergunta.toLowerCase().includes(sistema.toLowerCase()))
    return `Eu só respondo perguntas sobre ${sistema}, o sistema desta campanha. Tente perguntar sobre regras, classes, combate ou criaturas.`;
  return `Boa pergunta sobre ${sistema}. Na versão final eu respondo com base nas regras do sistema e no material da campanha. Por enquanto estou em modo de demonstração: consulte o Compêndio para a regra exata.`;
}

export function ChatIA({ sistema, className, saudacao }: { sistema: string; className?: string; saudacao?: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([{ de: "ia", texto: saudacao ?? `Olá, mestre. Pergunte qualquer coisa sobre ${sistema}.` }]);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const fim = useRef<HTMLDivElement>(null);
  useEffect(() => { fim.current?.scrollIntoView({ block: "nearest" }); }, [msgs, pensando]);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const p = texto.trim(); if (!p || pensando) return;
    setMsgs((m) => [...m, { de: "voce", texto: p }]); setTexto(""); setPensando(true);
    window.setTimeout(() => { setMsgs((m) => [...m, { de: "ia", texto: responder(sistema, p) }]); setPensando(false); }, 700);
  };

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div data-lenis-prevent role="log" aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-1">
        {msgs.map((m, i) => (
          <div key={i} className={cn("flex gap-2", m.de === "voce" && "flex-row-reverse")}>
            {m.de === "ia" && <span className="grid size-8 shrink-0 place-items-center rounded-full border border-ouro/40 bg-ouro/10 text-ouro"><Bot className="size-4" /></span>}
            <p className={cn("m-0 max-w-[85%] rounded-2xl px-4 py-2 text-base leading-snug whitespace-pre-line",
              m.de === "voce" ? "rounded-br-sm bg-ouro text-noite" : "rounded-bl-sm border border-border bg-card text-texto/90")}>{m.texto}</p>
          </div>
        ))}
        {pensando && <p className="m-0 pl-10 text-sm text-texto/50">Pensando…</p>}
        <div ref={fim} />
      </div>
      <form onSubmit={enviar} className="mt-3 flex items-center gap-2 rounded-full border border-border bg-input py-1 pr-1 pl-4 focus-within:border-ouro">
        <input aria-label="Pergunta para a IA" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={`Pergunte sobre ${sistema}…`}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 font-serif text-base text-texto focus:outline-none" />
        <button aria-label="Enviar" disabled={!texto.trim() || pensando} className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-ouro text-noite disabled:opacity-40"><Send className="size-4" /></button>
      </form>
    </div>
  );
}
