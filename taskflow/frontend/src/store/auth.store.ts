import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, User } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        const response = await authApi.login({ email, password });
        set({ 
          user: response.user, 
          isAuthenticated: true,
          isLoading: false 
        });
      },

      register: async (email: string, password: string, name?: string) => {
        await authApi.register({ email, password, name });
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({ user: null, isAuthenticated: false });
          // Clear localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      },

      checkAuth: () => {
        const accessToken = typeof window !== 'undefined' 
          ? localStorage.getItem('accessToken') 
          : null;
        
        const currentState = get();
        
        if (accessToken) {
          set({ 
            isAuthenticated: true, 
            isLoading: false,
            // Keep user data if it exists in persisted state
            user: currentState.user 
          });
        } else {
          set({ 
            isAuthenticated: false, 
            isLoading: false,
            user: null 
          });
        }
      },

      initializeAuth: () => {
        // This runs once on app startup
        const accessToken = typeof window !== 'undefined' 
          ? localStorage.getItem('accessToken') 
          : null;
        
        const currentState = get();
        
        if (accessToken && currentState.user) {
          set({ 
            isAuthenticated: true, 
            isLoading: false 
          });
        } else if (accessToken) {
          // Have token but no user data - still authenticated
          set({ 
            isAuthenticated: true, 
            isLoading: false 
          });
        } else {
          set({ 
            isAuthenticated: false, 
            isLoading: false,
            user: null 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
