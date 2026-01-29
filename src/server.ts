import app from './app';
import { db } from './database';

/**
 * Servidor HTTP
 */

const PORT = process.env.PORT || 3000;

/**
 * Inicia o servidor
 */
async function startServer() {
  try {
    // Testa a conexão com o banco de dados
    console.log('🔌 Conectando ao banco de dados...');
    const connected = await db.testConnection();

    if (!connected) {
      console.error('❌ Não foi possível conectar ao banco de dados');
      process.exit(1);
    }

    console.log('✅ Conexão com banco de dados estabelecida\n');

    // Inicia o servidor
    app.listen(PORT, () => {
      console.log('🚀 Servidor iniciado com sucesso!');
      console.log(`📡 Rodando em: http://localhost:${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log('\n📋 Endpoints disponíveis:');
      console.log(`   GET  http://localhost:${PORT}/`);
      console.log(`   GET  http://localhost:${PORT}/api/health`);
      console.log(`   POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   POST http://localhost:${PORT}/api/auth/register`);
      console.log(`   GET  http://localhost:${PORT}/api/auth/me`);
      console.log(`   POST http://localhost:${PORT}/api/auth/check-email`);
      console.log('\n💡 Pressione CTRL+C para parar o servidor\n');
    });

    // Tratamento de encerramento gracioso
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Encerrando servidor...');
      await db.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n\n🛑 Encerrando servidor...');
      await db.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Inicia o servidor
startServer();

