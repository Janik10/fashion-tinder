import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  FeedResponse,
  FashionItem,
  User,
  Friend,
  VoteSession,
  VoteResults,
  ApiError,
} from '@/types';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.loadToken();
  }

  private loadToken() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: 'Network error',
        error: 'NetworkError',
        statusCode: response.status,
      }));
      throw new Error(errorData.message || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.accessToken);
    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.accessToken);
    return response;
  }

  async logout() {
    this.setToken(null);
  }

  // Items endpoints
  async getFeed(params: {
    limit?: number;
    offset?: string;
    category?: string;
    brand?: string;
  } = {}): Promise<FeedResponse> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset);
    if (params.category) searchParams.append('category', params.category);
    if (params.brand) searchParams.append('brand', params.brand);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.FEED}?${queryString}` : API_ENDPOINTS.FEED;

    return this.request<FeedResponse>(endpoint);
  }

  async getItem(id: string): Promise<FashionItem> {
    return this.request<FashionItem>(`${API_ENDPOINTS.ITEM_DETAILS}/${id}`);
  }

  // Interactions
  async likeItem(itemId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`${API_ENDPOINTS.LIKE}/${itemId}`, {
      method: 'POST',
    });
  }

  async passItem(itemId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`${API_ENDPOINTS.PASS}/${itemId}`, {
      method: 'POST',
    });
  }

  async saveItem(itemId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`${API_ENDPOINTS.SAVE}/${itemId}`, {
      method: 'POST',
    });
  }

  async getLikedItems(): Promise<{ items: Array<{ item: FashionItem; likedAt: string }> }> {
    return this.request<{ items: Array<{ item: FashionItem; likedAt: string }> }>(
      API_ENDPOINTS.MY_LIKES
    );
  }

  async getSavedItems(): Promise<{ items: Array<{ item: FashionItem; savedAt: string }> }> {
    return this.request<{ items: Array<{ item: FashionItem; savedAt: string }> }>(
      API_ENDPOINTS.MY_SAVES
    );
  }

  // User endpoints
  async getMe(): Promise<User> {
    return this.request<User>(API_ENDPOINTS.ME);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>(API_ENDPOINTS.UPDATE_PROFILE, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Friends endpoints
  async getFriends(): Promise<{ friends: Friend[] }> {
    return this.request<{ friends: Friend[] }>(API_ENDPOINTS.FRIENDS);
  }

  async sendFriendRequest(username: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(API_ENDPOINTS.FRIEND_REQUEST, {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async acceptFriendRequest(userId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`${API_ENDPOINTS.ACCEPT_FRIEND}/${userId}`, {
      method: 'POST',
    });
  }

  async getCompatibility(userId: string): Promise<{
    compatibility: {
      score: number;
      sharedLikes: number;
      details: {
        commonBrands: string[];
        commonCategories: string[];
        commonTags: string[];
      };
    };
  }> {
    return this.request(`${API_ENDPOINTS.COMPATIBILITY}/${userId}`);
  }

  // Vote sessions
  async getVoteSessions(): Promise<{ sessions: VoteSession[] }> {
    return this.request<{ sessions: VoteSession[] }>(API_ENDPOINTS.VOTE_SESSIONS);
  }

  async createVoteSession(itemIds?: string[]): Promise<{ session: VoteSession }> {
    return this.request<{ session: VoteSession }>(API_ENDPOINTS.VOTE_SESSIONS, {
      method: 'POST',
      body: JSON.stringify({ itemIds }),
    });
  }

  async getVoteSession(sessionId: string): Promise<{ session: VoteSession }> {
    return this.request<{ session: VoteSession }>(`${API_ENDPOINTS.VOTE_SESSIONS}/${sessionId}`);
  }

  async joinVoteSession(code: string): Promise<{ session: VoteSession }> {
    return this.request<{ session: VoteSession }>(API_ENDPOINTS.JOIN_SESSION, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async castVote(sessionId: string, itemId: string, vote: boolean): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `${API_ENDPOINTS.CAST_VOTE}/${sessionId}/vote`,
      {
        method: 'POST',
        body: JSON.stringify({ itemId, vote }),
      }
    );
  }

  async getVoteResults(sessionId: string): Promise<VoteResults> {
    return this.request<VoteResults>(`${API_ENDPOINTS.SESSION_RESULTS}/${sessionId}`);
  }

  // Search
  async search(query: string): Promise<{ items: FashionItem[] }> {
    const searchParams = new URLSearchParams({ query });
    return this.request<{ items: FashionItem[] }>(`${API_ENDPOINTS.SEARCH}?${searchParams}`);
  }
}

export const apiClient = new ApiClient();