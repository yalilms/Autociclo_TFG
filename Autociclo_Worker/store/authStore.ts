import { create } from 'zustand';
import { saveAuth, getUserData, clearAuth, UserData } from '@/lib/auth';

interface AuthState {
  user: UserData | null;
  isLoaded: boolean;
  login: (data: UserData) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoaded: false,

  login: async (data) => {
    await saveAuth(data);
    set({ user: data });
  },

  logout: async () => {
    await clearAuth();
    set({ user: null });
  },

  loadFromStorage: async () => {
    const user = await getUserData();
    set({ user, isLoaded: true });
  },
}));
