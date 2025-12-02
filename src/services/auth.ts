import { api } from './api';
import type { User, LoginCredentials, RegisterCredentials } from '../types/user';

export const authService = {
  login: (credentials: LoginCredentials) => 
    api.post<{ user: User; token: string }>('/auth/login', credentials),
  
  register: (credentials: RegisterCredentials) => 
    api.post<{ user: User; token: string }>('/auth/register', credentials),
  
  logout: () => api.post<void>('/auth/logout'),
  
  me: () => api.get<User>('/auth/me'),
};