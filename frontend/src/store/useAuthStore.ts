'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, UserProfile } from '../lib/api';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  hydrated: boolean;
  setAuth: (token: string, user: UserProfile) => void;
  updateUserPoints: (loyaltyPoints: number) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  setHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hydrated: false,
      setAuth: (token, user) =>
        set({
          token,
          user: {
            ...user,
            loyaltyPoints: user.role === 'ADMIN' ? 0 : user.loyaltyPoints,
          },
        }),
      updateUserPoints: (loyaltyPoints) =>
        set((state) =>
          state.user
            ? {
                user: {
                  ...state.user,
                  loyaltyPoints:
                    state.user.role === 'ADMIN' ? 0 : Math.max(0, loyaltyPoints),
                },
              }
            : {},
        ),
      logout: () => set({ token: null, user: null }),
      refreshProfile: async () => {
        const currentToken = get().token;
        if (!currentToken) return;
        try {
          const freshUser = await api.getMe(currentToken);
          set({
            user: {
              ...freshUser,
              loyaltyPoints:
                freshUser.role === 'ADMIN' ? 0 : freshUser.loyaltyPoints,
            },
          });
        } catch {
          set({ token: null, user: null });
        }
      },
      setHydrated: (val) => set({ hydrated: val }),
    }),
    {
      name: 'brewlite-auth-storage-v2',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
