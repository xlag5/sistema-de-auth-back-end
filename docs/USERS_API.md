# API de Gerenciamento de Usuários

Esta documentação descreve todas as rotas disponíveis para o CRUD (Create, Read, Update, Delete) de usuários.

## 🔐 Autenticação

**Todas as rotas de usuários requerem autenticação via JWT.**

Para acessar qualquer rota, você deve incluir o token no header:

```
Authorization: Bearer seu_token_jwt_aqui
```

## 📋 Endpoints

### 1. Listar Usuários

**Endpoint:** `GET /api/users`

**Descrição:** Lista todos os usuários com suporte a filtros e paginação.

**Query Parameters:**
- `name` (string, opcional) - Filtra por nome ou sobrenome (busca parcial)
- `email` (string, opcional) - Filtra por email (busca parcial)
- `active` (boolean, opcional) - Filtra por status ativo (true/false)
- `page` (number, opcional) - Número da página (padrão: 1)
- `pageSize` (number, opcional) - Itens por página (padrão: 10, máx: 100)

**Exemplo de Requisição:**
```http
GET /api/users?name=João&active=true&page=1&pageSize=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "name": "João",
      "last_name": "Silva",
      "email": "joao@example.com",
      "date_of_birth": "1990-01-15T00:00:00.000Z",
      "active": true,
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z",
      "last_login": "2024-01-28T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 2. Buscar Usuário por ID

**Endpoint:** `GET /api/users/:id`

**Descrição:** Retorna os dados de um usuário específico.

**Parâmetros:**
- `id` (number) - ID do usuário

**Exemplo de Requisição:**
```http
GET /api/users/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "name": "João",
    "last_name": "Silva",
    "email": "joao@example.com",
    "date_of_birth": "1990-01-15T00:00:00.000Z",
    "active": true,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z",
    "last_login": "2024-01-28T15:30:00.000Z"
  }
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "message": "Usuário não encontrado"
}
```

---

### 3. Criar Usuário

**Endpoint:** `POST /api/users`

**Descrição:** Cria um novo usuário no sistema.

**Body (JSON):**
```json
{
  "name": "João",
  "last_name": "Silva",
  "email": "joao.silva@example.com",
  "senha": "Senha123",
  "date_of_birth": "1990-01-15",
  "active": true
}
```

**Campos:**
- `name` (string, obrigatório) - Nome (min: 2, max: 100 caracteres)
- `last_name` (string, obrigatório) - Sobrenome (min: 2, max: 100 caracteres)
- `email` (string, obrigatório) - Email válido
- `senha` (string, obrigatório) - Senha (min: 8 caracteres, deve conter maiúscula, minúscula e número)
- `date_of_birth` (string, opcional) - Data de nascimento (formato: YYYY-MM-DD)
- `active` (boolean, opcional) - Status ativo (padrão: true)

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "user_id": 2,
    "name": "João",
    "last_name": "Silva",
    "email": "joao.silva@example.com",
    "date_of_birth": "1990-01-15T00:00:00.000Z",
    "active": true,
    "created_at": "2024-01-28T10:00:00.000Z"
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "message": "Email já cadastrado"
}
```

---

### 4. Atualizar Usuário

**Endpoint:** `PUT /api/users/:id`

**Descrição:** Atualiza os dados de um usuário existente.

**Parâmetros:**
- `id` (number) - ID do usuário

**Body (JSON):**
```json
{
  "name": "João Pedro",
  "last_name": "Silva Santos",
  "email": "joao.pedro@example.com",
  "date_of_birth": "1990-01-15",
  "active": true
}
```

**Campos:**
- `name` (string, opcional) - Nome
- `last_name` (string, opcional) - Sobrenome
- `email` (string, opcional) - Email
- `date_of_birth` (string, opcional) - Data de nascimento
- `active` (boolean, opcional) - Status ativo

**Nota:** Pelo menos um campo deve ser fornecido.

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso",
  "data": {
    "user_id": 1,
    "name": "João Pedro",
    "last_name": "Silva Santos",
    "email": "joao.pedro@example.com",
    "date_of_birth": "1990-01-15T00:00:00.000Z",
    "active": true,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-28T11:00:00.000Z",
    "last_login": "2024-01-28T15:30:00.000Z"
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "message": "Email já está em uso por outro usuário"
}
```

---

### 5. Atualizar Senha

**Endpoint:** `PATCH /api/users/:id/password`

**Descrição:** Atualiza a senha de um usuário. O usuário só pode alterar sua própria senha.

**Parâmetros:**
- `id` (number) - ID do usuário

**Body (JSON):**
```json
{
  "senha_atual": "Senha123",
  "senha_nova": "NovaSenha456"
}
```

**Campos:**
- `senha_atual` (string, obrigatório) - Senha atual
- `senha_nova` (string, obrigatório) - Nova senha (min: 8 caracteres, deve conter maiúscula, minúscula e número)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Senha atualizada com sucesso"
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "message": "Senha atual incorreta"
}
```

**Resposta de Erro (403):**
```json
{
  "success": false,
  "message": "Você não tem permissão para alterar a senha deste usuário"
}
```

---

### 6. Desativar Usuário (Soft Delete)

**Endpoint:** `DELETE /api/users/:id`

**Descrição:** Desativa um usuário (soft delete). O usuário não é deletado do banco, apenas marcado como inativo.

**Parâmetros:**
- `id` (number) - ID do usuário

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Usuário desativado com sucesso"
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "message": "Você não pode desativar sua própria conta"
}
```

---

### 7. Reativar Usuário

**Endpoint:** `PATCH /api/users/:id/activate`

**Descrição:** Reativa um usuário que foi desativado.

**Parâmetros:**
- `id` (number) - ID do usuário

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Usuário reativado com sucesso"
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "message": "Usuário já está ativo"
}
```

---

### 8. Deletar Permanentemente (Hard Delete)

**Endpoint:** `DELETE /api/users/:id/permanent`

**Descrição:** Deleta permanentemente um usuário do banco de dados. **Use com extrema cautela!**

**Parâmetros:**
- `id` (number) - ID do usuário

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Usuário deletado permanentemente"
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "message": "Você não pode deletar sua própria conta"
}
```

---

## 🔒 Regras de Segurança

1. **Autenticação Obrigatória:** Todas as rotas requerem um token JWT válido.

2. **Alteração de Senha:** Um usuário só pode alterar sua própria senha.

3. **Auto-Exclusão Proibida:** Um usuário não pode desativar ou deletar sua própria conta.

4. **Validação de Email:** O sistema verifica se o email já está em uso antes de criar ou atualizar.

5. **Validação de Senha:** 
   - Mínimo de 8 caracteres
   - Deve conter pelo menos uma letra maiúscula
   - Deve conter pelo menos uma letra minúscula
   - Deve conter pelo menos um número

---

## 📝 Códigos de Status HTTP

- `200` - OK (sucesso)
- `201` - Created (criado com sucesso)
- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (não autenticado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found (não encontrado)
- `500` - Internal Server Error (erro interno)

---

## 🧪 Testando a API

Use o arquivo `test-users-api.http` para testar todas as rotas. Você pode usar extensões como REST Client no VS Code ou ferramentas como Postman/Insomnia.

1. Faça login para obter o token:
   ```http
   POST /api/auth/login
   Content-Type: application/json

   {
     "email": "seu@email.com",
     "senha": "SuaSenha123"
   }
   ```

2. Copie o token retornado e use-o nas requisições:
   ```http
   GET /api/users
   Authorization: Bearer SEU_TOKEN_AQUI
   ```

---

## 📚 Estrutura do Projeto

```
src/
├── controllers/
│   └── user.controller.ts    # Controlador de usuários
├── services/
│   └── user.service.ts        # Lógica de negócio
├── routes/
│   └── user.routes.ts         # Definição das rotas
├── validators/
│   └── user.validator.ts      # Validação de dados
├── types/
│   └── user.types.ts          # Tipos TypeScript
└── middleware/
    └── auth.middleware.ts     # Middleware de autenticação
```

---

## 💡 Dicas

1. **Paginação:** Use sempre paginação para listas grandes de usuários.

2. **Filtros:** Combine filtros para buscas mais específicas.

3. **Soft Delete:** Prefira desativar usuários em vez de deletar permanentemente.

4. **Segurança:** Nunca exponha senhas ou hashes nas respostas da API.

5. **Validação:** Sempre valide os dados no frontend antes de enviar.

---

## 🐛 Tratamento de Erros

Todas as respostas de erro seguem o padrão:

```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": {
    // Detalhes dos erros de validação (quando aplicável)
  }
}
```

Exemplo de erro de validação:
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": {
    "email": {
      "_errors": ["Email inválido"]
    },
    "senha": {
      "_errors": ["Senha deve ter pelo menos 8 caracteres"]
    }
  }
}
```

