export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  
  // Items
  FEED: '/feed',
  ITEM_DETAILS: '/items',
  
  // Interactions
  LIKE: '/like',
  PASS: '/pass',
  SAVE: '/save',
  MY_LIKES: '/me/likes',
  MY_SAVES: '/me/saves',
  
  // Users
  ME: '/users/me',
  UPDATE_PROFILE: '/users/me',
  
  // Friends
  FRIENDS: '/friends',
  FRIEND_REQUEST: '/friends/request',
  ACCEPT_FRIEND: '/friends/accept',
  COMPATIBILITY: '/friends/compatibility',
  
  // Vote Sessions
  VOTE_SESSIONS: '/votes/sessions',
  JOIN_SESSION: '/votes/join',
  CAST_VOTE: '/votes/sessions',
  SESSION_RESULTS: '/votes/result',
  
  // Search
  SEARCH: '/search/search',
} as const;