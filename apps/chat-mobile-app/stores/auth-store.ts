import { create } from 'zustand';
import type { UserResponse } from '@raweval/types';
import { getStoredToken, getStoredRefreshToken, storeToken, clearToken } from '@/lib/auth';
import { authService } from '@/services/auth-service';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  checkAuth: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserResponse | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    const token = await getStoredToken();
    if (!token) {
      set({ isAuthenticated: false, isLoading: false, user: null });
      return false;
    }
    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      // Try refresh before giving up
      const refreshToken = await getStoredRefreshToken();
      if (refreshToken) {
        try {
          const refreshed = await authService.refreshToken(refreshToken);
          await storeToken(refreshed.access_token, refreshed.refresh_token);
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch {
          // Refresh also failed
        }
      }
      await clearToken();
      set({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: err instanceof Error ? err.message : 'Session expired',
      });
      return false;
    }
  },

  login: async (email, password) => {
    set({ error: null });
    const response = await authService.login({ email, password });
    await storeToken(response.access_token, response.refresh_token);
    const user = await authService.getCurrentUser();
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const refreshToken = await getStoredRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore logout API errors
    }
    await clearToken();
    set({ user: null, isAuthenticated: false, error: null });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearError: () => set({ error: null }),
}));
