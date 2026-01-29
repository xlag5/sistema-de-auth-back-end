import { query } from '../database';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { Usuario } from '../types/auth.types';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UpdatePasswordRequest,
  UserResponse,
  UserFilters,
  toUserResponse,
} from '../types/user.types';

/**
 * Serviço de gerenciamento de usuários
 */
class UserService {
  /**
   * Lista todos os usuários com filtros e paginação
   */
  async listUsers(filters: UserFilters) {
    try {
      // Constrói a query base
      let query_text = 'SELECT user_id, name, last_name, email, date_of_birth, active, created_at, updated_at, last_login FROM "user" WHERE 1=1';
      const params: any[] = [];
      let paramCounter = 1;

      // Adiciona filtros
      if (filters.name) {
        query_text += ` AND (name ILIKE $${paramCounter} OR last_name ILIKE $${paramCounter})`;
        params.push(`%${filters.name}%`);
        paramCounter++;
      }

      if (filters.email) {
        query_text += ` AND email ILIKE $${paramCounter}`;
        params.push(`%${filters.email}%`);
        paramCounter++;
      }

      if (filters.active !== undefined) {
        query_text += ` AND active = $${paramCounter}`;
        params.push(filters.active);
        paramCounter++;
      }

      // Ordena por data de criação (mais recente primeiro)
      query_text += ' ORDER BY created_at DESC';

      // Aplica paginação
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 10;

      const result = await query.execQueryPaginated<Usuario>(
        query_text,
        params,
        page,
        pageSize
      );

      return {
        success: true,
        data: result.data.map(toUserResponse),
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        },
      };
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw new Error('Erro ao listar usuários');
    }
  }

  /**
   * Busca um usuário por ID
   */
  async getUserById(userId: number): Promise<UserResponse | null> {
    try {
      const usuario = await query.execQueryOne<Usuario>(
        'SELECT user_id, name, last_name, email, date_of_birth, active, created_at, updated_at, last_login FROM "user" WHERE user_id = $1',
        [userId]
      );

      if (!usuario) {
        return null;
      }

      return toUserResponse(usuario);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw new Error('Erro ao buscar usuário');
    }
  }

  /**
   * Cria um novo usuário
   */
  async createUser(dados: CreateUserRequest): Promise<{ success: boolean; message: string; data?: UserResponse }> {
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
        active: dados.active !== undefined ? dados.active : true,
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
        message: 'Usuário criado com sucesso',
        data: toUserResponse(novoUsuario),
      };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw new Error('Erro ao criar usuário');
    }
  }

  /**
   * Atualiza um usuário existente
   */
  async updateUser(
    userId: number,
    dados: UpdateUserRequest
  ): Promise<{ success: boolean; message: string; data?: UserResponse }> {
    try {
      // Verifica se o usuário existe
      const usuarioExistente = await query.execQueryOne<Usuario>(
        'SELECT * FROM "user" WHERE user_id = $1',
        [userId]
      );

      if (!usuarioExistente) {
        return {
          success: false,
          message: 'Usuário não encontrado',
        };
      }

      // Se está atualizando o email, verifica se já não está em uso
      if (dados.email && dados.email !== usuarioExistente.email) {
        const emailEmUso = await query.execQueryOne(
          'SELECT user_id FROM "user" WHERE email = $1 AND user_id != $2',
          [dados.email, userId]
        );

        if (emailEmUso) {
          return {
            success: false,
            message: 'Email já está em uso por outro usuário',
          };
        }
      }

      // Prepara os dados para atualização
      const dadosAtualizacao: any = {
        updated_at: new Date(),
      };

      if (dados.name) dadosAtualizacao.name = dados.name;
      if (dados.last_name) dadosAtualizacao.last_name = dados.last_name;
      if (dados.email) dadosAtualizacao.email = dados.email;
      if (dados.date_of_birth !== undefined) {
        dadosAtualizacao.date_of_birth = dados.date_of_birth ? new Date(dados.date_of_birth) : null;
      }
      if (dados.active !== undefined) dadosAtualizacao.active = dados.active;

      // Atualiza o usuário
      await query.update('"user"', dadosAtualizacao, 'user_id = $1', [userId]);

      // Busca o usuário atualizado
      const usuarioAtualizado = await query.execQueryOne<Usuario>(
        'SELECT user_id, name, last_name, email, date_of_birth, active, created_at, updated_at, last_login FROM "user" WHERE user_id = $1',
        [userId]
      );

      return {
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: usuarioAtualizado ? toUserResponse(usuarioAtualizado) : undefined,
      };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error('Erro ao atualizar usuário');
    }
  }

  /**
   * Atualiza a senha de um usuário
   */
  async updatePassword(
    userId: number,
    dados: UpdatePasswordRequest
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Busca o usuário
      const usuario = await query.execQueryOne<Usuario>(
        'SELECT * FROM "user" WHERE user_id = $1',
        [userId]
      );

      if (!usuario) {
        return {
          success: false,
          message: 'Usuário não encontrado',
        };
      }

      // Verifica a senha atual
      const senhaCorreta = await comparePassword(dados.senha_atual, usuario.password_hash);

      if (!senhaCorreta) {
        return {
          success: false,
          message: 'Senha atual incorreta',
        };
      }

      // Gera o hash da nova senha
      const novaSenhaHash = await hashPassword(dados.senha_nova);

      // Atualiza a senha
      await query.execQuery(
        'UPDATE "user" SET password_hash = $1, updated_at = NOW() WHERE user_id = $2',
        [novaSenhaHash, userId]
      );

      return {
        success: true,
        message: 'Senha atualizada com sucesso',
      };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw new Error('Erro ao atualizar senha');
    }
  }

  /**
   * Deleta (desativa) um usuário
   */
  async deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      // Verifica se o usuário existe
      const usuario = await query.execQueryOne<Usuario>(
        'SELECT user_id FROM "user" WHERE user_id = $1',
        [userId]
      );

      if (!usuario) {
        return {
          success: false,
          message: 'Usuário não encontrado',
        };
      }

      // Desativa o usuário em vez de deletar (soft delete)
      await query.execQuery(
        'UPDATE "user" SET active = false, updated_at = NOW() WHERE user_id = $1',
        [userId]
      );

      return {
        success: true,
        message: 'Usuário desativado com sucesso',
      };
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw new Error('Erro ao deletar usuário');
    }
  }

  /**
   * Deleta permanentemente um usuário (use com cuidado!)
   */
  async hardDeleteUser(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      // Verifica se o usuário existe
      const usuario = await query.execQueryOne<Usuario>(
        'SELECT user_id FROM "user" WHERE user_id = $1',
        [userId]
      );

      if (!usuario) {
        return {
          success: false,
          message: 'Usuário não encontrado',
        };
      }

      // Deleta permanentemente o usuário
      await query.delete('"user"', 'user_id = $1', [userId]);

      return {
        success: true,
        message: 'Usuário deletado permanentemente',
      };
    } catch (error) {
      console.error('Erro ao deletar usuário permanentemente:', error);
      throw new Error('Erro ao deletar usuário permanentemente');
    }
  }

  /**
   * Reativa um usuário desativado
   */
  async activateUser(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      // Verifica se o usuário existe
      const usuario = await query.execQueryOne<Usuario>(
        'SELECT user_id, active FROM "user" WHERE user_id = $1',
        [userId]
      );

      if (!usuario) {
        return {
          success: false,
          message: 'Usuário não encontrado',
        };
      }

      if (usuario.active) {
        return {
          success: false,
          message: 'Usuário já está ativo',
        };
      }

      // Reativa o usuário
      await query.execQuery(
        'UPDATE "user" SET active = true, updated_at = NOW() WHERE user_id = $1',
        [userId]
      );

      return {
        success: true,
        message: 'Usuário reativado com sucesso',
      };
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      throw new Error('Erro ao reativar usuário');
    }
  }
}

export const userService = new UserService();

