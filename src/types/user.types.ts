/**
 * Tipos e interfaces para gerenciamento de usuários
 */

import { Usuario } from './auth.types';

/**
 * Dados para criar um novo usuário
 */
export interface CreateUserRequest {
  name: string;
  last_name: string;
  email: string;
  senha: string;
  date_of_birth?: string;
  active?: boolean;
}

/**
 * Dados para atualizar um usuário
 */
export interface UpdateUserRequest {
  name?: string;
  last_name?: string;
  email?: string;
  date_of_birth?: string;
  active?: boolean;
}

/**
 * Dados para atualizar senha
 */
export interface UpdatePasswordRequest {
  senha_atual: string;
  senha_nova: string;
}

/**
 * Resposta de usuário (sem dados sensíveis)
 */
export interface UserResponse {
  user_id: number;
  name: string;
  last_name: string;
  email: string;
  date_of_birth?: Date;
  active: boolean;
  created_at: Date;
  updated_at?: Date;
  last_login?: Date;
}

/**
 * Resposta de lista de usuários
 */
export interface UsersListResponse {
  success: boolean;
  data: UserResponse[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Resposta de operação de usuário
 */
export interface UserOperationResponse {
  success: boolean;
  message: string;
  data?: UserResponse;
}

/**
 * Filtros para listagem de usuários
 */
export interface UserFilters {
  name?: string;
  email?: string;
  active?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * Converte Usuario para UserResponse (remove dados sensíveis)
 */
export function toUserResponse(usuario: Usuario): UserResponse {
  return {
    user_id: usuario.user_id,
    name: usuario.name,
    last_name: usuario.last_name,
    email: usuario.email,
    date_of_birth: usuario.date_of_birth,
    active: usuario.active,
    created_at: usuario.created_at,
    updated_at: usuario.updated_at,
    last_login: usuario.last_login,
  };
}

