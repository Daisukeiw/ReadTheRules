import { Router } from "express";
import { apenasMestre } from "../middlewares/campanha.js";
import { listHistoricoIAController, perguntarIAController } from "../controllers/ia.controller.js";

const router = Router({ mergeParams: true });
router.use(apenasMestre);

router.post("/", perguntarIAController);
router.get("/", listHistoricoIAController);

export default router;
