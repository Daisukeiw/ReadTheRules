import { useCallback, useSyncExternalStore } from "react";
import { CalendarRange, Gem, Handshake, Lightbulb, MapPin, PawPrint, Sparkles, UserRound, type LucideIcon } from "lucide-react";

// Campanhas, entidades, roteiros, sessões do calendário e arquivos vêm do back-end (servidor.ts).
// shortcut: ideias, foto, impedimentos e bloqueios do calendário ficam só no localStorage; o back-end não tem rota para eles.
export { useCampanhas, useEntidades, useRoteiros, useSessoes, useArquivos, nomeJogador } from "./servidor";

export type Campanha = { id: string; nome: string; sistema: string; nivel: number; descricao: string; imagem?: string; jogadores: string[];
  papel: "mestre" | "jogador"; convidar?: string[] }; // convidar: e-mails, só na criação
export type TipoEntidade = "aliancas" | "conceito" | "criaturas" | "deuses" | "eventos" | "itens" | "locais" | "personagem";
// Eventos são os acontecimentos da linha do tempo: além do texto, têm início, fim e cor.
export type Entidade = {
  id: string; tipo: TipoEntidade; nome: string; texto: string; respostas: Record<string, string>;
  campanhaId?: string; evento?: { inicio: number; fim: number; cor: string; imagem?: string };
};

// Bloco do resumo escrito durante a sessão (Intra Sessão).
export type Bloco = { id: string; tipo: "texto"; texto: string } | { id: string; tipo: "combate"; estado: "inicio" | "fim" } | { id: string; tipo: "nota"; n: number; texto: string };
// Sessão escrita pelo mestre (roteiro). Só o mestre vê; pode ser anexada a um dia marcado no calendário.
export type Roteiro = {
  id: string; campanhaId: string; numero: number; titulo: string; texto: string; respostas: Record<string, string>;
  sessaoId?: string; status: "rascunho" | "encerrada"; resumo: Bloco[]; encerradaEm?: string;
};
export type Ideia = { id: string; campanhaId: string; x: number; y: number; texto: string; pai?: string };
export type Arquivo = { id: string; campanhaId: string; nome: string; tamanho: number; enviadoEm: string; conteudo?: string; pdf?: string }; // conteudo/pdf: só no envio
export type StatusConvite = "pendente" | "confirmado" | "recusado";
export type Sessao = {
  id: string; data: string; numero: number; campanhaId: string; local: string;
  inicio: string; fim: string; nivel: number; sinopse: string; convites: Record<string, StatusConvite>;
};

export const SISTEMAS = ["D&D 5e", "Pathfinder", "Old Dragon", "Ordem Paranormal", "Outro"];

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
  { id: "eventos", nome: "Eventos", icone: CalendarRange, perguntas: [
    "Quem esteve no centro deste acontecimento?",
    "O que o mundo perdeu ou ganhou com ele?",
    "Como as pessoas comuns contam essa história hoje?",
    "Que vestígio físico ainda existe dele?",
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
// Estado que sobrevive ao recarregar a página e fica igual em todos os componentes que usam a mesma chave.
const cache = new Map<string, unknown>();
const ouvintes = new Map<string, Set<() => void>>();
function ler<T>(chave: string, inicial: T): T {
  if (!cache.has(chave)) {
    try { const s = localStorage.getItem(chave); cache.set(chave, s ? JSON.parse(s) : inicial); } catch { cache.set(chave, inicial); }
  }
  return cache.get(chave) as T;
}
export function usePersistido<T>(chave: string, inicial: T) {
  const valor = useSyncExternalStore((avisar) => {
    const lista = ouvintes.get(chave) ?? new Set();
    ouvintes.set(chave, lista); lista.add(avisar);
    return () => { lista.delete(avisar); };
  }, () => ler(chave, inicial));
  const setValor = useCallback((v: T | ((anterior: T) => T)) => {
    const novo = typeof v === "function" ? (v as (a: T) => T)(ler(chave, inicial)) : v;
    cache.set(chave, novo);
    try { localStorage.setItem(chave, JSON.stringify(novo)); } catch { /* cota cheia: segue só em memória */ }
    ouvintes.get(chave)?.forEach((f) => f());
  }, [chave]); // eslint-disable-line react-hooks/exhaustive-deps
  return [valor, setValor] as const;
}

export const useIdeias = () => usePersistido<Ideia[]>("rtr-ideias", []);
export const usarFoto = () => usePersistido<string | null>("rtr-foto", null);
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
