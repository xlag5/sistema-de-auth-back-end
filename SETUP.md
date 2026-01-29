# 🚀 Guia de Instalação Rápida

## Pré-requisitos

- Node.js 18+ instalado
- Docker e Docker Compose instalados
- Git (opcional)

## Instalação em 5 Passos

### 1️⃣ Iniciar o Banco de Dados

```bash
docker-compose up -d
```

Aguarde alguns segundos para o PostgreSQL iniciar completamente.

### 2️⃣ Aplicar Migration

```bash
docker exec -i sistema_auth psql -U admin -d sistema_auth < backend/src/database/migrations/002_add_auth_fields_to_user.sql
```

### 3️⃣ Configurar Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env`:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

Inicie o backend:
```bash
npm run dev
```

✅ Backend rodando em `http://localhost:3000`

### 4️⃣ Configurar Frontend

Abra um **novo terminal** e execute:

```bash
cd frontend
npm install
```

Crie o arquivo `.env`:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

Inicie o frontend:
```bash
npm run dev
```

✅ Frontend rodando em `http://localhost:5173`

### 5️⃣ Testar o Sistema

1. Abra o navegador em `http://localhost:5173`
2. Clique em "Cadastre-se"
3. Preencha os dados:
   - Nome: João
   - Sobrenome: Silva
   - Email: joao@email.com
   - Senha: SenhaForte123
4. Clique em "Cadastrar"
5. Faça login com as credenciais
6. Você será redirecionado para o Dashboard!

## 🎉 Pronto!

Seu sistema está funcionando!

## 🔧 Solução de Problemas

### Erro ao conectar ao banco de dados

```bash
# Verifique se o PostgreSQL está rodando
docker ps

# Se não estiver, inicie novamente
docker-compose up -d
```

### Porta já em uso

**Backend (porta 3000):**
- Edite `backend/.env` e mude `PORT=3000` para `PORT=3001`
- Edite `frontend/.env` e mude a URL para `http://localhost:3001/api`

**Frontend (porta 5173):**
- O Vite automaticamente tentará outra porta

### Migration não aplicada

Verifique se a tabela `user` existe:

```bash
docker exec -it sistema_auth psql -U admin -d sistema_auth

# No psql, execute:
\dt

# Deve mostrar a tabela "user"
# Para sair:
\q
```

## 📚 Próximos Passos

- Leia a [Documentação da API](docs/API.md)
- Veja o [Guia de Migration](MIGRATION_GUIDE.md)
- Explore o código do [Backend](backend/README.md) e [Frontend](frontend/README.md)

## 🆘 Precisa de Ajuda?

Verifique os logs:

```bash
# Logs do PostgreSQL
docker-compose logs -f postgres

# Logs do Backend
# Visíveis no terminal onde executou "npm run dev"

# Logs do Frontend
# Visíveis no terminal e no console do navegador (F12)
```

