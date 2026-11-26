import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { getToken } from "./api";
import Login from "./pages/Login";
import Campanhas from "./pages/Campanhas";
import Campanha from "./pages/Campanha";
import RedefinirSenha from "./pages/RedefinirSenha";
import "./styles.css";

const Privada = ({ children }: { children: React.ReactElement }) => (getToken() ? children : <Navigate to="/login" />);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/" element={<Privada><Campanhas /></Privada>} />
      <Route path="/campanhas/:id" element={<Privada><Campanha /></Privada>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>,
);
