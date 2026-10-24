import { Router } from 'express';
import { checkHealth } from '../controllers/healthController.js';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import equipmentRoutes from './equipmentRoutes.js';
import facilityRoutes from './facilityRoutes.js';

const router = Router();

router.get('/health', checkHealth);
router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);
router.use('/categories', categoryRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/facilities', facilityRoutes);

export default router;