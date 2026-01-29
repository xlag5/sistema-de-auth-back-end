# 🚀 Guia Rápido - CRUD de Usuários

## ✅ Implementação Concluída

Foi criado um sistema completo de CRUD de usuários com autenticação JWT. **Tudo está pronto para uso!**

---

## 📦 O que foi Criado

### Arquivos de Código:
1. ✅ `src/types/user.types.ts` - Tipos TypeScript
2. ✅ `src/validators/user.validator.ts` - Validação de dados
3. ✅ `src/services/user.service.ts` - Lógica de negócio
4. ✅ `src/controllers/user.controller.ts` - Controllers
5. ✅ `src/routes/user.routes.ts` - Rotas RESTful
6. ✅ `src/routes/index.ts` - Integração das rotas

### Arquivos de Documentação:
7. ✅ `docs/USERS_API.md` - Documentação completa da API
8. ✅ `docs/CRUD_USUARIOS_README.md` - Resumo da implementação
9. ✅ `test-users-api.http` - Exemplos de testes

---

## 🎯 8 Endpoints Criados

| # | Método | Endpoint | Descrição |
|---|--------|----------|-----------|
| 1 | GET | `/api/users` | Lista usuários (filtros + paginação) |
| 2 | GET | `/api/users/:id` | Busca usuário por ID |
| 3 | POST | `/api/users` | Cria novo usuário |
| 4 | PUT | `/api/users/:id` | Atualiza usuário |
| 5 | PATCH | `/api/users/:id/password` | Atualiza senha |
| 6 | PATCH | `/api/users/:id/activate` | Reativa usuário |
| 7 | DELETE | `/api/users/:id` | Desativa usuário (soft) |
| 8 | DELETE | `/api/users/:id/permanent` | Deleta permanentemente |

**🔒 Todas as rotas requerem autenticação JWT!**

---

## 🏃‍♂️ Como Usar (Passo a Passo)

### 1️⃣ **Iniciar o Servidor**

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Iniciar o servidor
npm run dev
```

O servidor estará rodando em: `http://localhost:3000`

---

### 2️⃣ **Fazer Login (Obter Token)**

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "seu@email.com",
  "senha": "SuaSenha123"
}
```

**Resposta:**
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
      "email": "seu@email.com"
    }
  }
}
```

**📋 Copie o token retornado!**

---

### 3️⃣ **Usar o CRUD de Usuários**

#### 📋 **Listar Usuários**
```http
GET http://localhost:3000/api/users
Authorization: Bearer SEU_TOKEN_AQUI
```

#### 👤 **Criar Usuário**
```http
POST http://localhost:3000/api/users
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "name": "Maria",
  "last_name": "Silva",
  "email": "maria@example.com",
  "senha": "Senha123",
  "date_of_birth": "1990-05-15"
}
```

#### 📝 **Atualizar Usuário**
```http
PUT http://localhost:3000/api/users/2
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "name": "Maria Santos",
  "active": true
}
```

#### 🔑 **Alterar Senha**
```http
PATCH http://localhost:3000/api/users/2/password
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "senha_atual": "Senha123",
  "senha_nova": "NovaSenha456"
}
```

#### 🗑️ **Desativar Usuário**
```http
DELETE http://localhost:3000/api/users/2
Authorization: Bearer SEU_TOKEN_AQUI
```

#### ♻️ **Reativar Usuário**
```http
PATCH http://localhost:3000/api/users/2/activate
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 🧪 Testar com Arquivo HTTP

### Opção 1: VS Code (REST Client)

1. Instale a extensão **REST Client**
2. Abra o arquivo `test-users-api.http`
3. Substitua o token na linha:
   ```
   @token = seu_token_jwt_aqui
   ```
4. Clique em **Send Request** em cada exemplo

### Opção 2: Postman/Insomnia

1. Importe as requisições do arquivo `test-users-api.http`
2. Configure o token no header `Authorization: Bearer TOKEN`
3. Execute as requisições

---

## 🎨 Recursos Disponíveis

### ✨ **Paginação**
```http
GET /api/users?page=1&pageSize=10
```

### 🔍 **Filtros**
```http
GET /api/users?name=João&email=gmail&active=true
```

### 📊 **Resposta com Paginação**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

## 🔐 Regras de Segurança

✅ **Validação de Senha:**
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número

✅ **Proteções:**
- Email único no sistema
- Usuário não pode deletar própria conta
- Usuário só pode alterar própria senha
- Senhas sempre em hash bcrypt
- Todas as rotas requerem autenticação

---

## 📚 Documentação Completa

Para mais detalhes, consulte:

- **API Completa:** `docs/USERS_API.md`
- **Resumo Implementação:** `docs/CRUD_USUARIOS_README.md`
- **Testes HTTP:** `test-users-api.http`

---

## ⚡ Exemplos Rápidos

### Buscar usuários ativos
```http
GET /api/users?active=true
Authorization: Bearer TOKEN
```

### Buscar por nome
```http
GET /api/users?name=Silva
Authorization: Bearer TOKEN
```

### Buscar por email
```http
GET /api/users?email=gmail
Authorization: Bearer TOKEN
```

### Criar usuário completo
```http
POST /api/users
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Carlos",
  "last_name": "Souza",
  "email": "carlos@example.com",
  "senha": "Senha123",
  "date_of_birth": "1985-10-20",
  "active": true
}
```

---

## 🎉 Tudo Pronto!

O CRUD de usuários está **100% funcional** e pronto para uso.

### Checklist:
- ✅ 8 endpoints RESTful criados
- ✅ Autenticação JWT integrada
- ✅ Validação de dados completa
- ✅ Paginação e filtros
- ✅ Soft delete implementado
- ✅ Documentação completa
- ✅ Exemplos de testes prontos
- ✅ Segurança implementada

---

## 💡 Dicas Finais

1. **Use soft delete** em vez de hard delete
2. **Implemente paginação** para listas grandes
3. **Combine filtros** para buscas específicas
4. **Valide dados** no frontend também
5. **Mantenha tokens seguros** e não os exponha

---

## 📞 Próximos Passos Sugeridos

- [ ] Implementar sistema de roles/permissões
- [ ] Adicionar logs de auditoria
- [ ] Implementar recuperação de senha
- [ ] Adicionar upload de foto de perfil
- [ ] Criar testes automatizados
- [ ] Implementar rate limiting

---

**🚀 Bom desenvolvimento!**

