import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { api } from '../api/client.js';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      bootstrapped: false,
      async login(payload) {
        set({ loading: true });
        try {
          const { data } = await api.post('/api/auth/login', payload);
          set({
            token: data.token,
            user: data.user,
            loading: false,
            bootstrapped: true
          });
          return data.user;
        } catch (error) {
          set({ loading: false });
          throw new Error(error.response?.data?.message || 'Login failed');
        }
      },
      async signup(payload) {
        set({ loading: true });
        try {
          const { data } = await api.post('/api/auth/signup', payload);
          set({
            token: data.token,
            user: data.user,
            loading: false,
            bootstrapped: true
          });
          return data.user;
        } catch (error) {
          set({ loading: false });
          throw new Error(error.response?.data?.message || 'Signup failed');
        }
      },
      async fetchMe() {
        try {
          const { data } = await api.get('/api/auth/me');
          set({ user: data.user, bootstrapped: true });
          return data.user;
        } catch {
          set({
            token: null,
            user: null,
            loading: false,
            bootstrapped: true
          });
          return null;
        }
      },
      logout() {
        set({
          token: null,
          user: null,
          loading: false,
          bootstrapped: true
        });
        window.localStorage.removeItem('prishi-auth');
      }
    }),
    {
      name: 'prishi-auth',
      partialize: (state) => ({
        token: state.token
      })
    }
  )
);
