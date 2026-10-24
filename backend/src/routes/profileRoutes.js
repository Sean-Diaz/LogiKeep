import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../validators/common.js';
import { profileSelfUpdate, profileAdminUpdate, profileListQuery } from '../validators/profile.js';
import * as c from '../controllers/profileController.js';

const router = Router();
router.use(requireAuth);

router.get('/me', c.me);
router.patch('/me', validate(profileSelfUpdate), c.updateMe);

// Admin only
router.get('/', requireRole('admin'), validate(profileListQuery, 'query'), c.list);
router.get('/:id', requireRole('admin'), validate(idParam, 'params'), c.getById);
router.patch(
  '/:id',
  requireRole('admin'),
  validate(idParam, 'params'),
  validate(profileAdminUpdate),
  c.adminUpdate
);

export default router;