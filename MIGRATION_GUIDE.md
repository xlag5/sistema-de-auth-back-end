# Guia de Migração - Sistema de Autenticação

## 📋 Contexto

O sistema de autenticação foi adaptado para usar a tabela `user` existente com o seguinte schema:
- `user_id` (chave primária)
- `name`
- `last_name`
- `date_of_birth`

## 🔧 Campos Adicionados

Para suportar autenticação, os seguintes campos foram adicionados à tabela `user`:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `email` | VARCHAR(255) UNIQUE | Email do usuário (usado para login) |
| `password_hash` | VARCHAR(255) | Hash bcrypt da senha |
| `active` | BOOLEAN | Status do usuário (ativo/inativo) |
| `created_at` | TIMESTAMP | Data de criação do registro |
| `updated_at` | TIMESTAMP | Data da última atualização |
| `last_login` | TIMESTAMP | Data do último login |

## 🚀 Como Aplicar a Migration

### Opção 1: Via Docker (Recomendado)

```bash
# Execute o arquivo SQL no container PostgreSQL
docker exec -i sistema_auth psql -U admin -d sistema_auth < src/database/migrations/002_add_auth_fields_to_user.sql
```

### Opção 2: Via psql diretamente

```bash
# Acesse o PostgreSQL
docker exec -it sistema_auth psql -U admin -d sistema_auth

# Execute o script
\i /caminho/completo/src/database/migrations/002_add_auth_fields_to_user.sql

# Ou cole o conteúdo diretamente
```

### Opção 3: Copiar e Executar SQL Manual

Conecte ao seu banco e execute:

```sql
-- Adiciona campos necessários para autenticação
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Cria índices
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_active ON "user"(active);
```

## ✅ Verificar se a Migration foi Aplicada

Após executar a migration, verifique se os campos foram adicionados:

```sql
-- Lista todas as colunas da tabela user
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user'
ORDER BY ordinal_position;
```

Você deve ver os novos campos:
- email
- password_hash
- active
- created_at
- updated_at
- last_login

## 📝 Estrutura Final da Tabela

```sql
CREATE TABLE "user" (
  user_id INTEGER PRIMARY KEY,        -- Já existente
  name VARCHAR,                        -- Já existente
  last_name VARCHAR,                   -- Já existente
  date_of_birth DATE,                  -- Já existente
  email VARCHAR(255) UNIQUE,           -- NOVO
  password_hash VARCHAR(255),          -- NOVO
  active BOOLEAN DEFAULT true,         -- NOVO
  created_at TIMESTAMP DEFAULT NOW(),  -- NOVO
  updated_at TIMESTAMP,                -- NOVO
  last_login TIMESTAMP                 -- NOVO
);
```

## 🔄 Adaptações no Código

### API Endpoints Atualizados

#### POST /api/auth/register
```json
{
  "name": "João",
  "last_name": "Silva",
  "email": "joao@email.com",
  "senha": "SenhaForte123",
  "date_of_birth": "1990-01-15"  // Opcional
}
```

#### Resposta do Login
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "user_id": 1,
      "name": "João",
      "last_name": "Silva",
      "email": "joao@email.com"
    }
  }
}
```

#### GET /api/auth/me (Usuário Autenticado)
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "name": "João",
    "last_name": "Silva",
    "email": "joao@email.com",
    "date_of_birth": "1990-01-15",
    "active": true,
    "created_at": "2024-01-28T10:00:00.000Z",
    "last_login": "2024-01-28T15:30:00.000Z"
  }
}
```

## 🎯 Dados Existentes

Se você já tem usuários na tabela `user`:

1. **Os dados existentes não serão afetados**
2. Os novos campos terão valores NULL para registros existentes
3. Para que usuários existentes possam fazer login, você precisa:
   - Adicionar email para cada usuário
   - Definir uma senha (será gerada com hash)

### Script para Atualizar Usuários Existentes

```sql
-- Exemplo: adicionar email e senha para usuários existentes
UPDATE "user"
SET 
  email = 'usuario' || user_id || '@temporario.com',
  password_hash = '$2b$10$...hash_senha_temporaria...',
  active = true
WHERE email IS NULL;
```

## 🧪 Testar o Sistema

Após aplicar a migration:

```bash
# 1. Inicie o servidor
npm run dev

# 2. Registre um novo usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João",
    "last_name": "Silva",
    "email": "joao@email.com",
    "senha": "SenhaForte123",
    "date_of_birth": "1990-01-15"
  }'

# 3. Faça login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "senha": "SenhaForte123"
  }'
```

## ⚠️ Notas Importantes

1. **Email é obrigatório** para novos registros
2. **Senha** deve ter no mínimo 8 caracteres com maiúscula, minúscula e número
3. **date_of_birth** é opcional no registro
4. A coluna `password_hash` armazena apenas o hash da senha (bcrypt), nunca a senha em texto puro
5. O campo `active` permite desativar usuários sem deletá-los

## 🔐 Segurança

- ✅ Senhas são armazenadas com hash bcrypt
- ✅ Email é único (não permite duplicatas)
- ✅ Validação de entrada em todas as requisições
- ✅ Tokens JWT com expiração
- ✅ Queries parametrizadas (proteção contra SQL Injection)

