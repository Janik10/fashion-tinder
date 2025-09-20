# Fashion Tinder

A Tinder-style fashion discovery app where users can swipe on clothing items, save favorites, create vote sessions with friends, and manage their style preferences.

## Features

- 👕 Swipe-based item discovery
- 💾 Save favorite items
- 👥 Friend system
- 🗳️ Create vote sessions with friends
- 🔍 Search and filter items
- 👤 User profiles and preferences

## Tech Stack

### Backend
- NestJS (TypeScript)
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Docker support

### Frontend
- React Native (Expo)
- TypeScript
- Zustand for state management
- React Navigation
- Reanimated + Gesture Handler for animations

## Project Structure

```
/
├─ backend/                 # NestJS API
│  ├─ src/
│  │  ├─ modules/          # Feature modules
│  │  │  ├─ auth/         # Authentication
│  │  │  ├─ users/        # User management
│  │  │  ├─ items/        # Item CRUD
│  │  │  ├─ interactions/ # Swipes/likes
│  │  │  ├─ friends/      # Friend system
│  │  │  ├─ votes/        # Vote sessions
│  │  │  ├─ search/       # Search functionality
│  │  │  └─ prisma/      # Database service
│  │  └─ main.ts         # App entry
│  ├─ prisma/
│  │  ├─ schema.prisma   # Database schema
│  │  └─ seed.ts        # Seed data
│  └─ Dockerfile
│
├─ frontend/               # React Native app
│  ├─ src/
│  │  ├─ screens/        # App screens
│  │  ├─ navigation/     # Navigation setup
│  │  ├─ components/     # Shared components
│  │  ├─ store/          # State management
│  │  └─ config.ts      # App config
│  └─ Dockerfile
│
├─ docker-compose.yml     # Docker services
└─ README.md
```

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Docker Desktop (optional)
- PostgreSQL 14+ (if not using Docker)
- Android Studio / Xcode (for mobile development)

## Environment Setup

1. Backend (.env)
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

2. Frontend (.env)
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your API URL
   # Use http://10.0.2.2:3000 for Android emulator
   ```

## Installation

### Without Docker

1. Backend
   ```bash
   cd backend
   npm install
   
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   
   # Optional: Seed database
   npx ts-node prisma/seed.ts
   
   # Start development server
   npm run start:dev
   ```

2. Frontend
   ```bash
   cd frontend
   npm install
   
   # Start Expo development server
   npm start
   
   # Run on specific platform
   npm run android
   # or
   npm run ios
   ```

### With Docker

```bash
# Start all services
docker compose up --build

# Run migrations (in another terminal)
docker compose exec backend npx prisma migrate dev --name init

# Optional: Seed database
docker compose exec backend npx ts-node prisma/seed.ts
```

## Available Scripts

### Backend

- `npm run start:dev`: Start development server
- `npm run build`: Build for production
- `npm run start:prod`: Start production server
- `npm run test`: Run unit tests
- `npm run test:e2e`: Run end-to-end tests
- `npm run lint`: Run ESLint

### Frontend

- `npm start`: Start Expo development server
- `npm run android`: Run on Android
- `npm run ios`: Run on iOS
- `npm run lint`: Run ESLint
- `npm run test`: Run tests

## API Routes

### Authentication
- POST /auth/register - Register new user
- POST /auth/login - User login
- GET /auth/me - Get current user

### Items
- GET /items - List items
- GET /items/:id - Get item details
- POST /items/:id/save - Save item

### Interactions
- POST /interactions/like/:id - Like item
- POST /interactions/pass/:id - Pass item
- POST /interactions/save/:id - Save item

### Friends
- GET /friends - List friends
- POST /friends/add - Add friend
- DELETE /friends/:id - Remove friend

### Votes
- GET /votes/sessions - List vote sessions
- POST /votes/sessions - Create session
- POST /votes/sessions/:id/vote - Cast vote

## Troubleshooting

### Swipe Gestures Not Working

1. Ensure root is wrapped with GestureHandlerRootView:
   ```tsx
   import { GestureHandlerRootView } from 'react-native-gesture-handler';

   export default function App() {
     return (
       <GestureHandlerRootView style={{ flex: 1 }}>
         <Navigation />
       </GestureHandlerRootView>
     );
   }
   ```

2. Check Reanimated setup:
   - Verify babel.config.js has the plugin:
     ```js
     module.exports = {
       plugins: ['react-native-reanimated/plugin'],
     };
     ```
   - Clear Metro cache: `npx expo start -c`

### Network Issues

- Check API_URL in frontend/.env
- For Android emulator, use `http://10.0.2.2:3000`
- For iOS simulator, use `http://localhost:3000`
- For physical device, use your machine's IP

### Database Issues

- Verify DATABASE_URL in backend/.env
- Ensure PostgreSQL is running
- Run migrations: `npx prisma migrate dev`
- Check Prisma Studio: `npx prisma studio`

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

### P0 (Critical)
- [ ] Polish swipe deck UX
- [ ] Add rate limiting
- [ ] Implement proper error handling
- [ ] Add critical indexes to database

### P1 (Important)
- [ ] Image upload and CDN integration
- [ ] Enhanced matching algorithm
- [ ] Chat functionality
- [ ] Style quiz and preferences

### P2 (Nice to have)
- [ ] Analytics integration
- [ ] Push notifications
- [ ] Content moderation
- [ ] Admin dashboard
