import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

/**
 * Rotas de autenticação
 */
const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuário
 * @access  Public
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * @route   POST /api/auth/register
 * @desc    Registro de novo usuário
 * @access  Public
 */
router.post('/register', (req, res) => authController.register(req, res));

/**
 * @route   GET /api/auth/me
 * @desc    Obter dados do usuário autenticado
 * @access  Private
 */
router.get('/me', authMiddleware, (req, res) => authController.me(req, res));

/**
 * @route   POST /api/auth/check-email
 * @desc    Verificar se email já existe
 * @access  Public
 */
router.post('/check-email', (req, res) => authController.checkEmail(req, res));

export default router;

