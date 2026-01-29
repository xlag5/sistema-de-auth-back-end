/**
 * Módulo central de banco de dados
 * Exporta todas as funcionalidades necessárias para trabalhar com PostgreSQL
 */

export { db } from './connection';
export { query } from './query';
export type { PaginatedResult } from './query';
export { dbConfig } from './config';

