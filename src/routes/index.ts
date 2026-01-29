import { Router } from 'express';
import authRoutes from './auth.routes';

/**
 * Rotas principais da API
 */
const router = Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString(),
  });
});

export default router;

