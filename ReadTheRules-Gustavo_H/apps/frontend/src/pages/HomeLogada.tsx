import { useRef } from "react";
import { gsap, useGSAP, reduzMovimento } from "@/lib/gsap";
import { useCampanhas } from "./homeLogada/dados";
import { CampanhasCriadas } from "./homeLogada/Campanhas";
import { EntidadesCriadas } from "./homeLogada/Entidades";
import { CalendarioColaborativo } from "./homeLogada/Calendario";
import { Foto, Sair, Simbolo } from "./mundo/Moldura";

// Home depois do login: sem barra superior de seções (elas ficam dentro de cada campanha).
export default function HomeLogada() {
  const [campanhas, setCampanhas] = useCampanhas();
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reduzMovimento()) return;
    gsap.from("[data-surge]", { opacity: 0, y: 18, duration: 0.6, stagger: 0.08, ease: "rtr-out" });
  }, { scope: raiz });

  return (
    <div ref={raiz} className="min-h-svh bg-noite font-serif text-texto">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 py-8 sm:px-8">
        <div data-surge className="flex items-center gap-4">
          <Simbolo className="size-12" />
          <div className="min-w-0 flex-1">
            <p className="m-0 font-display text-xs tracking-[0.25em] text-ouro uppercase">Read the Rules</p>
            <h1 className="mt-1 mb-0 font-display text-2xl font-semibold text-texto sm:text-4xl">Bem-vindo de volta, mestre</h1>
          </div>
          <Foto className="size-11" />
          <Sair />
        </div>
        <CampanhasCriadas campanhas={campanhas} criar={(c) => setCampanhas((l) => [c, ...l])} />
        <EntidadesCriadas />
        <CalendarioColaborativo />
      </div>
    </div>
  );
}
