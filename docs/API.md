# Documentação da API - Sistema de Autenticação

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Health Check

**GET** `/health`

Verifica se a API está funcionando.

**Resposta:**
```json
{
  "success": true,
  "message": "API está funcionando",
  "timestamp": "2024-01-28T10:30:00.000Z"
}
```

---

### 2. Login

**POST** `/auth/login`

Realiza o login do usuário.

**Body:**
```json
{
  "email": "usuario@email.com",
  "senha": "SenhaForte123"
}
```

**Resposta de Sucesso (200):**
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
      "email": "usuario@email.com"
    }
  }
}
```

**Resposta de Erro (401):**
```json
{
  "success": false,
  "message": "Email ou senha inválidos"
}
```

**Resposta de Validação (400):**
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": {
    "email": {
      "_errors": ["Email inválido"]
    }
  }
}
```

---

### 3. Registro

**POST** `/auth/register`

Registra um novo usuário.

**Body:**
```json
{
  "name": "João",
  "last_name": "Silva",
  "email": "joao@email.com",
  "senha": "SenhaForte123",
  "date_of_birth": "1990-01-15"  // Opcional
}
```

**Validações:**
- name: mínimo 2 caracteres, máximo 100
- last_name: mínimo 2 caracteres, máximo 100
- Email: formato válido
- Senha: mínimo 8 caracteres, deve conter maiúscula, minúscula e número
- date_of_birth: formato de data válido (YYYY-MM-DD) - opcional

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Usuário cadastrado com sucesso",
  "data": {
    "user_id": 1,
    "name": "João",
    "last_name": "Silva",
    "email": "joao@email.com"
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

### 4. Obter Dados do Usuário Autenticado

**GET** `/auth/me`

Retorna os dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
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

**Resposta de Erro (401):**
```json
{
  "success": false,
  "message": "Token não fornecido"
}
```

---

### 5. Verificar Email

**POST** `/auth/check-email`

Verifica se um email já está cadastrado.

**Body:**
```json
{
  "email": "usuario@email.com"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "exists": true
}
```

---

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação.

### Como usar:

1. **Fazer login** no endpoint `/auth/login`
2. **Receber o token** na resposta
3. **Enviar o token** em todas as requisições protegidas no header:
   ```
   Authorization: Bearer <seu-token-aqui>
   ```

### Exemplo com cURL:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@email.com","senha":"SenhaForte123"}'

# Usar o token
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Exemplo com JavaScript (Fetch):

```javascript
// Login
const login = async () => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'usuario@email.com',
      senha: 'SenhaForte123',
    }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Salvar o token (localStorage, cookie, etc)
    localStorage.setItem('token', data.data.token);
  }
};

// Usar o token
const getMe = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  console.log(data);
};
```

---

## Códigos de Status HTTP

- `200` - OK (sucesso)
- `201` - Created (recurso criado)
- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (não autenticado)
- `404` - Not Found (recurso não encontrado)
- `500` - Internal Server Error (erro no servidor)

---

## Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env`:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados
DB_HOST=localhost
DB_PORT=5340
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=sistema_auth

# JWT
JWT_SECRET=sua-chave-secreta-super-segura-aqui
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*
```

---

## Exemplos de Teste

### Teste completo de fluxo:

```bash
# 1. Registrar um novo usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João",
    "last_name": "Silva",
    "email": "joao@email.com",
    "senha": "SenhaForte123",
    "date_of_birth": "1990-01-15"
  }'

# 2. Fazer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "senha": "SenhaForte123"
  }'

# 3. Usar o token retornado para acessar rota protegida
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

