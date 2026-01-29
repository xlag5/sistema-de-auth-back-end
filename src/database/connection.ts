import { Pool, PoolClient } from 'pg';
import { dbConfig } from './config';

/**
 * Pool de conexões com PostgreSQL
 * Gerencia múltiplas conexões para melhor performance
 */
class DatabaseConnection {
  private pool: Pool;
  private static instance: DatabaseConnection;

  private constructor() {
    this.pool = new Pool(dbConfig);
    
    // Event listeners para monitoramento
    this.pool.on('connect', () => {
      console.log('✓ Nova conexão estabelecida com PostgreSQL');
    });

    this.pool.on('error', (err) => {
      console.error('✗ Erro inesperado no pool de conexões:', err);
      process.exit(-1);
    });

    this.pool.on('remove', () => {
      console.log('⊘ Conexão removida do pool');
    });
  }

  /**
   * Singleton - garante uma única instância do pool de conexões
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Retorna o pool de conexões
   */
  public getPool(): Pool {
    return this.pool;
  }

  /**
   * Obtém um cliente do pool para transações
   */
  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Testa a conexão com o banco de dados
   */
  public async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      console.log('✓ Conexão com PostgreSQL testada com sucesso:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error('✗ Erro ao testar conexão com PostgreSQL:', error);
      return false;
    }
  }

  /**
   * Fecha todas as conexões do pool
   */
  public async close(): Promise<void> {
    try {
      await this.pool.end();
      console.log('✓ Pool de conexões encerrado com sucesso');
    } catch (error) {
      console.error('✗ Erro ao encerrar pool de conexões:', error);
      throw error;
    }
  }

  /**
   * Retorna informações sobre o pool
   */
  public getPoolInfo(): {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
  } {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}

// Export da instância singleton
export const db = DatabaseConnection.getInstance();

