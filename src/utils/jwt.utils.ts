import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';
import { TokenPayload } from '../types/auth.types';

/**
 * Utilitários para gerenciamento de JWT
 */

/**
 * Gera um token JWT
 * @param payload - Dados a serem codificados no token
 * @returns Token JWT
 */
export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  try {
    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });
    return token;
  } catch (error) {
    console.error('Erro ao gerar token:', error);
    throw new Error('Erro ao gerar token de autenticação');
  }
}

/**
 * Gera um refresh token JWT
 * @param payload - Dados a serem codificados no token
 * @returns Refresh token JWT
 */
export function generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  try {
    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.refreshExpiresIn,
    });
    return token;
  } catch (error) {
    console.error('Erro ao gerar refresh token:', error);
    throw new Error('Erro ao gerar refresh token');
  }
}

/**
 * Verifica e decodifica um token JWT
 * @param token - Token JWT a ser verificado
 * @returns Payload do token
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expirado');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token inválido');
    }
    console.error('Erro ao verificar token:', error);
    throw new Error('Erro ao verificar token');
  }
}

/**
 * Decodifica um token sem verificar a assinatura
 * @param token - Token JWT
 * @returns Payload do token ou null
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
}

