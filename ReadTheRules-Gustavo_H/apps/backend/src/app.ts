import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import campanhaRouter from "./routes/campaign.routes.js"
import memberRouter from "./routes/member.routes.js"
import sessionRouter from "./routes/session.routes.js"
import notaRouter from "./routes/note.routes.js"
import personagemRouter from "./routes/worldbuild/personagem.routes.js"
import itemRouter from "./routes/worldbuild/item.routes.js"
import aliancaRouter from "./routes/worldbuild/alianca.routes.js"
import deusRouter from "./routes/worldbuild/deus.routes.js"
import criaturaRouter from "./routes/worldbuild/criatura.routes.js"
import localRouter from "./routes/worldbuild/local.routes.js"
import conceitoRouter from "./routes/worldbuild/conceito.routes.js"
import calendarioEventoRouter from "./routes/calendario/calendarioevento.routes.js"
import calendarioRsvpRouter from "./routes/calendario/calendariorsvp.routes.js";
import documentoRouter from "./routes/documento.routes.js";
import iaRouter from "./routes/ia.routes.js";
import { authenticate } from "./middlewares/authenticate.js";
import { isMembro } from "./middlewares/campanha.js";
import { buscarController } from "./controllers/ia.controller.js";



const app = express();

app.use(cors());
app.use(express.json({ limit: "30mb" })); // documentos de regras e PDFs (em base64) podem ser grandes

app.get("/health", (_req, res) => { res.json({ ok: true }); });

app.use("/auth", authRouter);
// Tudo dentro de uma campanha exige ser membro ativo dela.
app.use("/campanhas/:id_campanha", authenticate, isMembro);
app.use("/campanhas", campanhaRouter);
app.use("/membros", memberRouter);
app.use("/campanhas/:id_campanha/sessoes", sessionRouter);
app.use("/campanhas/:id_campanha/notas", notaRouter);
app.use("/campanhas/:id_campanha/personagens", personagemRouter);
app.use("/campanhas/:id_campanha/itens", itemRouter);
app.use("/campanhas/:id_campanha/eventos", calendarioEventoRouter);
app.use("/campanhas/:id_campanha/aliancas", aliancaRouter);
app.use("/campanhas/:id_campanha/deuses", deusRouter);
app.use("/campanhas/:id_campanha/criaturas", criaturaRouter);
app.use("/campanhas/:id_campanha/locais", localRouter);
app.use("/campanhas/:id_campanha/conceitos", conceitoRouter);
app.use("/campanhas/:id_campanha/documentos", documentoRouter);
app.use("/campanhas/:id_campanha/ia", iaRouter);
app.get("/campanhas/:id_campanha/busca", buscarController);

app.use("/calendario", calendarioEventoRouter);
app.use("/eventos", calendarioRsvpRouter);

export default app;