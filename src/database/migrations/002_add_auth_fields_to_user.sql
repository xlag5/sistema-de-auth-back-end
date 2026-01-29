-- Adiciona campos necessários para autenticação na tabela user existente
-- Tabela existente: user (user_id, name, last_name, date_of_birth)

-- Adiciona coluna de email (obrigatória para autenticação)
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

-- Adiciona coluna de senha hash
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Adiciona coluna de status ativo
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Adiciona timestamps
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Cria índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_active ON "user"(active);

-- Comentários
COMMENT ON COLUMN "user".email IS 'Email do usuário (único) - usado para login';
COMMENT ON COLUMN "user".password_hash IS 'Hash bcrypt da senha';
COMMENT ON COLUMN "user".active IS 'Indica se o usuário está ativo';
COMMENT ON COLUMN "user".created_at IS 'Data de criação do registro';
COMMENT ON COLUMN "user".updated_at IS 'Data da última atualização';
COMMENT ON COLUMN "user".last_login IS 'Data do último login';

