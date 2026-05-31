import { create } from 'zustand';

const storedToken = localStorage.getItem('access_token');
const storedUser  = localStorage.getItem('fleet_user');

export const useAuthStore = create((set) => ({
  token: storedToken || null,
  user:  storedUser ? JSON.parse(storedUser) : null,

  setAuth: (user, token) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('fleet_user', JSON.stringify(user));
    set({ user, token });
  },

  clearAuth: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('fleet_user');
    set({ user: null, token: null });
  },
}));
