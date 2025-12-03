import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/user';
import { authService } from '../services/auth';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          // response = { user, token } після обробки в api.ts
          set({ 
            user: response.user, 
            token: response.token, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Помилка авторизації', 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register({
            email,
            password,
            name,
            confirmPassword: ''
          });
          // response = { user, token } після обробки в api.ts
          set({ 
            user: response.user, 
            token: response.token, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Помилка реєстрації', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        // Очищаємо токен на бекенді
        authService.logout().catch(() => {
          // Ігноруємо помилки при logout
        });
        
        // Очищаємо локальний стан
        set({ 
          user: null, 
          token: null,
          error: null 
        });
      },

      checkAuth: async () => {
        const { token } = get();
        
        // Якщо немає токена, не робимо запит
        if (!token) {
          set({ user: null });
          return;
        }
        
        try {
          const user = await authService.me();
          set({ user });
        } catch (error: any) {
          // Якщо помилка 401 - токен невалідний
          if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            set({ 
              user: null, 
              token: null,
              error: 'Сесія закінчилася. Будь ласка, увійдіть знову.' 
            });
          } else {
            console.error('Помилка перевірки авторизації:', error);
          }
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
);