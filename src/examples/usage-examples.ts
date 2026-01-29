import { db, query } from '../database';

/**
 * Exemplos de uso da camada de banco de dados
 */

// ==========================================
// 1. QUERIES SIMPLES
// ==========================================

export async function exemploQuerySimples() {
  // Executar query e obter resultado completo
  const result = await query.execQuery('SELECT NOW() as data_atual');
  console.log('Resultado completo:', result);

  // Executar query e obter apenas as linhas
  const rows = await query.execQueryRows('SELECT * FROM usuarios LIMIT 10');
  console.log('Linhas:', rows);

  // Executar query e obter apenas a primeira linha
  const user = await query.execQueryOne(
    'SELECT * FROM usuarios WHERE id = $1',
    [1]
  );
  console.log('Usuário:', user);
}

// ==========================================
// 2. QUERIES COM PARÂMETROS
// ==========================================

export async function exemploQueryComParametros() {
  // Query com parâmetros nomeados ($1, $2, etc)
  const result = await query.execQueryRows(
    'SELECT * FROM usuarios WHERE email = $1 AND ativo = $2',
    ['usuario@email.com', true]
  );
  console.log('Usuários encontrados:', result);
}

// ==========================================
// 3. INSERÇÃO DE DADOS
// ==========================================

export async function exemploInsert() {
  // Inserir um novo usuário
  const novoUsuario = await query.insert('usuarios', {
    nome: 'João Silva',
    email: 'joao@email.com',
    senha_hash: 'hash_da_senha',
    ativo: true,
    criado_em: new Date(),
  });
  
  console.log('Usuário criado:', novoUsuario);
  return novoUsuario;
}

// ==========================================
// 4. ATUALIZAÇÃO DE DADOS
// ==========================================

export async function exemploUpdate() {
  // Atualizar um usuário
  const linhasAfetadas = await query.update(
    'usuarios',
    {
      nome: 'João da Silva',
      atualizado_em: new Date(),
    },
    'id = $1',
    [1]
  );
  
  console.log('Linhas atualizadas:', linhasAfetadas);
}

// ==========================================
// 5. DELEÇÃO DE DADOS
// ==========================================

export async function exemploDelete() {
  // Deletar um usuário
  const linhasAfetadas = await query.delete(
    'usuarios',
    'id = $1',
    [1]
  );
  
  console.log('Linhas deletadas:', linhasAfetadas);
}

// ==========================================
// 6. TRANSAÇÕES
// ==========================================

export async function exemploTransacao() {
  try {
    // Executar múltiplas queries em uma transação
    const results = await query.execTransaction([
      {
        text: 'INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING id',
        params: ['Maria', 'maria@email.com'],
      },
      {
        text: 'INSERT INTO perfis (usuario_id, bio) VALUES ($1, $2)',
        params: [1, 'Biografia da Maria'],
      },
    ]);
    
    console.log('Transação executada com sucesso:', results);
  } catch (error) {
    console.error('Erro na transação:', error);
  }
}

// ==========================================
// 7. PAGINAÇÃO
// ==========================================

export async function exemploPaginacao() {
  // Query com paginação
  const resultado = await query.execQueryPaginated(
    'SELECT * FROM usuarios ORDER BY criado_em DESC',
    [], // parâmetros
    1,  // página
    10  // itens por página
  );
  
  console.log('Dados paginados:', {
    dados: resultado.data,
    total: resultado.total,
    página: resultado.page,
    totalPáginas: resultado.totalPages,
  });
}

// ==========================================
// 8. TRANSAÇÃO MANUAL COM CLIENT
// ==========================================

export async function exemploTransacaoManual() {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const res1 = await client.query(
      'INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING id',
      ['Pedro', 'pedro@email.com']
    );
    
    const userId = res1.rows[0].id;
    
    await client.query(
      'INSERT INTO perfis (usuario_id, bio) VALUES ($1, $2)',
      [userId, 'Biografia do Pedro']
    );
    
    await client.query('COMMIT');
    console.log('Transação manual executada com sucesso');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro na transação manual:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ==========================================
// 9. QUERY COMPLEXA COM JOIN
// ==========================================

export async function exemploJoin() {
  const resultado = await query.execQueryRows(`
    SELECT 
      u.id,
      u.nome,
      u.email,
      p.bio,
      p.avatar
    FROM usuarios u
    LEFT JOIN perfis p ON u.id = p.usuario_id
    WHERE u.ativo = $1
    ORDER BY u.criado_em DESC
    LIMIT 20
  `, [true]);
  
  console.log('Usuários com perfis:', resultado);
}

// ==========================================
// 10. INFORMAÇÕES DO POOL
// ==========================================

export async function exemploPoolInfo() {
  const info = db.getPoolInfo();
  console.log('Informações do pool:', {
    total: info.totalCount,
    ociosas: info.idleCount,
    aguardando: info.waitingCount,
  });
}

