import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { me } from '../controllers/profileController.js';

const router = Router();

// The frontend calls this after login to learn the user's role.
router.get('/me', requireAuth, me);

export default router;