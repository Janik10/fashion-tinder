export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  sizes?: string;
  createdAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  favoriteColors: string[];
  favoriteBrands: string[];
  preferredCategories: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  sizes: string[];
}

export interface FashionItem {
  id: string;
  name: string;
  brand: string;
  price: string | number;
  currency: string;
  images: string[];
  tags: string[];
  gender: string;
  season: string;
  category?: string;
  colors?: string[];
  description?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  preferences: UserPreferences;
}

export interface FeedResponse {
  items: FashionItem[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface Friend {
  id: string;
  username: string;
  email: string;
  friendshipId: string;
  status: 'PENDING' | 'ACCEPTED';
  compatibility?: {
    score: number;
    sharedLikes: number;
    totalInteractions: number;
  };
}

export interface VoteSession {
  id: string;
  code: string;
  creatorId: string;
  items: FashionItem[];
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  participants?: User[];
  votes?: Vote[];
}

export interface Vote {
  userId: string;
  username: string;
  votes: Record<string, number>; // itemId -> vote (1 for like, 0 for pass)
}

export interface VoteResults {
  results: Array<{
    item: FashionItem;
    likes: number;
    passes: number;
    percentage: number;
  }>;
  winner: FashionItem | null;
  participantCount: number;
}

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}