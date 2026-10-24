import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam, listQuery } from '../validators/common.js';
import { facilityCreate, facilityUpdate } from '../validators/inventory.js';
import { makeInventoryController } from '../controllers/inventoryController.js';

const c = makeInventoryController('facilities');
const router = Router();
router.use(requireAuth);

router.get('/', validate(listQuery, 'query'), c.list);
router.get('/:id', validate(idParam, 'params'), c.get);
router.post('/', requireRole('admin'), validate(facilityCreate), c.create);
router.put('/:id', requireRole('admin'), validate(idParam, 'params'), validate(facilityUpdate), c.update);
router.delete('/:id', requireRole('admin'), validate(idParam, 'params'), c.remove);

export default router;