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
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: false,
  setToken: (token: string | null) => set({ token }),
  login: async (email: string, password: string) => {
    try {
      // Temporary: Always succeed with test user
      const fakeToken = 'test-token-123';
      const fakeUser = {
        id: '1',
        email: email || 'test@example.com',
        username: 'testuser',
      };
      
      await storage.setItem('token', fakeToken);
      set({ token: fakeToken, user: fakeUser, isLoading: false });
      console.log('Login successful', { token: fakeToken, user: fakeUser });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  register: async (email: string, username: string, password: string) => {
    try {
      // Temporary: Always succeed with test user
      const fakeToken = 'test-token-123';
      const fakeUser = {
        id: '1',
        email: email || 'test@example.com',
        username: username || 'testuser',
      };
      
      await storage.setItem('token', fakeToken);
      set({ token: fakeToken, user: fakeUser, isLoading: false });
      console.log('Registration successful', { token: fakeToken, user: fakeUser });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  logout: async () => {
    await storage.removeItem('token');
    set({ token: null, user: null });
  },
}));