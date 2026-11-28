import { EntidadesCriadas } from "../homeLogada/Entidades";
import { CalendarioColaborativo } from "../homeLogada/Calendario";
import { Compendio } from "./Compendio";
import { ChatIA } from "./IA";
import { Pagina } from "./Moldura";
import { useCampanha } from "./Mundo";

export function PaginaEntidades() {
  const c = useCampanha();
  return <Pagina titulo="Entidades" texto="Tudo o que existe neste mundo. Clique numa entidade para continuar escrevendo."><EntidadesCriadas campanhaId={c.id} comLista /></Pagina>;
}

export function PaginaCalendario() {
  const c = useCampanha();
  return <Pagina titulo="Calendário" texto="Sessões desta campanha."><CalendarioColaborativo campanhaId={c.id} /></Pagina>;
}

export function PaginaCompendio() {
  const c = useCampanha();
  return <Pagina titulo="Compêndio" texto={`Biblioteca de regras de ${c.sistema}.`}><Compendio sistema={c.sistema} /></Pagina>;
}

export function PaginaIA() {
  const c = useCampanha();
  return (
    <Pagina titulo="Módulo de IA" texto={`Responde só perguntas sobre ${c.sistema}.`}>
      <div className="mx-auto flex h-[65svh] max-w-3xl flex-col rounded-2xl border border-border bg-card/50 p-4">
        <ChatIA sistema={c.sistema} className="flex-1" />
      </div>
    </Pagina>
  );
}
