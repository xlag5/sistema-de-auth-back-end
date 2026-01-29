import { z } from 'zod';

/**
 * Schemas de validação para gerenciamento de usuários usando Zod
 */

/**
 * Schema de validação para criar usuário
 */
export const createUserSchema = z.object({
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
  active: z.boolean().optional().default(true),
});

/**
 * Schema de validação para atualizar usuário
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  last_name: z
    .string()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(100, 'Sobrenome deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .trim()
    .optional(),
  date_of_birth: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Data de nascimento inválida'
    ),
  active: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  'Pelo menos um campo deve ser informado para atualização'
);

/**
 * Schema de validação para atualizar senha
 */
export const updatePasswordSchema = z.object({
  senha_atual: z
    .string({
      required_error: 'Senha atual é obrigatória',
    })
    .min(1, 'Senha atual não pode estar vazia'),
  senha_nova: z
    .string({
      required_error: 'Senha nova é obrigatória',
    })
    .min(8, 'Senha nova deve ter pelo menos 8 caracteres')
    .max(100, 'Senha nova deve ter no máximo 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha nova deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
    ),
}).refine(
  (data) => data.senha_atual !== data.senha_nova,
  'Senha nova deve ser diferente da senha atual'
);

/**
 * Schema de validação para filtros de listagem
 */
export const userFiltersSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  active: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, 'Página deve ser maior que 0'),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, 'Tamanho da página deve ser entre 1 e 100'),
});

/**
 * Schema de validação para ID de usuário
 */
export const userIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID deve ser um número')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'ID deve ser maior que 0'),
});

/**
 * Valida os dados de criação de usuário
 */
export function validateCreateUser(data: unknown) {
  return createUserSchema.safeParse(data);
}

/**
 * Valida os dados de atualização de usuário
 */
export function validateUpdateUser(data: unknown) {
  return updateUserSchema.safeParse(data);
}

/**
 * Valida os dados de atualização de senha
 */
export function validateUpdatePassword(data: unknown) {
  return updatePasswordSchema.safeParse(data);
}

/**
 * Valida os filtros de listagem
 */
export function validateUserFilters(data: unknown) {
  return userFiltersSchema.safeParse(data);
}

/**
 * Valida o ID de usuário
 */
export function validateUserId(data: unknown) {
  return userIdSchema.safeParse(data);
}

