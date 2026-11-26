import { Router } from "express";
import { validar } from "../middlewares/validar.js";
import { campanhaSchema } from "../schemas.js";
import { authenticate } from "../middlewares/authenticate.js";
import { apenasMestre } from "../middlewares/campanha.js";
import { createCampanhaController, listCampanhaController, getCampanhaByIdController, updateCampanhaController, deleteCampanhaController, listarMembrosController, removerMembroController} from "../controllers/campaign.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", validar(campanhaSchema), createCampanhaController);
router.get("/", listCampanhaController);
router.get("/:id_campanha", getCampanhaByIdController);
router.put("/:id_campanha", apenasMestre, updateCampanhaController);
router.get("/:id_campanha/membros", listarMembrosController);
router.delete("/:id_campanha/remover/:id_usuario", removerMembroController);
router.delete("/:id_campanha", apenasMestre, deleteCampanhaController);

export default router;