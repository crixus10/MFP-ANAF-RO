import create from 'zustand';
import api from '../api/client';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        set({ loading: true });
        const response = await api.get('/auth/verify');
        set({
          user: response.data.data.user,
          token,
          loading: false,
          error: null,
        });
      } catch (error) {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          loading: false,
          error: error.message,
        });
      }
    }
  },

  register: async (data) => {
    try {
      set({ loading: true });
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      set({
        user,
        token,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || error.message,
      });
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true });
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      set({
        user,
        token,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || error.message,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      error: null,
    });
  },

  updateProfile: async (data) => {
    try {
      set({ loading: true });
      const response = await api.put('/users/profile', data);
      set({
        user: response.data.data,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || error.message,
      });
      throw error;
    }
  },
}));

export default useAuthStore;
