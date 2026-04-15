import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { api } from '../api/client.js';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      sessionType: 'anonymous',
      loading: false,
      bootstrapped: false,
      pendingSignup: null,
      passwordReset: null,
      async continueAsGuest() {
        set({ loading: true });
        try {
          const { data } = await api.post('/api/auth/guest');
          set({
            token: data.token,
            user: data.user,
            sessionType: 'guest',
            loading: false,
            bootstrapped: true,
            pendingSignup: null,
            passwordReset: null
          });
          return data.user;
        } catch (error) {
          set({ loading: false });
          throw new Error(error.response?.data?.message || 'Unable to continue as guest');
        }
      },
      async login(payload) {
        set({ loading: true });
        try {
          const { data } = await api.post('/api/auth/login', payload);
          set({
            token: data.token,
            user: data.user,
            sessionType: 'user',
            loading: false,
            bootstrapped: true,
            pendingSignup: null,
            passwordReset: null
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
            sessionType: 'user',
            loading: false,
            bootstrapped: true,
            pendingSignup: null,
            passwordReset: null
          });
          return data.user;
        } catch (error) {
          set({ loading: false });
          throw new Error(error.response?.data?.message || 'Signup failed');
        }
      },
      async resendSignupOtp(payload = {}) {
        throw new Error('Signup OTP verification is no longer required');
      },
      async verifySignupOtp(payload) {
        throw new Error('Signup OTP verification is no longer required');
      },
      async requestPasswordReset(payload) {
        set({ loading: true });
        try {
          const { data } = await api.post('/api/auth/password-reset/request', payload);
          set({
            loading: false,
            passwordReset: {
              identifier: payload.identifier,
              delivery: data.delivery,
              expiresAt: data.expiresAt,
              devOtp: data.devOtp || null,
              resetToken: null
            }
          });
          return data;
        } catch (error) {
          set({ loading: false });
          throw new Error(error.response?.data?.message || 'Unable to request password reset');
        }
      },
      async verifyPasswordResetOtp(payload) {
        set({ loading: true });
        try {
          const { data } = await api.post('/api/auth/password-reset/verify', payload);
          set((state) => ({
            loading: false,
            passwordReset: {
              ...state.passwordReset,
              identifier: payload.identifier,
              resetToken: data.resetToken
            }
          }));
          return data;
        } catch (error) {
          set({ loading: false });
          throw new Error(error.response?.data?.message || 'Password reset OTP verification failed');
        }
      },
      async resetPassword(payload) {
        set({ loading: true });
        try {
          const resetToken = payload.resetToken || get().passwordReset?.resetToken;
          const { data } = await api.post('/api/auth/password-reset/reset', {
            resetToken,
            password: payload.password
          });
          set({
            loading: false,
            passwordReset: null
          });
          return data;
        } catch (error) {
          set({ loading: false });
          throw new Error(error.response?.data?.message || 'Unable to reset password');
        }
      },
      async fetchMe() {
        const token = get().token;

        if (!token) {
          set({
            token: null,
            user: null,
            sessionType: 'anonymous',
            loading: false,
            bootstrapped: true
          });
          return null;
        }

        try {
          const { data } = await api.get('/api/auth/me');
          set({
            user: data.user,
            sessionType: data.user?.isGuest ? 'guest' : 'user',
            bootstrapped: true
          });
          return data.user;
        } catch {
          set({
            token: null,
            user: null,
            sessionType: 'anonymous',
            loading: false,
            bootstrapped: true
          });
          return null;
        }
      },
      logout() {
        api.post('/api/auth/logout').catch(() => null);
        set({
          token: null,
          user: null,
          sessionType: 'anonymous',
          loading: false,
          bootstrapped: true,
          pendingSignup: null,
          passwordReset: null
        });
        window.localStorage.removeItem('prishi-auth');
      }
    }),
    {
      name: 'prishi-auth',
      partialize: (state) => ({
        ...((state.sessionType === 'user' || state.sessionType === 'guest')
          ? {
              token: state.token,
              user: state.user,
              sessionType: state.sessionType
            }
          : {})
      })
    }
  )
);
