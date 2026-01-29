import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

/**
 * Rotas de gerenciamento de usuários
 * Todas as rotas requerem autenticação
 */
const router = Router();

// Aplica o middleware de autenticação em todas as rotas
router.use(authMiddleware);

/**
 * @route   GET /api/users
 * @desc    Lista todos os usuários com filtros e paginação
 * @access  Private
 * @query   name - Filtrar por nome ou sobrenome (opcional)
 * @query   email - Filtrar por email (opcional)
 * @query   active - Filtrar por status ativo (opcional)
 * @query   page - Número da página (opcional, padrão: 1)
 * @query   pageSize - Tamanho da página (opcional, padrão: 10, máx: 100)
 */
router.get('/', (req, res) => userController.listUsers(req, res));

/**
 * @route   GET /api/users/:id
 * @desc    Busca um usuário por ID
 * @access  Private
 */
router.get('/:id', (req, res) => userController.getUserById(req, res));

/**
 * @route   POST /api/users
 * @desc    Cria um novo usuário
 * @access  Private
 * @body    name - Nome do usuário (obrigatório)
 * @body    last_name - Sobrenome do usuário (obrigatório)
 * @body    email - Email do usuário (obrigatório)
 * @body    senha - Senha do usuário (obrigatório)
 * @body    date_of_birth - Data de nascimento (opcional)
 * @body    active - Status ativo (opcional, padrão: true)
 */
router.post('/', (req, res) => userController.createUser(req, res));

/**
 * @route   PUT /api/users/:id
 * @desc    Atualiza um usuário existente
 * @access  Private
 * @body    name - Nome do usuário (opcional)
 * @body    last_name - Sobrenome do usuário (opcional)
 * @body    email - Email do usuário (opcional)
 * @body    date_of_birth - Data de nascimento (opcional)
 * @body    active - Status ativo (opcional)
 */
router.put('/:id', (req, res) => userController.updateUser(req, res));

/**
 * @route   PATCH /api/users/:id/password
 * @desc    Atualiza a senha de um usuário
 * @access  Private (usuário só pode alterar sua própria senha)
 * @body    senha_atual - Senha atual (obrigatório)
 * @body    senha_nova - Nova senha (obrigatório)
 */
router.patch('/:id/password', (req, res) => userController.updatePassword(req, res));

/**
 * @route   PATCH /api/users/:id/activate
 * @desc    Reativa um usuário desativado
 * @access  Private
 */
router.patch('/:id/activate', (req, res) => userController.activateUser(req, res));

/**
 * @route   DELETE /api/users/:id
 * @desc    Desativa um usuário (soft delete)
 * @access  Private
 */
router.delete('/:id', (req, res) => userController.deleteUser(req, res));

/**
 * @route   DELETE /api/users/:id/permanent
 * @desc    Deleta permanentemente um usuário (hard delete)
 * @access  Private (use com cuidado!)
 */
router.delete('/:id/permanent', (req, res) => userController.hardDeleteUser(req, res));

export default router;

