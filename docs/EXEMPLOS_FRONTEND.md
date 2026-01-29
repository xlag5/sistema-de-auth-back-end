# 💻 Exemplos de Integração Frontend

Este documento mostra como integrar o CRUD de usuários no seu frontend (React, Vue, Angular, etc.).

---

## 🔧 Configuração Inicial

### 1. **Criar Cliente HTTP**

```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## 🔐 Autenticação

### **Login e Salvar Token**

```typescript
// services/auth.service.ts
import apiClient from '../api/client';

interface LoginData {
  email: string;
  senha: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    usuario: {
      user_id: number;
      name: string;
      last_name: string;
      email: string;
    };
  };
}

export const login = async (credentials: LoginData): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Salva o token no localStorage
    if (response.data.success && response.data.data?.token) {
      localStorage.setItem('authToken', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.usuario));
    }
    
    return response.data;
  } catch (error: any) {
    return error.response?.data || { success: false, message: 'Erro ao fazer login' };
  }
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};
```

---

## 👥 CRUD de Usuários

### **Service Completo**

```typescript
// services/user.service.ts
import apiClient from '../api/client';

// Tipos
interface User {
  user_id: number;
  name: string;
  last_name: string;
  email: string;
  date_of_birth?: string;
  active: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

interface UsersListResponse {
  success: boolean;
  data: User[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface UserOperationResponse {
  success: boolean;
  message: string;
  data?: User;
}

interface CreateUserData {
  name: string;
  last_name: string;
  email: string;
  senha: string;
  date_of_birth?: string;
  active?: boolean;
}

interface UpdateUserData {
  name?: string;
  last_name?: string;
  email?: string;
  date_of_birth?: string;
  active?: boolean;
}

interface UpdatePasswordData {
  senha_atual: string;
  senha_nova: string;
}

interface UserFilters {
  name?: string;
  email?: string;
  active?: boolean;
  page?: number;
  pageSize?: number;
}

// Service
class UserService {
  /**
   * Lista usuários com filtros e paginação
   */
  async listUsers(filters?: UserFilters): Promise<UsersListResponse> {
    try {
      const response = await apiClient.get<UsersListResponse>('/users', {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar usuários:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Busca um usuário por ID
   */
  async getUserById(id: number): Promise<User> {
    try {
      const response = await apiClient.get<{ success: boolean; data: User }>(`/users/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Erro ao buscar usuário:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Cria um novo usuário
   */
  async createUser(data: CreateUserData): Promise<UserOperationResponse> {
    try {
      const response = await apiClient.post<UserOperationResponse>('/users', data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Atualiza um usuário
   */
  async updateUser(id: number, data: UpdateUserData): Promise<UserOperationResponse> {
    try {
      const response = await apiClient.put<UserOperationResponse>(`/users/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Atualiza a senha de um usuário
   */
  async updatePassword(id: number, data: UpdatePasswordData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.patch<{ success: boolean; message: string }>(
        `/users/${id}/password`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Desativa um usuário (soft delete)
   */
  async deleteUser(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Reativa um usuário
   */
  async activateUser(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.patch<{ success: boolean; message: string }>(`/users/${id}/activate`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao reativar usuário:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Deleta permanentemente um usuário
   */
  async hardDeleteUser(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`/users/${id}/permanent`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao deletar usuário permanentemente:', error);
      throw error.response?.data || error;
    }
  }
}

export const userService = new UserService();
```

---

## ⚛️ Exemplos React

### **1. Hook Personalizado**

```typescript
// hooks/useUsers.ts
import { useState, useEffect } from 'react';
import { userService } from '../services/user.service';

export const useUsers = (filters?: any) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userService.listUsers(filters);
        setUsers(response.data);
        setPagination(response.pagination);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [JSON.stringify(filters)]);

  return { users, loading, error, pagination };
};
```

### **2. Componente de Lista**

```tsx
// components/UserList.tsx
import React, { useState } from 'react';
import { useUsers } from '../hooks/useUsers';

const UserList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  
  const { users, loading, error, pagination } = useUsers({ ...filters, page });

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h1>Lista de Usuários</h1>
      
      {/* Filtros */}
      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por nome..."
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <select onChange={(e) => setFilters({ ...filters, active: e.target.value })}>
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </div>

      {/* Lista */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.user_id}>
              <td>{user.user_id}</td>
              <td>{user.name} {user.last_name}</td>
              <td>{user.email}</td>
              <td>{user.active ? '✅ Ativo' : '❌ Inativo'}</td>
              <td>
                <button onClick={() => handleEdit(user.user_id)}>Editar</button>
                <button onClick={() => handleDelete(user.user_id)}>Desativar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginação */}
      {pagination && (
        <div className="pagination">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </button>
          <span>Página {pagination.page} de {pagination.totalPages}</span>
          <button 
            disabled={page === pagination.totalPages} 
            onClick={() => setPage(page + 1)}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );

  async function handleEdit(id: number) {
    // Implementar edição
  }

  async function handleDelete(id: number) {
    if (confirm('Deseja desativar este usuário?')) {
      try {
        await userService.deleteUser(id);
        // Recarregar lista
      } catch (error) {
        console.error(error);
      }
    }
  }
};

export default UserList;
```

### **3. Formulário de Criação**

```tsx
// components/CreateUserForm.tsx
import React, { useState } from 'react';
import { userService } from '../services/user.service';

const CreateUserForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '',
    senha: '',
    date_of_birth: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await userService.createUser(formData);
      
      if (result.success) {
        setMessage('✅ Usuário criado com sucesso!');
        // Limpar formulário
        setFormData({
          name: '',
          last_name: '',
          email: '',
          senha: '',
          date_of_birth: '',
        });
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Criar Novo Usuário</h2>
      
      {message && <div className="message">{message}</div>}

      <div>
        <label>Nome:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Sobrenome:</label>
        <input
          type="text"
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Senha:</label>
        <input
          type="password"
          value={formData.senha}
          onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
          required
          minLength={8}
        />
        <small>Mínimo 8 caracteres, com maiúscula, minúscula e número</small>
      </div>

      <div>
        <label>Data de Nascimento:</label>
        <input
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Criando...' : 'Criar Usuário'}
      </button>
    </form>
  );
};

export default CreateUserForm;
```

### **4. Formulário de Alteração de Senha**

```tsx
// components/ChangePasswordForm.tsx
import React, { useState } from 'react';
import { userService } from '../services/user.service';

interface Props {
  userId: number;
}

const ChangePasswordForm: React.FC<Props> = ({ userId }) => {
  const [passwords, setPasswords] = useState({
    senha_atual: '',
    senha_nova: '',
    confirmar_senha: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Validação
    if (passwords.senha_nova !== passwords.confirmar_senha) {
      setMessage('❌ As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const result = await userService.updatePassword(userId, {
        senha_atual: passwords.senha_atual,
        senha_nova: passwords.senha_nova,
      });

      if (result.success) {
        setMessage('✅ Senha alterada com sucesso!');
        setPasswords({ senha_atual: '', senha_nova: '', confirmar_senha: '' });
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ ${error.message || 'Erro ao alterar senha'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Alterar Senha</h2>

      {message && <div className="message">{message}</div>}

      <div>
        <label>Senha Atual:</label>
        <input
          type="password"
          value={passwords.senha_atual}
          onChange={(e) => setPasswords({ ...passwords, senha_atual: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Nova Senha:</label>
        <input
          type="password"
          value={passwords.senha_nova}
          onChange={(e) => setPasswords({ ...passwords, senha_nova: e.target.value })}
          required
          minLength={8}
        />
      </div>

      <div>
        <label>Confirmar Nova Senha:</label>
        <input
          type="password"
          value={passwords.confirmar_senha}
          onChange={(e) => setPasswords({ ...passwords, confirmar_senha: e.target.value })}
          required
          minLength={8}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Alterando...' : 'Alterar Senha'}
      </button>
    </form>
  );
};

export default ChangePasswordForm;
```

---

## 🎯 Exemplos de Uso Rápido

### **Listar Usuários**
```typescript
const response = await userService.listUsers({ page: 1, pageSize: 10 });
console.log(response.data); // Array de usuários
```

### **Criar Usuário**
```typescript
const result = await userService.createUser({
  name: 'João',
  last_name: 'Silva',
  email: 'joao@example.com',
  senha: 'Senha123',
});
```

### **Atualizar Usuário**
```typescript
await userService.updateUser(1, {
  name: 'João Pedro',
  active: true,
});
```

### **Alterar Senha**
```typescript
await userService.updatePassword(1, {
  senha_atual: 'Senha123',
  senha_nova: 'NovaSenha456',
});
```

### **Desativar Usuário**
```typescript
await userService.deleteUser(1);
```

### **Reativar Usuário**
```typescript
await userService.activateUser(1);
```

---

## 🚀 Pronto para Usar!

Copie esses exemplos e adapte ao seu projeto. Tudo está pronto para integração!

**Dica:** Adicione tratamento de erros e feedback visual para melhorar a experiência do usuário.

