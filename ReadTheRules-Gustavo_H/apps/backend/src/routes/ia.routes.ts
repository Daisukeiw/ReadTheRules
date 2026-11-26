import { Router } from "express";
import { validar } from "../middlewares/validar.js";
import { iaSchema } from "../schemas.js";
import { apenasMestre } from "../middlewares/campanha.js";
import { listHistoricoIAController, perguntarIAController } from "../controllers/ia.controller.js";

const router = Router({ mergeParams: true });
router.use(apenasMestre);

router.post("/", validar(iaSchema), perguntarIAController);
router.get("/", listHistoricoIAController);

export default router;
