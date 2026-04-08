// src/routes/index.js
import express from 'express';
import adminRoutes from './adminRoutes/index.js';
import cleanerRoutes from './cleanerRoutes/index.js';
import clientRoutes from './clientRoutes/index.js';

const router = express.Router();

// Mount sub-routers
router.use('/admin', adminRoutes);
router.use('/cleaner', cleanerRoutes);
router.use('/client', clientRoutes);

export default router;