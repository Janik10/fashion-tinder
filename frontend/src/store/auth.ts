import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,
  login: async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await SecureStore.setItemAsync('token', data.accessToken);
      set({ token: data.accessToken, user: data.user });
    } catch (error) {
      throw error;
    }
  },
  register: async (email: string, username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Auto login after registration
      const loginResponse = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();
      if (!loginResponse.ok) throw new Error(loginData.message);

      await SecureStore.setItemAsync('token', loginData.accessToken);
      set({ token: loginData.accessToken, user: loginData.user });
    } catch (error) {
      throw error;
    }
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    set({ token: null, user: null });
  },
}));