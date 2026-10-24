import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../validators/common.js';
import { categoryCreate, categoryUpdate } from '../validators/inventory.js';
import * as c from '../controllers/categoryController.js';

const router = Router();
router.use(requireAuth);

router.get('/', c.list);
router.post('/', requireRole('admin'), validate(categoryCreate), c.create);
router.put('/:id', requireRole('admin'), validate(idParam, 'params'), validate(categoryUpdate), c.update);
router.delete('/:id', requireRole('admin'), validate(idParam, 'params'), c.remove);

export default router;