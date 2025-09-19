import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuthStore } from './auth';

export interface VoteSession {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  participants: {
    id: string;
    username: string;
    name: string;
  }[];
  items: {
    id: string;
    name: string;
    brand: string;
    price: number;
    currency: string;
    images: string[];
    tags: string[];
    gender: string | null;
    season: string | null;
  }[];
  status: 'active' | 'completed';
  creatorId: string;
  results?: {
    itemId: string;
    votes: number;
  }[];
}

interface Vote {
  itemId: string;
  vote: boolean;
}

interface VotesState {
  sessions: VoteSession[];
  currentSession: VoteSession | null;
  loading: boolean;
  error: string | null;
  votes: Record<string, Vote[]>; // sessionId -> votes[]
  loadSessions: () => Promise<void>;
  createSession: (name: string, description?: string) => Promise<VoteSession>;
  loadSession: (sessionId: string) => Promise<void>;
  submitVote: (sessionId: string, itemId: string, vote: boolean) => Promise<void>;
  clearError: () => void;
}

export const useVotesStore = create<VotesState>((set, get) => ({
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,
  votes: {},

  loadSessions: async () => {
    try {
      set({ loading: true, error: null });
      const { token } = useAuthStore.getState();
      const response = await axios.get(`${API_URL}/api/votes/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ sessions: response.data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load sessions',
        loading: false,
      });
    }
  },

  createSession: async (name: string, description?: string) => {
    try {
      set({ loading: true, error: null });
      const { token } = useAuthStore.getState();
      const response = await axios.post(
        `${API_URL}/api/votes/sessions`,
        {
          name,
          description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newSession = response.data;
      set((state) => ({
        sessions: [...state.sessions, newSession],
        loading: false,
      }));
      return newSession;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create session',
        loading: false,
      });
      throw error;
    }
  },

  loadSession: async (sessionId: string) => {
    try {
      set({ loading: true, error: null });
      const { token } = useAuthStore.getState();
      const response = await axios.get(
        `${API_URL}/api/votes/sessions/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      set({ currentSession: response.data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load session',
        loading: false,
      });
    }
  },

  submitVote: async (sessionId: string, itemId: string, vote: boolean) => {
    try {
      set({ loading: true, error: null });
      const { token } = useAuthStore.getState();
      await axios.post(
        `${API_URL}/api/votes/sessions/${sessionId}/vote`,
        {
          itemId,
          vote,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local votes state
      set((state) => ({
        votes: {
          ...state.votes,
          [sessionId]: [
            ...(state.votes[sessionId] || []),
            { itemId, vote },
          ],
        },
        loading: false,
      }));

      // Reload session to get updated results if needed
      const currentSession = get().currentSession;
      if (currentSession?.id === sessionId) {
        await get().loadSession(sessionId);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit vote',
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));