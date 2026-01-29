import { QueryResult, QueryResultRow } from 'pg';
import { db } from './connection';

/**
 * Interface para resultados de queries paginadas
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Classe para execução de queries no PostgreSQL
 */
class QueryExecutor {
  /**
   * Executa uma query SQL simples
   * @param text - Query SQL
   * @param params - Parâmetros da query (opcional)
   * @returns Resultado da query
   */
  async execQuery<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await db.getPool().query<T>(text, params);
      const duration = Date.now() - start;
      
      console.log('Query executada:', {
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        rows: result.rowCount,
      });
      
      return result;
    } catch (error) {
      console.error('Erro ao executar query:', {
        text,
        params,
        error,
      });
      throw error;
    }
  }

  /**
   * Executa uma query e retorna apenas as linhas
   * @param text - Query SQL
   * @param params - Parâmetros da query (opcional)
   * @returns Array de linhas
   */
  async execQueryRows<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<T[]> {
    const result = await this.execQuery<T>(text, params);
    return result.rows;
  }

  /**
   * Executa uma query e retorna apenas a primeira linha
   * @param text - Query SQL
   * @param params - Parâmetros da query (opcional)
   * @returns Primeira linha ou null
   */
  async execQueryOne<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<T | null> {
    const result = await this.execQuery<T>(text, params);
    return result.rows[0] || null;
  }

  /**
   * Executa múltiplas queries em uma transação
   * @param queries - Array de queries com seus parâmetros
   * @returns Array de resultados
   */
  async execTransaction<T extends QueryResultRow = any>(
    queries: Array<{ text: string; params?: any[] }>
  ): Promise<QueryResult<T>[]> {
    const client = await db.getClient();
    const results: QueryResult<T>[] = [];

    try {
      await client.query('BEGIN');
      
      for (const query of queries) {
        const result = await client.query<T>(query.text, query.params);
        results.push(result);
      }
      
      await client.query('COMMIT');
      console.log('✓ Transação executada com sucesso');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('✗ Erro na transação, ROLLBACK executado:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Executa uma query com paginação
   * @param text - Query SQL (sem LIMIT e OFFSET)
   * @param params - Parâmetros da query
   * @param page - Número da página (começa em 1)
   * @param pageSize - Tamanho da página
   * @returns Resultado paginado
   */
  async execQueryPaginated<T extends QueryResultRow = any>(
    text: string,
    params: any[] = [],
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResult<T>> {
    // Query para contar o total de registros
    const countQuery = `SELECT COUNT(*) FROM (${text}) AS count_query`;
    const countResult = await this.execQueryOne<{ count: string }>(countQuery, params);
    const total = parseInt(countResult?.count || '0', 10);

    // Query paginada
    const offset = (page - 1) * pageSize;
    const paginatedQuery = `${text} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const paginatedParams = [...params, pageSize, offset];
    const data = await this.execQueryRows<T>(paginatedQuery, paginatedParams);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Insere um registro e retorna o ID gerado
   * @param table - Nome da tabela
   * @param data - Dados a serem inseridos
   * @returns ID do registro inserido
   */
  async insert<T extends QueryResultRow = any>(
    table: string,
    data: Record<string, any>
  ): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await this.execQueryOne<T>(query, values);
    if (!result) {
      throw new Error('Falha ao inserir registro');
    }
    return result;
  }

  /**
   * Atualiza registros na tabela
   * @param table - Nome da tabela
   * @param data - Dados a serem atualizados
   * @param where - Condição WHERE
   * @param whereParams - Parâmetros da condição WHERE
   * @returns Número de linhas afetadas
   */
  async update(
    table: string,
    data: Record<string, any>,
    where: string,
    whereParams: any[]
  ): Promise<number> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    const setClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const allParams = [...values, ...whereParams];
    const whereClauseParams = whereParams
      .map((_, index) => `$${values.length + index + 1}`)
      .join(', ');
    
    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE ${where}
      RETURNING *
    `;
    
    const result = await this.execQuery(query, allParams);
    return result.rowCount || 0;
  }

  /**
   * Deleta registros da tabela
   * @param table - Nome da tabela
   * @param where - Condição WHERE
   * @param whereParams - Parâmetros da condição WHERE
   * @returns Número de linhas afetadas
   */
  async delete(
    table: string,
    where: string,
    whereParams: any[]
  ): Promise<number> {
    const query = `DELETE FROM ${table} WHERE ${where}`;
    const result = await this.execQuery(query, whereParams);
    return result.rowCount || 0;
  }
}

// Export da instância
export const query = new QueryExecutor();

