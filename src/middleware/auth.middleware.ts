import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { TokenPayload } from '../types/auth.types';

/**
 * Estende o tipo Request do Express para incluir o usuário autenticado
 */
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // Extrai o token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Token não fornecido',
      });
      return;
    }

    // Formato esperado: "Bearer TOKEN"
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      res.status(401).json({
        success: false,
        message: 'Formato de token inválido',
      });
      return;
    }

    // Verifica e decodifica o token
    const decoded = verifyToken(token);

    // Adiciona os dados do usuário ao request
    req.user = decoded;

    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token inválido';
    res.status(401).json({
      success: false,
      message,
    });
  }
}

/**
 * Middleware opcional de autenticação
 * Não bloqueia a requisição se o token não estiver presente ou for inválido
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const [bearer, token] = authHeader.split(' ');

      if (bearer === 'Bearer' && token) {
        const decoded = verifyToken(token);
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    // Ignora erros de token em middleware opcional
    next();
  }
}

