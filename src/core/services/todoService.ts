const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  category: 'personal' | 'work' | 'urgent';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignedTo?: string;
  category?: 'personal' | 'work' | 'urgent';
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignedTo?: string;
  category?: 'personal' | 'work' | 'urgent';
}

export interface TodoFilters {
  completed?: boolean;
  category?: string;
  limit?: number;
  page?: number;
}

export interface DashboardTodoFilters {
  page?: number;
}

class TodoService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getTodos(filters: TodoFilters = {}): Promise<{ data: Todo[]; total: number; page: number; limit: number; totalPages: number }> {
    const params = new URLSearchParams();
    
    if (filters.completed !== undefined) {
      params.append('completed', filters.completed.toString());
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters.page) {
      params.append('page', filters.page.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/todos?${params.toString()}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }

    return response.json();
  }

  async getDashboardTodos(filters: DashboardTodoFilters = {}): Promise<{ data: Todo[]; total: number; page: number; limit: number; totalPages: number }> {
    const params = new URLSearchParams();
    
    if (filters.page) {
      params.append('page', filters.page.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/todos/dashboard?${params.toString()}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard todos');
    }

    return response.json();
  }

  async getTodo(id: string): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch todo');
    }

    return response.json();
  }

  async createTodo(todoData: CreateTodoData): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/api/todos`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(todoData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create todo');
    }

    return response.json();
  }

  async updateTodo(id: string, todoData: UpdateTodoData): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(todoData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update todo');
    }

    return response.json();
  }

  async deleteTodo(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }
  }

  async toggleTodo(id: string): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/api/todos/${id}/toggle`, {
      method: 'PATCH',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to toggle todo');
    }

    return response.json();
  }
}

export default new TodoService();
