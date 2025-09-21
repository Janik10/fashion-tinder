import { create } from 'zustand';
import type { Item } from '../types/item';
import { useAuthStore } from './auth';
import { API_URL } from '../config';
import { StateCreator } from 'zustand';

interface ItemState {
  feed: Item[];
  savedItems: Item[];
  isLoading: boolean;
  error: string | null;
  loadFeed: (cursor?: string) => Promise<void>;
  loadSavedItems: () => Promise<void>;
  likeItem: (itemId: string) => Promise<void>;
  passItem: (itemId: string) => Promise<void>;
  saveItem: (itemId: string) => Promise<void>;
}

export const useItemStore = create<ItemState>((set: any, get: any) => ({
  feed: [],
  savedItems: [],
  isLoading: false,
  error: null,

  loadFeed: async (cursor?: string) => {
    try {
      set({ isLoading: true, error: null });
      const token = useAuthStore.getState().token;
      
      const params = new URLSearchParams();
      if (cursor) params.append('offset', cursor);
      params.append('limit', '20');
      
      const response = await fetch(`${API_URL}/feed?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      set({
        feed: cursor ? [...get().feed, ...data.items] : data.items,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load feed',
      });
      throw error;
    }
  },

  loadSavedItems: async () => {
    try {
      set({ isLoading: true, error: null });
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/me/saves`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      set({ savedItems: data.items || data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load saved items',
      });
      throw error;
    }
  },

  likeItem: async (itemId: string) => {
    try {
      set({ error: null });
      const token = useAuthStore.getState().token;
      
      const response = await fetch(`${API_URL}/like/${itemId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to like item');
      }

      // Remove the item from the feed
      const feed = get().feed;
      set({ feed: feed.filter(item => item.id !== itemId) });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to like item',
      });
    }
  },

  passItem: async (itemId: string) => {
    try {
      set({ error: null });
      const token = useAuthStore.getState().token;
      
      const response = await fetch(`${API_URL}/pass/${itemId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to pass item');
      }

      // Remove the item from the feed
      const feed = get().feed;
      set({ feed: feed.filter(item => item.id !== itemId) });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to pass item',
      });
    }
  },

  saveItem: async (itemId: string) => {
    try {
      set({ error: null });
      const token = useAuthStore.getState().token;
      
      const response = await fetch(`${API_URL}/save/${itemId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save item');
      }

      // Add to saved items locally
      const item = get().feed.find(item => item.id === itemId);
      if (item) {
        set({ savedItems: [...get().savedItems, item] });
      }
      
      // Remove the item from the feed
      const feed = get().feed;
      set({ feed: feed.filter(item => item.id !== itemId) });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save item',
      });
    }
  },
}));