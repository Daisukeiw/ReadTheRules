import { Router } from 'express';
import { validar } from "../../middlewares/validar.js";
import { comNomeSchema } from "../../schemas.js";
import { authenticate } from '../../middlewares/authenticate.js';
import { createDeusController, deleteDeusController, getDeusByIdController, getDeusByNameController, listDeusController, updateDeusController } from '../../controllers/worldbuild/deus.controller.js';

const router = Router({ mergeParams: true });
router.use(authenticate);

router.post('/', validar(comNomeSchema), createDeusController);
router.get('/', listDeusController);
router.get('/:id_deus', getDeusByIdController);
router.get('/nome/:nome', getDeusByNameController);
router.put('/:id_deus', updateDeusController);
router.delete('/:id_deus', deleteDeusController);

export default router;