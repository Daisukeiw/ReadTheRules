import { Router } from "express";
import { validar } from "../middlewares/validar.js";
import { documentoSchema } from "../schemas.js";
import { apenasMestre } from "../middlewares/campanha.js";
import { createDocumentoController, deleteDocumentoController, getDocumentoByIdController, listDocumentosController } from "../controllers/documento.controller.js";

// authenticate + isMembro já rodam no app.ts para /campanhas/:id_campanha
const router = Router({ mergeParams: true });
router.use(apenasMestre);

router.post("/", validar(documentoSchema), createDocumentoController);
router.get("/", listDocumentosController);
router.get("/:id_documento", getDocumentoByIdController);
router.delete("/:id_documento", deleteDocumentoController);

export default router;
