import { query } from '../database';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { generateToken } from '../utils/jwt.utils';
import { Usuario, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/auth.types';

/**
 * Serviço de autenticação
 */
class AuthService {
  /**
   * Realiza o login do usuário
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Busca o usuário pelo email
      const usuario = await query.execQueryOne<Usuario>(
        'SELECT * FROM "user" WHERE email = $1',
        [credentials.email]
      );

      // Verifica se o usuário existe
      if (!usuario) {
        return {
          success: false,
          message: 'Email ou senha inválidos',
        };
      }

      // Verifica se o usuário está ativo
      if (!usuario.active) {
        return {
          success: false,
          message: 'Usuário inativo. Entre em contato com o suporte.',
        };
      }

      // Compara a senha fornecida com o hash armazenado
      const senhaCorreta = await comparePassword(credentials.senha, usuario.password_hash);

      if (!senhaCorreta) {
        return {
          success: false,
          message: 'Email ou senha inválidos',
        };
      }

      // Gera o token JWT
      const token = generateToken({
        userId: usuario.user_id,
        email: usuario.email,
      });

      // Atualiza a data de último acesso
      await query.execQuery(
        'UPDATE "user" SET last_login = NOW() WHERE user_id = $1',
        [usuario.user_id]
      );

      return {
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token,
          usuario: {
            user_id: usuario.user_id,
            name: usuario.name,
            last_name: usuario.last_name,
            email: usuario.email,
          },
        },
      };
    } catch (error) {
      console.error('Erro no serviço de login:', error);
      throw new Error('Erro ao processar login');
    }
  }

  /**
   * Registra um novo usuário
   */
  async register(dados: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Verifica se o email já está cadastrado
      const usuarioExistente = await query.execQueryOne(
        'SELECT user_id FROM "user" WHERE email = $1',
        [dados.email]
      );

      if (usuarioExistente) {
        return {
          success: false,
          message: 'Email já cadastrado',
        };
      }

      // Gera o hash da senha
      const senhaHash = await hashPassword(dados.senha);

      // Prepara os dados para inserção
      const dadosInsercao: any = {
        name: dados.name,
        last_name: dados.last_name,
        email: dados.email,
        password_hash: senhaHash,
        active: true,
        created_at: new Date(),
      };

      // Adiciona data de nascimento se fornecida
      if (dados.date_of_birth) {
        dadosInsercao.date_of_birth = new Date(dados.date_of_birth);
      }

      // Insere o novo usuário
      const novoUsuario = await query.insert<Usuario>('"user"', dadosInsercao);

      return {
        success: true,
        message: 'Usuário cadastrado com sucesso',
        data: {
          user_id: novoUsuario.user_id,
          name: novoUsuario.name,
          last_name: novoUsuario.last_name,
          email: novoUsuario.email,
        },
      };
    } catch (error) {
      console.error('Erro no serviço de registro:', error);
      throw new Error('Erro ao processar cadastro');
    }
  }

  /**
   * Busca um usuário por ID
   */
  async getUserById(userId: number): Promise<Usuario | null> {
    try {
      const usuario = await query.execQueryOne<Usuario>(
        'SELECT user_id, name, last_name, email, date_of_birth, active, created_at, updated_at, last_login FROM "user" WHERE user_id = $1',
        [userId]
      );
      return usuario;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw new Error('Erro ao buscar usuário');
    }
  }

  /**
   * Verifica se um email já está cadastrado
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const result = await query.execQueryOne(
        'SELECT user_id FROM "user" WHERE email = $1',
        [email]
      );
      return !!result;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      throw new Error('Erro ao verificar email');
    }
  }
}

export const authService = new AuthService();

