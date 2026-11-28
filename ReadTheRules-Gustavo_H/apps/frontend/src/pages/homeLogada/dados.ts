import { useEffect, useState } from "react";
import { Gem, Handshake, Lightbulb, MapPin, PawPrint, Sparkles, UserRound, type LucideIcon } from "lucide-react";

// shortcut: tudo aqui é mockado e salvo no localStorage do navegador; trocar pelas rotas da API quando o back tiver esses campos.

export type Jogador = { id: string; nome: string };
export type Campanha = { id: string; nome: string; sistema: string; nivel: number; descricao: string; imagem?: string; jogadores: string[] };
export type TipoEntidade = "aliancas" | "conceito" | "criaturas" | "deuses" | "itens" | "locais" | "personagem";
export type Entidade = { id: string; tipo: TipoEntidade; nome: string; texto: string; respostas: Record<string, string> };
export type StatusConvite = "pendente" | "confirmado" | "recusado";
export type Sessao = {
  id: string; data: string; numero: number; campanhaId: string; local: string;
  inicio: string; fim: string; nivel: number; sinopse: string; convites: Record<string, StatusConvite>;
};

export const SISTEMAS = ["D&D 5e", "Pathfinder", "Old Dragon", "Ordem Paranormal", "Outro"];

export const JOGADORES: Jogador[] = [
  { id: "ayla", nome: "Ayla" }, { id: "bruno", nome: "Bruno" }, { id: "caio", nome: "Caio" },
  { id: "duda", nome: "Duda" }, { id: "enzo", nome: "Enzo" }, { id: "lia", nome: "Lia" },
];
export const nomeJogador = (id: string) => JOGADORES.find((j) => j.id === id)?.nome ?? id;

export const TIPOS: { id: TipoEntidade; nome: string; icone: LucideIcon; perguntas: string[] }[] = [
  { id: "aliancas", nome: "Alianças", icone: Handshake, perguntas: [
    "Qual objetivo maior une os membros desta aliança?",
    "Quem a lidera e como conquistou esse lugar?",
    "Que juramento, símbolo ou ritual sela a entrada de alguém?",
    "Quem são seus inimigos declarados, e quem a teme em segredo?",
    "O que acontece com quem trai a aliança?",
  ] },
  { id: "conceito", nome: "Conceito", icone: Lightbulb, perguntas: [
    "Em uma frase, o que é este conceito para quem vive no mundo?",
    "Quem o descobriu, criou ou o defende?",
    "Como ele muda o dia a dia de um camponês comum?",
    "Que regra ou limite ninguém consegue quebrar?",
    "Que boato errado as pessoas espalham sobre ele?",
  ] },
  { id: "criaturas", nome: "Criaturas", icone: PawPrint, perguntas: [
    "Onde vive e o que caça (ou o que a caça)?",
    "Qual o primeiro sinal de que ela está por perto?",
    "Qual sua maior fraqueza, e quem sabe disso?",
    "Ela é inteligente? Pode ser negociada ou domada?",
    "Que parte dela vale ouro para alquimistas e caçadores?",
  ] },
  { id: "deuses", nome: "Deuses", icone: Sparkles, perguntas: [
    "Quais são seus domínios e seu símbolo sagrado?",
    "O que exige dos fiéis, e o que nunca perdoa?",
    "Como seus templos e clérigos se apresentam?",
    "Com qual divindade tem rixa ou aliança antiga?",
    "Qual milagre (ou catástrofe) recente é atribuído a ele?",
  ] },
  { id: "itens", nome: "Itens", icone: Gem, perguntas: [
    "Qual a aparência, e que detalhe chama a atenção primeiro?",
    "Quem o forjou e com que propósito?",
    "Que poder concede, e qual o preço de usá-lo?",
    "Quem o está procurando neste momento?",
    "Qual a raridade, e quanto alguém pagaria por ele?",
  ] },
  { id: "locais", nome: "Locais", icone: MapPin, perguntas: [
    "Que cheiro, som e luz recebem quem chega aqui?",
    "Quem manda neste lugar, e quem gostaria de mandar?",
    "Que perigo ou segredo se esconde aqui?",
    "Por que os aventureiros viriam até este lugar?",
    "Como ele mudou nos últimos cem anos?",
  ] },
  { id: "personagem", nome: "Personagem", icone: UserRound, perguntas: [
    "O que este personagem mais deseja, e o que mais teme?",
    "Qual o maneirismo ou frase que o torna memorável?",
    "Que segredo ele guarda dos aventureiros?",
    "A quem deve lealdade, e a quem deve dinheiro?",
    "O que o faria virar aliado, ou inimigo, do grupo?",
  ] },
];
export const tipo = (id: TipoEntidade) => TIPOS.find((t) => t.id === id)!;

export const novoId = () => Math.random().toString(36).slice(2, 10);

// Datas como "aaaa-mm-dd" no fuso local (toISOString usaria UTC e trocaria o dia à noite).
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const emDias = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };

const CAMPANHAS: Campanha[] = [
  { id: "c1", nome: "A Coroa de Cinzas", sistema: "D&D 5e", nivel: 5, jogadores: ["ayla", "bruno", "caio", "duda"],
    descricao: "Um reino em luto busca o herdeiro perdido enquanto dragões de fuligem rondam as montanhas do norte." },
  { id: "c2", nome: "Sussurros no Arquivo", sistema: "Ordem Paranormal", nivel: 2, jogadores: ["enzo", "lia", "bruno"],
    descricao: "Agentes da Ordem investigam uma biblioteca onde os livros reescrevem o próprio final." },
  { id: "c3", nome: "Pântano dos Mil Olhos", sistema: "Old Dragon", nivel: 3, jogadores: ["ayla", "caio", "enzo"],
    descricao: "Uma expedição atrás de um templo afundado, guardado por criaturas que nunca dormem." },
];

const ENTIDADES: Entidade[] = ([
  ["aliancas", "Ordem da Chama Branca"], ["aliancas", "Pacto dos Corvos"],
  ["conceito", "A Grande Fuligem"], ["criaturas", "Dragão de Fuligem"], ["criaturas", "Sapo-Vigia"], ["criaturas", "Leitor Pálido"],
  ["deuses", "Vaelor, o Vigia"], ["itens", "Coroa de Cinzas"], ["itens", "Lanterna sem Fundo"],
  ["locais", "Arquivo Silencioso"], ["locais", "Pico de Ferro"], ["locais", "Templo Afundado"], ["locais", "Vila Brejo-Seco"],
  ["personagem", "Lady Mirela"], ["personagem", "Irmão Tolvo"],
] as const).map(([t, nome]) => ({ id: novoId(), tipo: t, nome, texto: "", respostas: {} }));

const SESSOES: Sessao[] = [
  { id: "s1", data: emDias(-9), numero: 3, campanhaId: "c1", local: "Casa do Bruno", inicio: "19:00", fim: "23:00", nivel: 5,
    sinopse: "O grupo chega ao Pico de Ferro e encontra a forja abandonada.", convites: { ayla: "confirmado", bruno: "confirmado", caio: "confirmado", duda: "confirmado" } },
  { id: "s2", data: emDias(5), numero: 4, campanhaId: "c1", local: "Discord", inicio: "20:00", fim: "23:30", nivel: 5,
    sinopse: "A Coroa de Cinzas responde ao chamado de alguém do grupo.", convites: { ayla: "confirmado", bruno: "pendente", caio: "recusado", duda: "pendente" } },
  { id: "s3", data: emDias(12), numero: 1, campanhaId: "c2", local: "Loja Dado Crítico", inicio: "15:00", fim: "19:00", nivel: 2,
    sinopse: "Primeira noite no Arquivo Silencioso.", convites: { enzo: "pendente", lia: "pendente", bruno: "confirmado" } },
];

// Estado que sobrevive ao recarregar a página.
export function usePersistido<T>(chave: string, inicial: T) {
  const [valor, setValor] = useState<T>(() => {
    try { const s = localStorage.getItem(chave); return s ? JSON.parse(s) : inicial; } catch { return inicial; }
  });
  useEffect(() => {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* cota cheia: segue só em memória */ }
  }, [chave, valor]);
  return [valor, setValor] as const;
}

export const useCampanhas = () => usePersistido("rtr-campanhas", CAMPANHAS);
export const useEntidades = () => usePersistido("rtr-entidades", ENTIDADES);
export const useSessoes = () => usePersistido("rtr-sessoes", SESSOES);
export const useImpedimentos = () => usePersistido<string[]>("rtr-impedimentos", []);

// Reduz a imagem antes de guardar, para caber no localStorage.
export function lerImagem(arquivo: File, max = 640): Promise<string> {
  return new Promise((ok, falha) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      ok(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = falha;
    img.src = URL.createObjectURL(arquivo);
  });
}
