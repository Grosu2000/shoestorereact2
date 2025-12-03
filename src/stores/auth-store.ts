// src/stores/auth-store.ts
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
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
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

      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register({ 
            email, 
            password, 
            name,
            confirmPassword: password 
          });
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
        set({ user: null, token: null });
      },

      checkAuth: async () => {
        try {
          const user = await authService.me();
          set({ user });
        } catch (error) {
          set({ user: null, token: null });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);