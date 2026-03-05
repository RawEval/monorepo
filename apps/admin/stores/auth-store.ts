import { create } from 'zustand';
import { authService } from '@/services/auth-service';
import type { UserResponse } from '@/services/auth-service';
import { storeToken, clearToken } from '@/lib/auth';

interface AuthState {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  fetchUser: () => Promise<UserResponse | null>;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (user: UserResponse | null) => void;
}

const ADMIN_ROLES = ['admin', 'super_admin'];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = (await authService.getCurrentUser()) as UserResponse;
      const isAdmin = ADMIN_ROLES.includes(user.role);

      if (!isAdmin) {
        clearToken();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Access denied. Admin privileges required.',
        });
        return null;
      }

      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch {
      clearToken();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired. Please log in again.',
      });
      return null;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const tokenResponse = await authService.login({ email, password });

      storeToken(
        tokenResponse.access_token,
        tokenResponse.expires_in,
        tokenResponse.refresh_token
      );

      // Verify admin role
      const user = (await authService.getCurrentUser()) as UserResponse;
      const isAdmin = ADMIN_ROLES.includes(user.role);

      if (!isAdmin) {
        clearToken();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Access denied. Admin privileges required.',
        });
        return {
          success: false,
          error: 'Access denied. Admin privileges required.',
        };
      }

      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      return { success: false, error: message };
    }
  },

  logout: () => {
    clearToken();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },
}));
