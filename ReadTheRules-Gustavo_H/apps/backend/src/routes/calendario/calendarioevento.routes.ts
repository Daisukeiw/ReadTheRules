import { Router } from "express";
import { validar } from "../../middlewares/validar.js";
import { eventoSchema } from "../../schemas.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { createEventoController, deleteEventoController, listarEventosPorUsuarioController, listEventosController, updateEventoController } from "../../controllers/calendario/calendarioevento.controller.js";

const router = Router({mergeParams: true});

router.use(authenticate);

router.post("/", validar(eventoSchema), createEventoController);
router.get("/meus", listarEventosPorUsuarioController);
router.get("/", listEventosController);
router.patch("/:id_evento", updateEventoController);
router.delete("/:id_evento", deleteEventoController);

export default router;