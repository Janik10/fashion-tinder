# Fashion Tinder Codebase Analysis (Updated)

> Last updated: September 19, 2025

## Product & MVP Scope

### Current Features

1. Authentication
   - Login/Register screens in `frontend/src/screens/auth/`
   - JWT-based auth implementation in `backend/src/modules/auth/`
   - Token persistence using SecureStore/localStorage

2. Item Discovery & Interaction
   - Home screen with Tinder-style swiping UI (`frontend/src/screens/home/HomeScreen.tsx`)
   - Like/Pass/Save actions implemented in `frontend/src/store/items.ts`
   - Interactions tracking in `backend/src/modules/interactions/`

3. Saved Items
   - SavedItemsScreen in `frontend/src/screens/saved/`
   - Backend support in `backend/src/modules/items/`

4. Friends System
   - Friends screen (`frontend/src/screens/friends/FriendsScreen.tsx`)
   - Backend implementation in `backend/src/modules/friends/`

5. Vote Sessions
   - Vote-related screens in `frontend/src/screens/votes/`
   - Backend support in `backend/src/modules/votes/`

6. Search Functionality
   - Search module in `backend/src/modules/search/`
   - (Frontend implementation not found - likely pending)

7. Profile Management
   - ProfileScreen in `frontend/src/screens/profile/`
   - User management in `backend/src/modules/users/`

## Tech Stack & Architecture

### Backend (NestJS + Prisma)
- Language: TypeScript
- Framework: NestJS
- ORM: Prisma
- Database: PostgreSQL

### Frontend (React Native + Expo)
- Language: TypeScript
- Framework: React Native (Expo)
- State Management: Zustand
- Navigation: React Navigation
- Animations: react-native-reanimated, react-native-gesture-handler

### Architecture Diagram
```
Client (React Native)
    ↓ HTTP/JWT
Backend (NestJS)
    ↓ Prisma Client
PostgreSQL Database
    ↓
External Services (planned: S3/CloudFront for images)
```

## Dependency Analysis

### Backend Dependencies (from package.json)
- @nestjs/common, @nestjs/core: NestJS framework core
- @prisma/client: Database ORM
- @nestjs/jwt, @nestjs/passport: Authentication
- class-validator, class-transformer: DTO validation
- bcrypt: Password hashing

### Frontend Dependencies
- expo: React Native framework
- @react-navigation/native, @react-navigation/stack: Navigation
- zustand: State management
- react-native-reanimated, react-native-gesture-handler: Animations
- @expo/vector-icons: UI icons
- expo-secure-store: Token storage

### Configuration Files
- Backend:
  - `backend/tsconfig.json`: TypeScript configuration
  - `backend/eslint.config.mjs`: ESLint rules
  - `backend/nest-cli.json`: NestJS configuration
  
- Frontend:
  - `frontend/tsconfig.json`: TypeScript configuration
  - `frontend/babel.config.js`: Babel configuration (includes reanimated plugin)

- Docker:
  - `docker-compose.yml`: Defines services (backend, frontend, postgres)
  - `backend/Dockerfile`, `frontend/Dockerfile`: Container configurations

## File-by-file Map

### Backend Core Files

| Path | Language | Responsibility | Key Exports |
|------|----------|---------------|-------------|
| `backend/src/main.ts` | TypeScript | App bootstrap | - |
| `backend/src/app.module.ts` | TypeScript | Root module | AppModule |
| `backend/prisma/schema.prisma` | Prisma | Data model | DB schema |

### Backend Modules

| Path | Language | Responsibility | Key Exports |
|------|----------|---------------|-------------|
| `modules/auth/` | TypeScript | Authentication | AuthController, AuthService |
| `modules/users/` | TypeScript | User management | UsersController, UsersService |
| `modules/items/` | TypeScript | Item CRUD | ItemsController, ItemsService |
| `modules/interactions/` | TypeScript | Swipe actions | InteractionsController |
| `modules/friends/` | TypeScript | Friend system | FriendsController |
| `modules/votes/` | TypeScript | Vote sessions | VotesController |
| `modules/search/` | TypeScript | Search functionality | SearchController |
| `modules/prisma/` | TypeScript | Database service | PrismaService |

### Frontend Core Files

| Path | Language | Responsibility | Key Exports |
|------|----------|---------------|-------------|
| `frontend/App.tsx` | TypeScript | App entry | App |
| `frontend/src/navigation/index.tsx` | TypeScript | Navigation setup | Navigation |
| `frontend/src/config.ts` | TypeScript | App config | API_URL |

### Frontend Screens

| Path | Language | Responsibility | Key Exports |
|------|----------|---------------|-------------|
| `screens/auth/LoginScreen.tsx` | TypeScript | Login UI | LoginScreen |
| `screens/auth/RegisterScreen.tsx` | TypeScript | Registration | RegisterScreen |
| `screens/home/HomeScreen.tsx` | TypeScript | Swipe interface | HomeScreen |
| `screens/saved/SavedItemsScreen.tsx` | TypeScript | Saved items | SavedItemsScreen |
| `screens/profile/ProfileScreen.tsx` | TypeScript | User profile | ProfileScreen |
| `screens/votes/VoteSessionsScreen.tsx` | TypeScript | Vote listing | VoteSessionsScreen |

### Frontend State Management

| Path | Language | Responsibility | Key Exports |
|------|----------|---------------|-------------|
| `store/auth.ts` | TypeScript | Auth state | useAuthStore |
| `store/items.ts` | TypeScript | Items/swipes | useItemStore |
| `store/votes.ts` | TypeScript | Vote state | useVoteStore |

## API Surface

### Auth Controller
- POST /auth/register: User registration
- POST /auth/login: User authentication
- GET /auth/me: Get current user

### Items Controller
- GET /items: List items
- GET /items/:id: Get item details
- POST /items/:id/save: Save item

### Interactions Controller
- POST /interactions/like/:id: Like item
- POST /interactions/pass/:id: Pass item
- POST /interactions/save/:id: Save item

### Friends Controller
- GET /friends: List friends
- POST /friends/add: Add friend
- DELETE /friends/:id: Remove friend

### Votes Controller
- GET /votes/sessions: List vote sessions
- POST /votes/sessions: Create session
- POST /votes/sessions/:id/vote: Cast vote

## Data Model

Key entities from `prisma/schema.prisma`:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  profile   Profile?
  friends   Friend[]
  votes     Vote[]
}

model Item {
  id       String   @id @default(uuid())
  name     String
  brand    String
  price    Decimal
  currency String
  images   String[]
  tags     String[]
}

model Interaction {
  id     String @id @default(uuid())
  userId String
  itemId String
  type   String // LIKE, PASS, SAVE
}

model Vote {
  id        String   @id @default(uuid())
  sessionId String
  userId    String
  itemId    String
  value     Boolean
}
```

## Quality & Tests

### Testing Status
- Backend: Basic e2e test setup (`test/app.e2e-spec.ts`)
- Frontend: No tests found
- Coverage: Limited

### Linting/Type Checking
- ESLint configured for both backend and frontend
- TypeScript strict mode enabled
- Prettier formatting (inferred from .prettierrc presence)

## Gaps & Risks

### Technical Gaps
1. Missing rate limiting
2. No Redis caching
3. Limited error handling
4. Missing pagination in list endpoints
5. No image upload implementation
6. Limited test coverage

### Security Concerns
1. JWT secret needs proper rotation/management
2. Missing request validation in some endpoints
3. No CSRF protection

### Performance Risks
1. No query optimization for friend lists
2. Missing indexes on frequently queried fields
3. Potential N+1 queries in votes/friends

### Frontend Improvements Needed
1. Better error handling in forms
2. Loading states for API calls
3. Offline support
4. Image caching/optimization
5. Swipe animation performance optimization

### Infrastructure Needs
1. S3/CloudFront setup for images
2. Proper CI/CD pipeline
3. Environment management
4. Monitoring/logging

## Dependencies Analysis Update

Notable dependencies added/configured:
- Frontend:
  - react-native-reanimated@3.3.0 (configured in babel.config.js)
  - react-native-gesture-handler@2.12.0
  - @react-navigation/native-stack@6.11.0
  - axios@1.6.2 for API calls
  - expo-secure-store@12.3.1 for token storage

- Backend:
  - compression@1.7.4 for response compression
  - helmet@7.0.0 for security headers
  - ioredis@5.3.2 for Redis integration (planned)
  - @types/bcryptjs for TypeScript support

## Recent Updates & Improvements

1. Swipe Experience
   - Implemented stack of cards with smooth animations
   - Added velocity-based swipe detection
   - Improved error handling and loading states
   - Local state management for offline support

2. Authentication
   - Added token persistence
   - Improved error handling
   - Web-compatible storage abstraction

3. Performance
   - Configured response compression
   - Added security headers
   - Prepared for Redis integration

## Critical Next Steps (Prioritized)

1. Infrastructure & Security
   - ✓ Implement compression and security headers
   - → Add rate limiting with Redis
   - → Set up S3 bucket for image storage
   - → Add monitoring and error tracking

2. Performance & Scale
   - ✓ Basic query optimization
   - → Add critical indexes (Item.tags, Interaction.createdAt)
   - → Implement Redis caching
   - → Add pagination to list endpoints

3. Features & Polish
   - ✓ Enhanced swipe animations
   - → Complete image upload flow
   - → Implement offline support
   - → Add analytics tracking

4. Quality & Testing
   - → Add E2E tests for critical flows
   - → Set up CI/CD pipeline
   - → Improve error handling
   - → Add performance monitoring

5. User Experience
   - ✓ Smooth card animations
   - → Add loading states
   - → Improve error messaging
   - → Implement retry mechanisms