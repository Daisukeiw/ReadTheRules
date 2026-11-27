import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ReactLenis, type LenisRef } from "lenis/react";
import { gsap, ScrollTrigger } from "./lib/gsap";
import { getToken } from "./api";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Campanhas from "./pages/Campanhas";
import Campanha from "./pages/Campanha";
import RedefinirSenha from "./pages/RedefinirSenha";
import "./styles.css";

const Privada = ({ children }: { children: React.ReactElement }) => (getToken() ? children : <Navigate to="/login" />);
// Sem login, "/" é a apresentação do site; com login, a lista de campanhas.
const Inicio = () => (getToken() ? <Campanhas /> : <Home />);

// Lenis faz a rolagem suave e avisa o ScrollTrigger a cada quadro.
function RolagemSuave() {
  const lenis = useRef<LenisRef>(null);
  useEffect(() => {
    const raf = (t: number) => lenis.current?.lenis?.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    const l = lenis.current?.lenis;
    l?.on("scroll", ScrollTrigger.update);
    return () => { gsap.ticker.remove(raf); l?.off("scroll", ScrollTrigger.update); };
  }, []);
  return <ReactLenis root options={{ autoRaf: false, lerp: 0.1 }} ref={lenis} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <RolagemSuave />
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/cadastro" element={<Auth />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/campanhas/:id" element={<Privada><Campanha /></Privada>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>,
);
