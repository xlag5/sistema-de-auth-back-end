import { db, query } from './database';

/**
 * Exemplo de uso da camada de banco de dados
 */
async function main() {
  console.log('🚀 Iniciando aplicação...\n');

  // Testa a conexão
  const connected = await db.testConnection();
  if (!connected) {
    console.error('Não foi possível conectar ao banco de dados');
    process.exit(1);
  }

  console.log('\n📊 Informações do pool de conexões:');
  console.log(db.getPoolInfo());

  // Exemplo de query simples
  try {
    console.log('\n🔍 Executando query de exemplo...');
    const result = await query.execQuery('SELECT version()');
    console.log('Versão do PostgreSQL:', result.rows[0].version);
  } catch (error) {
    console.error('Erro ao executar query:', error);
  }

  // Encerra o pool ao finalizar a aplicação
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Encerrando aplicação...');
    await db.close();
    process.exit(0);
  });
}

main().catch(console.error);

