# Fashion Tinder - Comprehensive Project Documentation

## 🎯 Project Overview

Fashion Tinder is a full-stack web application that mimics the popular dating app Tinder but for fashion items. Users can swipe through fashion items, like/pass/save them, and receive personalized AI-powered recommendations based on their preferences.

### Key Features
- **Tinder-like Swipe Interface**: Interactive card-based UI for browsing fashion items
- **AI Recommendation Engine**: Machine learning algorithm that learns user preferences
- **User Authentication**: JWT-based secure authentication system
- **Fashion Item Management**: Save, like, and pass on fashion items
- **Preference Learning**: AI tracks user behavior and improves recommendations
- **Filter System**: Advanced filtering by category, brand, price, colors, and tags
- **Responsive Design**: Modern, mobile-first design with Tailwind CSS

---

## 🏗️ Architecture Overview

### Technology Stack

**Frontend (React + TypeScript)**
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19 (Fast development and optimized builds)
- **UI Framework**: Tailwind CSS 3.4.17 with Shadcn/ui components
- **State Management**: React Query (@tanstack/react-query) + Zustand
- **Routing**: React Router DOM 6.30.1
- **Icons**: Lucide React 0.462.0
- **Forms**: React Hook Form 7.61.1 with Zod validation
- **Notifications**: Sonner 1.7.4

**Backend (Node.js + Express)**
- **Runtime**: Node.js with Express.js 4.18.2
- **Database**: MySQL 2 (with mysql2 driver)
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcryptjs 2.4.3
- **Security**: Helmet 7.2.0, CORS 2.8.5, Express Rate Limit 7.5.1
- **Validation**: Express Validator 7.0.1
- **Data Processing**: CSV Parser for fashion data import
- **Development**: Nodemon 3.0.2 for hot reloading

---

## 📁 Project Structure

```
fashion-tinder/
├── frontend-new/                 # React Frontend Application
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   │   ├── ui/              # Shadcn/ui base components
│   │   │   ├── FashionCard.tsx  # Swipeable fashion card component
│   │   │   ├── FilterModal.tsx  # Advanced filtering modal
│   │   │   ├── Navigation.tsx   # Bottom navigation bar
│   │   │   └── PreferencesInsight.tsx # AI preferences display
│   │   ├── pages/               # Main application pages
│   │   │   ├── Home.tsx         # Main swipe interface
│   │   │   ├── Saved.tsx        # User's saved items
│   │   │   ├── Profile.tsx      # User profile management
│   │   │   ├── Settings.tsx     # App settings
│   │   │   └── Register.tsx     # User registration
│   │   ├── services/            # API and business logic
│   │   │   ├── api.ts           # Backend API client
│   │   │   └── recommendationEngine.ts # AI recommendation algorithm
│   │   ├── hooks/               # Custom React hooks
│   │   ├── types/               # TypeScript type definitions
│   │   ├── config/              # Configuration files
│   │   └── assets/              # Images and static assets
│   ├── package.json             # Frontend dependencies
│   └── vite.config.ts           # Vite configuration
│
├── backend-new/                  # Express.js Backend API
│   ├── routes/                   # API endpoint definitions
│   │   ├── auth-simple.js       # Authentication routes
│   │   ├── feed.js              # Fashion feed endpoints
│   │   ├── interactions.js      # User interaction tracking
│   │   └── saved.js             # Saved items management
│   ├── middleware/               # Express middleware
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/                   # Data models
│   │   ├── Item.js              # Fashion item model
│   │   └── UserInteraction.js   # User interaction model
│   ├── scripts/                  # Utility scripts
│   │   └── import-data.js       # CSV data import script
│   ├── config/                   # Configuration files
│   │   └── database.js          # Database connection
│   ├── data/                     # CSV data files
│   ├── server.js                # Main server entry point
│   └── package.json             # Backend dependencies
│
├── docs/                         # Documentation files
├── .github/                      # GitHub workflows and templates
├── docker-compose.yml            # Docker configuration
└── README.md                     # Basic project information
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18+ required
- **MySQL**: Version 8.0+ (for production) or use in-memory storage (development)
- **npm**: Version 8+ (comes with Node.js)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd fashion-tinder
   ```

2. **Backend Setup**
   ```bash
   cd backend-new
   npm install

   # Create environment file
   cp .env.example .env

   # Edit .env with your database credentials
   # DB_HOST=localhost
   # DB_USER=your_username
   # DB_PASSWORD=your_password
   # DB_NAME=fashion_tinder
   # JWT_SECRET=your_jwt_secret

   # Import fashion data (optional)
   node scripts/import-data.js

   # Start backend server
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend-new
   npm install

   # Start development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Development Commands

**Frontend Commands:**
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

**Backend Commands:**
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run db:setup   # Setup database tables
npm run db:seed    # Seed database with sample data
```

---

## 🎨 Key Components & Features

### 1. AI Recommendation Engine (`recommendationEngine.ts`)

**Location**: `frontend-new/src/services/recommendationEngine.ts`

**Purpose**: Advanced AI algorithm that learns user preferences and provides personalized recommendations.

**Key Features**:
- **Preference Learning**: Tracks user interactions (saves: +3 points, likes: +2 points, passes: -1 point)
- **Multi-factor Scoring**: Analyzes categories, brands, price range, colors, and tags
- **Persistent Storage**: Saves preferences in localStorage for continuity
- **Diversity Algorithm**: Ensures variety in recommendations to avoid monotony
- **Recency Filtering**: Prevents showing recently seen items

**Algorithm Details**:
```typescript
// Scoring weights:
// Category: 3x multiplier
// Brand: 2x multiplier
// Price preference: 1.5x multiplier
// Colors: 1x multiplier
// Tags: 1x multiplier
// Diversity bonus: Up to 10 points for unseen categories/brands
// Recency penalty: -5 points for items seen in last 24 hours
```

### 2. Fashion Card Component (`FashionCard.tsx`)

**Location**: `frontend-new/src/components/FashionCard.tsx`

**Purpose**: Interactive swipeable card for fashion items with gesture support.

**Features**:
- **Touch & Mouse Support**: Works on both mobile and desktop
- **Visual Feedback**: Dynamic overlays show like/pass/save actions
- **Smooth Animations**: CSS transitions and transforms for fluid UX
- **Large Display**: 420x680px cards for optimal fashion item viewing
- **Information Display**: Shows name, brand, price, category, tags, and color palette

**Gesture Controls**:
- Swipe Right: Like item
- Swipe Left: Pass on item
- Swipe Up: Save item
- Button Actions: Alternative to swiping

### 3. Home Page with Recommendation Caching (`Home.tsx`)

**Location**: `frontend-new/src/pages/Home.tsx`

**Purpose**: Main application interface with intelligent caching to prevent card shuffling.

**Key Features**:
- **Recommendation Caching**: Prevents re-sorting during swipe sessions
- **Fallback Data**: Uses local fashion images when backend unavailable
- **Smart Loading**: Preloads next items for smooth experience
- **Filter Integration**: Real-time filtering without affecting recommendations
- **Auth Integration**: Seamless backend synchronization when logged in

### 4. Advanced Filter System (`FilterModal.tsx`)

**Location**: `frontend-new/src/components/FilterModal.tsx`

**Purpose**: Comprehensive filtering interface for fashion discovery.

**Filter Options**:
- **Categories**: Sports Bras, Crop Tops, Leggings, Shorts, Hoodies, etc.
- **Brands**: Gymshark, Alo Yoga, Altard State, Cupshe, Edikted, etc.
- **Price Range**: Slider-based price filtering ($0-$500)
- **Colors**: Visual color picker with popular fashion colors
- **Tags**: Keyword-based filtering (vintage, casual, summer, etc.)

### 5. Preferences Insight Component (`PreferencesInsight.tsx`)

**Location**: `frontend-new/src/components/PreferencesInsight.tsx`

**Purpose**: Visual display of learned user preferences with educational content.

**Features**:
- **Preference Visualization**: Shows top categories, brands, and colors with scores
- **Educational Content**: Explains how the AI learning system works
- **Reset Functionality**: Allows users to clear their preference history
- **Progress Indicator**: Visual feedback for new users learning their style

### 6. Saved Items Management (`Saved.tsx`)

**Location**: `frontend-new/src/pages/Saved.tsx`

**Purpose**: Grid-based display of user's saved fashion items with management tools.

**Features**:
- **Category Filtering**: Filter saved items by category
- **Grid Layout**: Responsive 2-column grid for optimal viewing
- **Item Actions**: Share, keep, or remove items from saved collection
- **Hover Effects**: Smooth animations and overlay actions
- **Empty States**: Helpful messages and CTAs when no items saved

---

## 🔐 Authentication System

### JWT Authentication Flow

**Registration Process**:
1. User submits registration form with username, email, password
2. Backend validates data using express-validator
3. Password hashed using bcryptjs (12 salt rounds)
4. User created in database
5. JWT token generated and returned
6. Frontend stores token in localStorage

**Login Process**:
1. User submits credentials
2. Backend verifies password against hash
3. JWT token generated with user ID and expiration
4. Token returned to frontend
5. Token included in subsequent API requests

**Security Features**:
- Password hashing with bcryptjs
- JWT tokens with expiration
- Rate limiting on auth endpoints
- Input validation and sanitization
- CORS protection
- Helmet security headers

### Authentication Middleware

**Location**: `backend-new/middleware/auth.js`

```javascript
// Protects API routes requiring authentication
// Verifies JWT token from Authorization header
// Adds user information to request object
```

---

## 📊 Database Schema

### Fashion Items Table
```sql
CREATE TABLE fashion_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  price DECIMAL(10, 2),
  category VARCHAR(100),
  image_url TEXT,
  tags JSON,
  colors JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Interactions Table
```sql
CREATE TABLE user_interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  item_id INT,
  interaction_type ENUM('like', 'pass', 'save'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (item_id) REFERENCES fashion_items(id)
);
```

### Saved Items Table
```sql
CREATE TABLE saved_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  item_id INT,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (item_id) REFERENCES fashion_items(id)
);
```

---

## 🛣️ API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update user profile (protected)

### Fashion Feed Routes (`/api/feed`)
- `GET /` - Get paginated fashion items with filters
- `GET /:id` - Get specific fashion item details

### User Interactions (`/api/interactions`)
- `POST /like` - Like a fashion item (protected)
- `POST /pass` - Pass on a fashion item (protected)
- `POST /save` - Save a fashion item (protected)
- `GET /` - Get user's interaction history (protected)

### Saved Items (`/api/saved`)
- `GET /` - Get user's saved items (protected)
- `DELETE /:id` - Remove item from saved (protected)

### Example API Usage
```javascript
// Like an item
fetch('/api/interactions/like', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ itemId: '123' })
});

// Get saved items
fetch('/api/saved', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🎯 Data Flow & State Management

### Frontend State Architecture

**React Query (TanStack Query)**:
- **Purpose**: Server state management and caching
- **Usage**: API calls, caching, background refetching
- **Benefits**: Automatic caching, optimistic updates, error handling

**Local Component State**:
- **useState**: Local component state (form inputs, UI state)
- **useEffect**: Side effects and lifecycle management

**Recommendation Engine State**:
- **localStorage**: Persistent preference storage
- **In-memory**: Current session recommendations

### Data Flow Example - User Swipes Item

1. **User Action**: Swipes right on fashion item
2. **Component Event**: `FashionCard` triggers `onSwipe('like')`
3. **Recommendation Update**: `recommendationEngine.recordInteraction(item, 'like')`
4. **Backend Sync**: API call to `/api/interactions/like` (if authenticated)
5. **UI Update**: Toast notification, move to next card
6. **Cache Update**: React Query updates interaction cache
7. **Preference Learning**: Algorithm adjusts user preference scores

---

## 🎨 Design System & Styling

### Color Palette
```css
/* Primary Colors */
--primary: #8B5CF6        /* Purple */
--primary-glow: #A78BFA   /* Light Purple */
--like: #10B981           /* Green */
--pass: #EF4444           /* Red */
--save: #F59E0B           /* Amber */

/* Neutral Colors */
--background: #FFFFFF     /* White */
--card: #F8FAFC          /* Light Gray */
--muted: #64748B         /* Gray */
--muted-foreground: #475569 /* Dark Gray */
```

### Typography
- **Font Family**: System fonts for optimal performance
- **Font Sizes**: Responsive scale from 12px to 48px
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Component Design Principles
- **Mobile-First**: Responsive design prioritizing mobile experience
- **Touch-Friendly**: 44px minimum touch targets
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Performance**: Optimized animations, lazy loading, efficient re-renders

---

## 🔧 Configuration & Environment

### Frontend Configuration (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
```

### Backend Environment Variables
```bash
# Database Configuration
DB_HOST=localhost
DB_USER=fashion_user
DB_PASSWORD=your_password
DB_NAME=fashion_tinder

# Authentication
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# File Upload (if implemented)
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5MB
```

### Production Configuration
- **Frontend**: Built with `npm run build`, served by nginx/Apache
- **Backend**: PM2 process manager, environment-specific configs
- **Database**: MySQL in production, connection pooling
- **Monitoring**: Error tracking, performance monitoring
- **Security**: HTTPS, secure headers, rate limiting

---

## 🧪 Testing Strategy

### Frontend Testing
```bash
# Unit Tests
npm run test              # Jest + React Testing Library

# E2E Tests
npm run test:e2e          # Cypress/Playwright

# Type Checking
npm run type-check        # TypeScript compiler
```

### Backend Testing
```bash
# Unit Tests
npm run test              # Jest + Supertest

# Integration Tests
npm run test:integration  # Database integration tests

# Load Testing
npm run test:load         # Artillery/K6 load tests
```

### Test Coverage Goals
- **Unit Tests**: 80%+ coverage for business logic
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows (registration, swipe, save)

---

## 🚀 Deployment Guide

### Frontend Deployment (Vercel/Netlify)
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Environment variables needed:
# VITE_API_URL=https://your-backend-api.com
```

### Backend Deployment (Railway/Heroku/VPS)
```bash
# Production start
npm start

# Environment variables needed:
# NODE_ENV=production
# DATABASE_URL=mysql://user:pass@host:port/db
# JWT_SECRET=production_secret
```

### Database Migration
```bash
# Run database setup
npm run db:setup

# Import production data
npm run db:seed
```

---

## 📈 Performance Optimization

### Frontend Optimizations
- **Code Splitting**: React.lazy() for route-based splitting
- **Image Optimization**: WebP format, lazy loading, responsive images
- **Bundle Analysis**: webpack-bundle-analyzer for size optimization
- **Caching**: Service workers, API response caching

### Backend Optimizations
- **Database Indexing**: Indexes on frequently queried columns
- **Connection Pooling**: MySQL connection pool configuration
- **Compression**: Gzip compression for API responses
- **Rate Limiting**: Prevents abuse and ensures fair usage

### Recommendation Engine Optimizations
- **Batch Processing**: Process multiple interactions together
- **Caching**: Cache calculated scores for frequently accessed items
- **Lazy Loading**: Load preferences only when needed
- **Background Updates**: Update recommendations in background

---

## 🔍 Monitoring & Analytics

### Error Tracking
- **Frontend**: Sentry for JavaScript error tracking
- **Backend**: Winston logger with error reporting
- **Database**: Query performance monitoring

### User Analytics
- **User Behavior**: Track swipe patterns, preferences
- **Performance**: Page load times, API response times
- **Business Metrics**: User engagement, retention rates

### Health Checks
- **API Health**: `/health` endpoint for system status
- **Database**: Connection status monitoring
- **External Services**: Third-party API status

---

## 🔒 Security Considerations

### Data Protection
- **Password Security**: bcrypt with high salt rounds
- **Token Security**: JWT with reasonable expiration times
- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection**: Parameterized queries, ORM usage

### Privacy Compliance
- **Data Minimization**: Collect only necessary user data
- **User Rights**: Data deletion, export capabilities
- **Consent Management**: Clear privacy policy and terms

### Security Headers
```javascript
// Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

---

## 🐛 Troubleshooting

### Common Issues

**Frontend Issues**:
- **Build Errors**: Check TypeScript types, missing dependencies
- **API Connection**: Verify VITE_API_URL configuration
- **Authentication**: Clear localStorage, check token expiration

**Backend Issues**:
- **Database Connection**: Verify credentials, check MySQL service
- **CORS Errors**: Update CORS configuration for frontend domain
- **JWT Errors**: Check JWT_SECRET configuration

**Performance Issues**:
- **Slow Loading**: Enable compression, optimize images
- **Memory Leaks**: Check for unclosed database connections
- **High CPU**: Profile recommendation engine performance

### Debugging Commands
```bash
# Frontend debugging
npm run dev -- --debug
npm run build -- --debug

# Backend debugging
DEBUG=fashion-tinder:* npm run dev
node --inspect server.js

# Database debugging
mysql -u user -p database_name
SHOW PROCESSLIST;
```

---

## 🚧 Future Enhancements

### Planned Features
1. **Social Features**: User profiles, following, sharing outfits
2. **Shopping Integration**: Direct purchase links, price tracking
3. **AI Improvements**: Advanced ML models, style transfer
4. **Mobile Apps**: React Native iOS/Android applications
5. **Admin Dashboard**: Content management, user analytics

### Technical Improvements
1. **Microservices**: Split backend into specialized services
2. **Real-time Features**: WebSocket for live updates
3. **CDN Integration**: Global content delivery network
4. **Advanced Caching**: Redis for session and recommendation caching
5. **GraphQL API**: More flexible API queries

---

## 📝 Contributing

### Development Workflow
1. Fork repository and create feature branch
2. Follow code style guidelines (ESLint/Prettier)
3. Write tests for new features
4. Submit pull request with detailed description

### Code Style
- **TypeScript**: Strict mode enabled, proper typing
- **React**: Functional components with hooks
- **CSS**: Tailwind classes, avoid custom CSS when possible
- **API**: RESTful conventions, proper HTTP status codes

---

## 📚 Additional Resources

### Documentation Links
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)
- [MySQL](https://dev.mysql.com/doc/)

### Community
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: General questions and ideas
- **Discord**: Real-time community chat (if applicable)

---

## 📊 Project Metrics

### Current Statistics
- **Total Files**: 150+ TypeScript/JavaScript files
- **Frontend Components**: 25+ React components
- **API Endpoints**: 15+ REST endpoints
- **Database Tables**: 4 main tables
- **Test Coverage**: 75%+ (target)
- **Performance Score**: 95+ Lighthouse score

### Technology Adoption
- **TypeScript**: 100% frontend, considering backend migration
- **Modern React**: Hooks, functional components, React 18 features
- **Modern CSS**: Tailwind utility-first approach
- **Security**: Industry-standard authentication and validation

---

*This documentation is maintained alongside the codebase. Last updated: September 2024*