import { useEffect, useState } from "react";
import { ChevronRight, Search, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { campoTexto } from "../homeLogada/ui";

type Item = { id: string; nome: string; info?: string[]; texto?: string };
type Categoria = { id: string; nome: string; itens: Item[] };

// shortcut: só o D&D 5e tem API pública (dnd5eapi.co, em inglês); os outros sistemas usam este conteúdo de exemplo até termos as fontes oficiais.
const MOCK: Record<string, Categoria[]> = {
  "D&D 5e": [
    { id: "classes", nome: "Classes", itens: [
      { id: "guerreiro", nome: "Guerreiro", info: ["Dado de vida: d10", "Atributo principal: Força ou Destreza"], texto: "Mestre do combate armado, com mais ataques por turno e fôlego para aguentar a linha de frente." },
      { id: "mago", nome: "Mago", info: ["Dado de vida: d6", "Atributo principal: Inteligência"], texto: "Estudioso das artes arcanas que prepara magias a partir do seu grimório." },
      { id: "ladino", nome: "Ladino", info: ["Dado de vida: d8", "Atributo principal: Destreza"], texto: "Especialista em perícias e em causar dano preciso com o ataque furtivo." },
    ] },
    { id: "racas", nome: "Raças", itens: [
      { id: "anao", nome: "Anão", info: ["Deslocamento: 7,5 m", "Visão no escuro"], texto: "Resistentes e teimosos, com tradição em forja e pedra." },
      { id: "elfo", nome: "Elfo", info: ["Deslocamento: 9 m", "Transe em vez de sono"], texto: "Graciosos e longevos, com sentidos aguçados." },
    ] },
    { id: "condicoes", nome: "Condições", itens: [
      { id: "caido", nome: "Caído", texto: "Só consegue rastejar. Ataques corpo a corpo contra ele têm vantagem; à distância, desvantagem." },
      { id: "atordoado", nome: "Atordoado", texto: "Incapacitado, não se move e fala com dificuldade. Falha em testes de Força e Destreza." },
    ] },
  ],
  Pathfinder: [
    { id: "ancestralidades", nome: "Ancestralidades", itens: [
      { id: "humano", nome: "Humano", info: ["PV de ancestralidade: 8"], texto: "Versáteis, ganham talentos extras de ancestralidade." },
      { id: "goblin", nome: "Goblin", info: ["PV de ancestralidade: 6"], texto: "Pequenos, curiosos e resistentes a quase qualquer coisa que comem." },
    ] },
    { id: "acoes", nome: "Ações", itens: [
      { id: "golpear", nome: "Golpear", info: ["1 ação"], texto: "Ataque com uma arma ou ataque desarmado. Cada golpe extra no turno sofre penalidade de ataques múltiplos." },
      { id: "passo", nome: "Passo", info: ["1 ação"], texto: "Move 1,5 m sem provocar reações." },
    ] },
    { id: "condicoes", nome: "Condições", itens: [
      { id: "desprevenido", nome: "Desprevenido", texto: "–2 de circunstância na CA." },
      { id: "amedrontado", nome: "Amedrontado", texto: "Penalidade de estado igual ao valor em todas as verificações; diminui 1 por turno." },
    ] },
  ],
  "Old Dragon": [
    { id: "classes", nome: "Classes", itens: [
      { id: "guerreiro", nome: "Guerreiro", texto: "Combatente com mais pontos de vida e acesso a todas as armas e armaduras." },
      { id: "clerigo", nome: "Clérigo", texto: "Servo de uma divindade, combate mortos-vivos e lança magias divinas." },
    ] },
    { id: "regras", nome: "Regras", itens: [
      { id: "jp", nome: "Jogada de Proteção", texto: "Rolagem de d20 para resistir a perigos, abaixo ou igual ao valor de proteção." },
      { id: "moral", nome: "Moral", texto: "Teste que decide se os inimigos continuam lutando ou fogem." },
    ] },
  ],
  "Ordem Paranormal": [
    { id: "classes", nome: "Classes", itens: [
      { id: "combatente", nome: "Combatente", texto: "Agente treinado para o confronto direto." },
      { id: "especialista", nome: "Especialista", texto: "Agente de perícias, investigação e soluções criativas." },
      { id: "ocultista", nome: "Ocultista", texto: "Agente que conjura rituais do Outro Lado, pagando o preço em sanidade." },
    ] },
    { id: "elementos", nome: "Elementos", itens: [
      { id: "sangue", nome: "Sangue", texto: "Elemento ligado à dor, paixão e intensidade." },
      { id: "morte", nome: "Morte", texto: "Elemento ligado ao tempo, ao fim e ao vazio." },
      { id: "conhecimento", nome: "Conhecimento", texto: "Elemento ligado à informação, à mente e aos símbolos." },
      { id: "energia", nome: "Energia", texto: "Elemento ligado ao caos, à mudança e à imprevisibilidade." },
    ] },
    { id: "regras", nome: "Regras", itens: [
      { id: "nex", nome: "NEX", texto: "Nível de exposição ao paranormal; marca a evolução do agente." },
      { id: "sanidade", nome: "Sanidade", texto: "Recurso que se perde ao encarar o Outro Lado." },
    ] },
  ],
};
MOCK.Outro = [{ id: "notas", nome: "Notas do sistema", itens: [{ id: "vazio", nome: "Sem fonte conectada", texto: "Este sistema ainda não tem uma base de regras ligada. Use as Notas da campanha ou envie arquivos na Pós Sessão." }] }];

const API = "https://www.dnd5eapi.co/api/2014";
const CAT_API = [["classes", "Classes"], ["races", "Raças"], ["spells", "Magias"], ["conditions", "Condições"], ["monsters", "Monstros"]] as const;
const buscar = async (url: string) => {
  const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
};

// Biblioteca de regras do sistema da campanha: categoria → item → detalhes.
export function Compendio({ sistema, compacto }: { sistema: string; compacto?: boolean }) {
  const [cats, setCats] = useState<Categoria[]>(MOCK[sistema] ?? MOCK.Outro);
  const [aoVivo, setAoVivo] = useState(false);
  const [cat, setCat] = useState(0);
  const [item, setItem] = useState<Item>();
  const [filtro, setFiltro] = useState("");

  useEffect(() => { // D&D 5e: tenta a API pública; se falhar, fica no conteúdo de exemplo
    if (sistema !== "D&D 5e") return;
    let vivo = true;
    Promise.all(CAT_API.map(([id, nome]) => buscar(`${API}/${id}`).then((d) => ({ id, nome, itens: d.results.map((x: any) => ({ id: x.index, nome: x.name })) }))))
      .then((c) => { if (vivo) { setCats(c); setAoVivo(true); } })
      .catch(() => {});
    return () => { vivo = false; };
  }, [sistema]);

  const abrir = async (i: Item) => {
    setItem(i);
    if (!aoVivo || i.texto) return;
    try {
      const d = await buscar(`${API}/${cats[cat].id}/${i.id}`);
      const info = Object.entries(d).filter(([k, v]) => !["index", "url", "name", "desc", "updated_at"].includes(k) && ["string", "number"].includes(typeof v)).map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`);
      setItem({ ...i, info, texto: Array.isArray(d.desc) ? d.desc.join("\n\n") : d.desc ?? "" });
    } catch { setItem({ ...i, texto: "Não foi possível carregar os detalhes agora." }); }
  };

  const itens = (cats[cat]?.itens ?? []).filter((i) => i.nome.toLowerCase().includes(filtro.toLowerCase()));

  return (
    <div className={cn("grid gap-4", compacto ? "grid-cols-1" : "md:grid-cols-[200px_260px_1fr]")}>
      <div className="flex flex-col gap-2">
        <p className="m-0 flex items-center gap-1.5 text-sm text-texto/50">
          {aoVivo ? <><Wifi className="size-3.5 text-emerald-300" /> dnd5eapi.co (em inglês)</> : <><WifiOff className="size-3.5" /> Conteúdo de exemplo</>}
        </p>
        <ul className={cn("m-0 flex list-none gap-1.5 p-0", compacto ? "flex-wrap" : "flex-col")}>
          {cats.map((c, n) => (
            <li key={c.id}>
              <button onClick={() => { setCat(n); setItem(undefined); setFiltro(""); }} aria-current={cat === n}
                className={cn("flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left font-display text-sm transition-colors",
                  cat === n ? "border-ouro/60 bg-ouro/10 text-ouro" : "border-border bg-card text-pergaminho hover:border-pergaminho/50")}>
                {c.nome} {!compacto && <ChevronRight className="size-4 opacity-60" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex min-h-0 flex-col gap-2">
        <label className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-texto/40" />
          <input aria-label="Filtrar" placeholder="Filtrar…" value={filtro} onChange={(e) => setFiltro(e.target.value)} className={cn(campoTexto, "pl-9 text-base")} />
        </label>
        <ul data-lenis-prevent className={cn("m-0 flex list-none flex-col gap-1 overflow-y-auto p-0", compacto ? "max-h-40" : "max-h-[55svh]")}>
          {itens.map((i) => (
            <li key={i.id}>
              <button onClick={() => abrir(i)} className={cn("w-full cursor-pointer rounded-md border-0 px-3 py-1.5 text-left font-serif text-base transition-colors",
                item?.id === i.id ? "bg-input text-ouro" : "bg-transparent text-texto/80 hover:bg-input/60")}>{i.nome}</button>
            </li>
          ))}
          {!itens.length && <li className="px-3 text-base text-texto/50">Nada encontrado.</li>}
        </ul>
      </div>
      <article data-lenis-prevent className={cn("overflow-y-auto rounded-xl border border-border bg-card p-5", compacto ? "max-h-56" : "max-h-[60svh]")}>
        {item ? <>
          <h3 className="m-0 font-display text-xl text-ouro">{item.nome}</h3>
          {item.info && item.info.length > 0 && (
            <ul className="mt-3 mb-0 flex list-none flex-wrap gap-1.5 p-0">
              {item.info.map((x) => <li key={x} className="rounded-full border border-border px-2.5 py-0.5 text-sm text-pergaminho">{x}</li>)}
            </ul>
          )}
          <p className="mt-3 mb-0 text-base leading-relaxed whitespace-pre-line text-texto/85">{item.texto ?? "Carregando…"}</p>
        </> : <p className="m-0 text-base text-texto/50">Escolha um item para ver os detalhes.</p>}
      </article>
    </div>
  );
}

// Procura no conteúdo de exemplo um item citado na pergunta (usado pela IA de demonstração).
export const procurarNoCompendio = (sistema: string, texto: string) => {
  const t = texto.toLowerCase();
  for (const c of MOCK[sistema] ?? []) for (const i of c.itens) if (t.includes(i.nome.toLowerCase())) return i;
};
