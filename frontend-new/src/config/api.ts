export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',
  VERIFY: '/auth/verify',
  LOGOUT: '/auth/logout',
  
  // Items
  FEED: '/items/feed',
  ITEM_DETAILS: '/items',
  RECOMMENDATIONS: '/items/recommendations',
  CATEGORIES: '/items/categories',
  BRANDS: '/items/brands',

  // Interactions
  LIKE: '/items/like',
  PASS: '/items/pass',
  SAVE: '/items/save',
  MY_LIKES: '/items/liked',
  MY_SAVES: '/items/saved',
  
  // Users (using auth/me for now)
  UPDATE_PROFILE: '/auth/me',
  
  // Friends (placeholder - not implemented yet)
  FRIENDS: '/friends',
  FRIEND_REQUEST: '/friends/request',
  ACCEPT_FRIEND: '/friends/accept',
  COMPATIBILITY: '/friends/compatibility',
  
  // Vote Sessions (placeholder - not implemented yet)
  VOTE_SESSIONS: '/votes/sessions',
  JOIN_SESSION: '/votes/join',
  CAST_VOTE: '/votes/sessions',
  SESSION_RESULTS: '/votes/result',
  
  // Search (placeholder - not implemented yet)
  SEARCH: '/search/search',
} as const;