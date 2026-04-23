import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, Usuario } from '../types'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      login: (token: string, usuario: Usuario) => set({ token, usuario }),
      logout: () => set({ token: null, usuario: null }),
    }),
    {
      name: 'autociclo-auth',
    }
  )
)
