import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { apenasMestre, isMembro } from "../middlewares/campanha.js";
import { validar } from "../middlewares/validar.js";
import { conviteSchema } from "../schemas.js";
import { aceitarConviteController, convidarPlayerController, listarConvitesMestreController, listarConvitesPlayerController, recusarConviteController } from "../controllers/member.controller.js";
const router = Router();

router.use(authenticate);

// Só o mestre convida e vê os convites da campanha.
router.post("/:id_campanha/convidar", isMembro, apenasMestre, validar(conviteSchema), convidarPlayerController);
router.patch("/:id_campanha/aceitar", aceitarConviteController);
router.patch("/:id_campanha/recusar", recusarConviteController);
router.get("/:id_campanha/convites", isMembro, apenasMestre, listarConvitesMestreController);
router.get("/convites", listarConvitesPlayerController);

export default router;
