/**
 * Tipos e interfaces para autenticação
 */

export interface Usuario {
  user_id: number;
  name: string;
  last_name: string;
  date_of_birth?: Date;
  email: string;
  password_hash: string;
  active: boolean;
  created_at: Date;
  updated_at?: Date;
  last_login?: Date;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    usuario: {
      user_id: number;
      name: string;
      last_name: string;
      email: string;
    };
  };
}

export interface RegisterRequest {
  name: string;
  last_name: string;
  email: string;
  senha: string;
  date_of_birth?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user_id: number;
    name: string;
    last_name: string;
    email: string;
  };
}

export interface TokenPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: TokenPayload;
}

