import { Router } from 'express';
import { getAll, getOne, create, update, remove } from '../controllers/entityController';

const router = Router();

router.get('/:type', getAll);
router.get('/:type/:id', getOne);
router.post('/:type', create);
router.put('/:type/:id', update);
router.delete('/:type/:id', remove);

export default router;
