import { config } from 'dotenv';

config();

/**
 * Configurações do JWT
 */
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

// Aviso se estiver usando a chave padrão
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  AVISO: Usando JWT_SECRET padrão. Configure uma chave segura no .env!');
}

