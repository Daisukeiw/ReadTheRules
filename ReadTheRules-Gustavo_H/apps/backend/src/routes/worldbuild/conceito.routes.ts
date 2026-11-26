import { Router } from 'express';
import { validar } from "../../middlewares/validar.js";
import { comNomeSchema } from "../../schemas.js";
import { authenticate } from '../../middlewares/authenticate.js';
import { createConceitoController, listConceitoController,getConceitoByIdController,getConceitoByNameController,updateConceitoController,deleteConceitoController } from '../../controllers/worldbuild/conceito.controller.js';

const router = Router({ mergeParams: true });
router.use(authenticate);

router.post('/', validar(comNomeSchema), createConceitoController);
router.get('/', listConceitoController);
router.get('/:id_conceito', getConceitoByIdController);
router.get('/nome/:nome', getConceitoByNameController);
router.put('/:id_conceito', updateConceitoController);
router.patch('/:id_conceito', updateConceitoController);
router.delete('/:id_conceito', deleteConceitoController);

export default router;