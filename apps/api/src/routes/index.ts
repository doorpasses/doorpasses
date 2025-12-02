import { Router } from 'express';
import accessPassRoutes from './access-pass.routes';
import cardTemplateRoutes from './card-template.routes';
import walletRoutes from './wallet.routes';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'DoorPasses API',
      version: '1.0.0',
      region: 'MENA',
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * API v1 routes
 */
router.use('/v1/access-passes', accessPassRoutes);
router.use('/v1/console/card-templates', cardTemplateRoutes);
router.use('/v1/wallet', walletRoutes);

/**
 * Welcome route
 */
router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Welcome to DoorPasses API - Digital Access Control for MENA Region',
      message_ar: 'مرحباً بك في واجهة برمجة التطبيقات وصول - التحكم في الوصول الرقمي لمنطقة الشرق الأوسط وشمال إفريقيا',
      version: '1.0.0',
      documentation: '/docs',
      health: '/health',
    },
  });
});

export default router;
