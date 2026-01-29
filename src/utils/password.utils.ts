import bcrypt from 'bcrypt';

/**
 * Utilitários para gerenciamento de senhas
 */

const SALT_ROUNDS = 10;

/**
 * Gera o hash de uma senha
 * @param senha - Senha em texto plano
 * @returns Hash da senha
 */
export async function hashPassword(senha: string): Promise<string> {
  try {
    const hash = await bcrypt.hash(senha, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Erro ao gerar hash da senha:', error);
    throw new Error('Erro ao processar senha');
  }
}

/**
 * Compara uma senha com seu hash
 * @param senha - Senha em texto plano
 * @param hash - Hash armazenado
 * @returns True se a senha estiver correta
 */
export async function comparePassword(senha: string, hash: string): Promise<boolean> {
  try {
    const match = await bcrypt.compare(senha, hash);
    return match;
  } catch (error) {
    console.error('Erro ao comparar senha:', error);
    throw new Error('Erro ao verificar senha');
  }
}

/**
 * Valida a força da senha
 * @param senha - Senha a ser validada
 * @returns Objeto com resultado e mensagem
 */
export function validatePasswordStrength(senha: string): { 
  valid: boolean; 
  message: string;
  score: number;
} {
  const minLength = 8;
  let score = 0;
  const messages: string[] = [];

  // Verifica comprimento mínimo
  if (senha.length < minLength) {
    return {
      valid: false,
      message: `A senha deve ter pelo menos ${minLength} caracteres`,
      score: 0,
    };
  }
  score += 1;

  // Verifica letra maiúscula
  if (/[A-Z]/.test(senha)) {
    score += 1;
  } else {
    messages.push('uma letra maiúscula');
  }

  // Verifica letra minúscula
  if (/[a-z]/.test(senha)) {
    score += 1;
  } else {
    messages.push('uma letra minúscula');
  }

  // Verifica número
  if (/\d/.test(senha)) {
    score += 1;
  } else {
    messages.push('um número');
  }

  // Verifica caractere especial
  if (/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
    score += 1;
  } else {
    messages.push('um caractere especial');
  }

  // Senha forte precisa ter pelo menos 4 dos 5 critérios
  if (score >= 4) {
    return {
      valid: true,
      message: 'Senha forte',
      score,
    };
  }

  return {
    valid: false,
    message: `Senha fraca. Adicione: ${messages.join(', ')}`,
    score,
  };
}

