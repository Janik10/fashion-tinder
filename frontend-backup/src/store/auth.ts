import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Helper function to handle token storage across platforms
const storage = {
  async setItem(key: string, value: string) {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.warn('Storage error:', error);
    }
  },
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('Storage error:', error);
      return null;
    }
  },
  async removeItem(key: string) {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.warn('Storage error:', error);
    }
  }
};
import { API_URL } from '../config';

interface AuthState {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: false,
  setToken: (token: string | null) => set({ token }),
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      await storage.setItem('token', data.accessToken);
      set({ token: data.accessToken, user: data.user, isLoading: false });
      console.log('Login successful', { user: data.user });
    } catch (error) {
      set({ isLoading: false });
      console.error('Login error:', error);
      throw error;
    }
  },
  register: async (email: string, username: string, password: string) => {
    try {
      set({ isLoading: true });
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          username, 
          password,
          preferences: {
            favoriteColors: [],
            favoriteBrands: [],
            preferredCategories: [],
            budgetRange: { min: 0, max: 1000 },
            sizes: []
          }
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      await storage.setItem('token', data.accessToken);
      set({ token: data.accessToken, user: data.user, isLoading: false });
      console.log('Registration successful', { user: data.user });
    } catch (error) {
      set({ isLoading: false });
      console.error('Registration error:', error);
      throw error;
    }
  },
  logout: async () => {
    await storage.removeItem('token');
    set({ token: null, user: null });
  },
  
  initializeAuth: async () => {
    try {
      const token = await storage.getItem('token');
      if (token) {
        // Verify token is valid by fetching user data
        const response = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const user = await response.json();
          set({ token, user });
        } else {
          // Token is invalid, remove it
          await storage.removeItem('token');
          set({ token: null, user: null });
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      await storage.removeItem('token');
      set({ token: null, user: null });
    }
  },
}));