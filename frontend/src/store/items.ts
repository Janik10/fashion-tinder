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
      
      // Temporary: Return sample data instead of making API call
      const sampleItems = [
        {
          id: '1',
          name: 'Classic White Sneakers',
          brand: 'Nike',
          price: 99.99,
          currency: 'USD',
          images: ['https://placehold.co/400x600/png'],
          tags: ['shoes', 'casual', 'streetwear'],
          gender: 'unisex',
          season: 'all',
        },
        {
          id: '2',
          name: 'Denim Jacket',
          brand: 'Levi\'s',
          price: 129.99,
          currency: 'USD',
          images: ['https://placehold.co/400x600/png'],
          tags: ['outerwear', 'casual', 'denim'],
          gender: 'unisex',
          season: 'spring',
        },
        {
          id: '3',
          name: 'Summer Dress',
          brand: 'Zara',
          price: 79.99,
          currency: 'USD',
          images: ['https://placehold.co/400x600/png'],
          tags: ['dress', 'summer', 'casual'],
          gender: 'women',
          season: 'summer',
        },
      ];

      set({
        feed: cursor ? [...get().feed, ...sampleItems] : sampleItems,
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

      set({ savedItems: data, isLoading: false });
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
      // Remove the first item from the feed
      const feed = get().feed;
      set({ feed: feed.slice(1) });
      // In a real app, this would make an API call
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to like item',
      });
    }
  },

  passItem: async (itemId: string) => {
    try {
      set({ error: null });
      // Remove the first item from the feed
      const feed = get().feed;
      set({ feed: feed.slice(1) });
      // In a real app, this would make an API call
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to pass item',
      });
    }
  },

  saveItem: async (itemId: string) => {
    try {
      set({ error: null });
      // Add to saved items locally
      const item = get().feed.find(item => item.id === itemId);
      if (item) {
        set({ savedItems: [...get().savedItems, item] });
      }
      // In a real app, this would make an API call
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save item',
      });
    }
  },
}));