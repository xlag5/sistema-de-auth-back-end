import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { validateLogin, validateRegister } from '../validators/auth.validator';

/**
 * Controlador de autenticação
 */
class AuthController {
  /**
   * POST /api/auth/login
   * Realiza o login do usuário
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Valida os dados de entrada
      const validation = validateLogin(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.format(),
        });
        return;
      }

      // Processa o login
      const result = await authService.login(validation.data);

      // Define o status code baseado no resultado
      const statusCode = result.success ? 200 : 401;

      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Erro no controller de login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * POST /api/auth/register
   * Registra um novo usuário
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Valida os dados de entrada
      const validation = validateRegister(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.format(),
        });
        return;
      }

      // Processa o registro
      const result = await authService.register(validation.data);

      // Define o status code baseado no resultado
      const statusCode = result.success ? 201 : 400;

      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Erro no controller de registro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * GET /api/auth/me
   * Retorna os dados do usuário autenticado
   */
  async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Não autenticado',
        });
        return;
      }

      const usuario = await authService.getUserById(req.user.userId);

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user_id: usuario.user_id,
          name: usuario.name,
          last_name: usuario.last_name,
          email: usuario.email,
          date_of_birth: usuario.date_of_birth,
          active: usuario.active,
          created_at: usuario.created_at,
          last_login: usuario.last_login,
        },
      });
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * POST /api/auth/check-email
   * Verifica se um email já está cadastrado
   */
  async checkEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Email inválido',
        });
        return;
      }

      const exists = await authService.emailExists(email);

      res.status(200).json({
        success: true,
        exists,
      });
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}

export const authController = new AuthController();

