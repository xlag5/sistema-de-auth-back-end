import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUpdatePassword,
  validateUserFilters,
  validateUserId,
} from '../validators/user.validator';

/**
 * Controlador de gerenciamento de usuários
 */
class UserController {
  /**
   * GET /api/users
   * Lista todos os usuários com filtros e paginação
   */
  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      // Valida os filtros
      const validation = validateUserFilters(req.query);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: validation.error.format(),
        });
        return;
      }

      // Lista os usuários
      const result = await userService.listUsers(validation.data);

      res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * GET /api/users/:id
   * Busca um usuário por ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      // Valida o ID
      const validation = validateUserId(req.params);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: validation.error.format(),
        });
        return;
      }

      // Busca o usuário
      const usuario = await userService.getUserById(validation.data.id);

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: usuario,
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * POST /api/users
   * Cria um novo usuário
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      // Valida os dados de entrada
      const validation = validateCreateUser(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.format(),
        });
        return;
      }

      // Cria o usuário
      const result = await userService.createUser(validation.data);

      const statusCode = result.success ? 201 : 400;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * PUT /api/users/:id
   * Atualiza um usuário existente
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      // Valida o ID
      const idValidation = validateUserId(req.params);

      if (!idValidation.success) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: idValidation.error.format(),
        });
        return;
      }

      // Valida os dados de atualização
      const dataValidation = validateUpdateUser(req.body);

      if (!dataValidation.success) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: dataValidation.error.format(),
        });
        return;
      }

      // Atualiza o usuário
      const result = await userService.updateUser(idValidation.data.id, dataValidation.data);

      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * PATCH /api/users/:id/password
   * Atualiza a senha de um usuário
   */
  async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      // Valida o ID
      const idValidation = validateUserId(req.params);

      if (!idValidation.success) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: idValidation.error.format(),
        });
        return;
      }

      // Valida os dados de senha
      const dataValidation = validateUpdatePassword(req.body);

      if (!dataValidation.success) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: dataValidation.error.format(),
        });
        return;
      }

      // Verifica se o usuário autenticado está tentando mudar sua própria senha
      // Ou se é um admin (pode implementar verificação de admin aqui)
      if (req.user && req.user.userId !== idValidation.data.id) {
        res.status(403).json({
          success: false,
          message: 'Você não tem permissão para alterar a senha deste usuário',
        });
        return;
      }

      // Atualiza a senha
      const result = await userService.updatePassword(idValidation.data.id, dataValidation.data);

      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * DELETE /api/users/:id
   * Desativa um usuário (soft delete)
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      // Valida o ID
      const validation = validateUserId(req.params);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: validation.error.format(),
        });
        return;
      }

      // Verifica se o usuário não está tentando deletar a si mesmo
      if (req.user && req.user.userId === validation.data.id) {
        res.status(400).json({
          success: false,
          message: 'Você não pode desativar sua própria conta',
        });
        return;
      }

      // Desativa o usuário
      const result = await userService.deleteUser(validation.data.id);

      const statusCode = result.success ? 200 : 404;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * DELETE /api/users/:id/permanent
   * Deleta permanentemente um usuário (hard delete)
   */
  async hardDeleteUser(req: Request, res: Response): Promise<void> {
    try {
      // Valida o ID
      const validation = validateUserId(req.params);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: validation.error.format(),
        });
        return;
      }

      // Verifica se o usuário não está tentando deletar a si mesmo
      if (req.user && req.user.userId === validation.data.id) {
        res.status(400).json({
          success: false,
          message: 'Você não pode deletar sua própria conta',
        });
        return;
      }

      // Deleta permanentemente o usuário
      const result = await userService.hardDeleteUser(validation.data.id);

      const statusCode = result.success ? 200 : 404;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Erro ao deletar usuário permanentemente:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * PATCH /api/users/:id/activate
   * Reativa um usuário desativado
   */
  async activateUser(req: Request, res: Response): Promise<void> {
    try {
      // Valida o ID
      const validation = validateUserId(req.params);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: validation.error.format(),
        });
        return;
      }

      // Reativa o usuário
      const result = await userService.activateUser(validation.data.id);

      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}

export const userController = new UserController();

