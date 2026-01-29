import { z } from 'zod';

/**
 * Schemas de validação para autenticação usando Zod
 */

/**
 * Schema de validação para login
 */
export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email é obrigatório',
    })
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  senha: z
    .string({
      required_error: 'Senha é obrigatória',
    })
    .min(1, 'Senha não pode estar vazia'),
});

/**
 * Schema de validação para registro
 */
export const registerSchema = z.object({
  name: z
    .string({
      required_error: 'Nome é obrigatório',
    })
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  last_name: z
    .string({
      required_error: 'Sobrenome é obrigatório',
    })
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(100, 'Sobrenome deve ter no máximo 100 caracteres')
    .trim(),
  email: z
    .string({
      required_error: 'Email é obrigatório',
    })
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  senha: z
    .string({
      required_error: 'Senha é obrigatória',
    })
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
    ),
  date_of_birth: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Data de nascimento inválida'
    ),
});

/**
 * Valida os dados de login
 */
export function validateLogin(data: unknown) {
  return loginSchema.safeParse(data);
}

/**
 * Valida os dados de registro
 */
export function validateRegister(data: unknown) {
  return registerSchema.safeParse(data);
}

