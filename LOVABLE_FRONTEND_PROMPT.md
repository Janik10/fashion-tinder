# Fashion Tinder Frontend - Complete Development Prompt for Lovable

## Project Overview
Create a modern, gesture-based mobile fashion discovery app called "Fashion Tinder" using React Native (Expo). This app allows users to swipe through fashion items, save favorites, connect with friends, and participate in collaborative voting sessions to decide on purchases together.

## 🎯 Core Concept
A "Tinder for Fashion" where users:
- Swipe RIGHT to LIKE fashion items
- Swipe LEFT to PASS on items  
- Swipe UP to SAVE items for later
- Get personalized recommendations based on their preferences
- Connect with friends and see compatibility scores
- Create/join voting sessions to decide on purchases with friends

## 🏗️ Technical Architecture

### Platform & Framework
- **React Native with Expo SDK 49+**
- **TypeScript** for type safety
- **Expo Router** for navigation
- **React Query/TanStack Query** for API state management
- **AsyncStorage** for local data persistence
- **Expo Secure Store** for sensitive data (tokens)

### UI/UX Libraries
- **NativeWind** or **Tailwind CSS** for styling
- **React Native Reanimated 3** for smooth animations
- **React Native Gesture Handler** for swipe gestures
- **Expo Linear Gradient** for beautiful gradients
- **React Native SVG** for icons
- **React Native Safe Area Context** for safe area handling

### Backend Integration
- **Base URL**: `http://localhost:3000/api` (development)
- **Authentication**: JWT tokens via Bearer header
- **Content-Type**: `application/json`

## 📱 Screen Structure & Navigation

```
App
├── (auth)
│   ├── login.tsx
│   ├── register.tsx
│   └── _layout.tsx
├── (tabs)
│   ├── index.tsx (Home/Feed)
│   ├── saved.tsx
│   ├── friends.tsx
│   ├── profile.tsx
│   └── _layout.tsx
├── votes/
│   ├── [sessionId].tsx
│   ├── create.tsx
│   └── join.tsx
├── item/
│   └── [id].tsx
└── _layout.tsx
```

## 🔗 Complete API Documentation

### Authentication Endpoints

#### POST /api/auth/register
```typescript
// Request
{
  "username": string,
  "email": string,
  "password": string,
  "preferences": {
    "favoriteColors": string[],
    "favoriteBrands": string[],
    "preferredCategories": string[],
    "budgetRange": { min: number, max: number },
    "sizes": string[]
  }
}

// Response
{
  "user": {
    "id": string,
    "username": string,
    "email": string,
    "preferences": UserPreferences
  },
  "accessToken": string
}
```

#### POST /api/auth/login
```typescript
// Request
{
  "email": string,
  "password": string
}

// Response
{
  "user": User,
  "accessToken": string
}
```

### Items & Feed Endpoints

#### GET /api/feed
**Primary endpoint for the main swiping interface**
```typescript
// Query params
?limit=20&offset=0&category=clothing&brand=nike

// Response
{
  "items": [
    {
      "id": string,
      "name": string,
      "brand": string,
      "price": number,
      "imageUrl": string,
      "category": string,
      "tags": string[],
      "description": string,
      "colors": string[],
      "sizes": string[]
    }
  ],
  "hasMore": boolean,
  "total": number
}
```

#### GET /api/items/:id
```typescript
// Response
{
  "id": string,
  "name": string,
  "brand": string,
  "price": number,
  "imageUrl": string,
  "category": string,
  "tags": string[],
  "description": string,
  "colors": string[],
  "sizes": string[],
  "createdAt": string
}
```

### User Interactions

#### POST /api/like/:itemId
```typescript
// Response
{
  "success": boolean,
  "interaction": {
    "id": string,
    "type": "LIKE",
    "itemId": string,
    "userId": string
  }
}
```

#### POST /api/pass/:itemId
```typescript
// Response
{
  "success": boolean,
  "interaction": {
    "id": string,
    "type": "PASS",
    "itemId": string,
    "userId": string
  }
}
```

#### POST /api/save/:itemId
```typescript
// Response
{
  "success": boolean,
  "interaction": {
    "id": string,
    "type": "SAVE",
    "itemId": string,
    "userId": string
  }
}
```

#### GET /api/me/likes
```typescript
// Response
{
  "items": [
    {
      "item": Item,
      "likedAt": string
    }
  ]
}
```

#### GET /api/me/saves
```typescript
// Response
{
  "items": [
    {
      "item": Item,
      "savedAt": string
    }
  ]
}
```

### Friends System

#### POST /api/friends/request
```typescript
// Request
{
  "username": string
}

// Response
{
  "success": boolean,
  "friendship": {
    "id": string,
    "status": "PENDING"
  }
}
```

#### POST /api/friends/accept/:userId
```typescript
// Response
{
  "success": boolean,
  "friendship": {
    "id": string,
    "status": "ACCEPTED"
  }
}
```

#### GET /api/friends
```typescript
// Response
{
  "friends": [
    {
      "id": string,
      "username": string,
      "email": string,
      "friendshipId": string,
      "status": "ACCEPTED",
      "compatibility": {
        "score": number, // 0-100
        "sharedLikes": number,
        "totalInteractions": number
      }
    }
  ]
}
```

#### GET /api/friends/compatibility/:userId
```typescript
// Response
{
  "compatibility": {
    "score": number,
    "sharedLikes": number,
    "details": {
      "commonBrands": string[],
      "commonCategories": string[],
      "commonTags": string[]
    }
  }
}
```

### Voting Sessions

#### POST /api/votes/sessions
```typescript
// Request (optional)
{
  "itemIds": string[] // Pre-selected items, or empty for random items
}

// Response
{
  "session": {
    "id": string,
    "code": string, // 6-digit join code
    "creatorId": string,
    "items": Item[],
    "status": "ACTIVE",
    "createdAt": string
  }
}
```

#### GET /api/votes/sessions
```typescript
// Response - User's voting sessions
{
  "sessions": [
    {
      "id": string,
      "code": string,
      "status": "ACTIVE" | "COMPLETED",
      "itemCount": number,
      "participantCount": number,
      "createdAt": string
    }
  ]
}
```

#### GET /api/votes/sessions/:sessionId
```typescript
// Response
{
  "session": {
    "id": string,
    "code": string,
    "items": Item[],
    "votes": [
      {
        "userId": string,
        "username": string,
        "votes": {
          "itemId": number // 1 for like, 0 for pass
        }
      }
    ],
    "status": "ACTIVE",
    "participants": User[]
  }
}
```

#### POST /api/votes/sessions/:sessionId/vote
```typescript
// Request
{
  "itemId": string,
  "vote": boolean // true for like, false for pass
}

// Response
{
  "success": boolean,
  "vote": {
    "sessionId": string,
    "itemId": string,
    "vote": number
  }
}
```

#### POST /api/votes/join
```typescript
// Request
{
  "code": string // 6-digit code
}

// Response
{
  "session": VoteSession
}
```

#### GET /api/votes/result/:sessionId
```typescript
// Response
{
  "results": [
    {
      "item": Item,
      "likes": number,
      "passes": number,
      "percentage": number
    }
  ],
  "winner": Item | null, // Item with highest percentage
  "participantCount": number
}
```

### Search

#### GET /api/search/search
```typescript
// Query params
?query=nike+shoes

// Response
{
  "items": Item[]
}
```

### User Profile

#### GET /api/users/me
```typescript
// Response
{
  "user": {
    "id": string,
    "username": string,
    "email": string,
    "preferences": {
      "favoriteColors": string[],
      "favoriteBrands": string[],
      "preferredCategories": string[],
      "budgetRange": { min: number, max: number },
      "sizes": string[]
    },
    "stats": {
      "totalLikes": number,
      "totalSaves": number,
      "totalPasses": number,
      "friendsCount": number
    }
  }
}
```

#### PATCH /api/users/me
```typescript
// Request (partial update)
{
  "preferences"?: UserPreferences,
  "username"?: string
}

// Response
{
  "user": User
}
```

## 🎨 Detailed Screen Specifications

### 1. Authentication Screens

#### Login Screen (`(auth)/login.tsx`)
```tsx
- Clean, minimal design with Fashion Tinder branding
- Email and password input fields
- "Login" button with loading state
- "Don't have an account? Sign up" link
- Social login options (optional for MVP)
- Form validation with error messages
```

#### Register Screen (`(auth)/register.tsx`)
```tsx
- Multi-step registration form:
  1. Basic info (username, email, password)
  2. Style preferences (colors, brands, categories)
  3. Personal details (budget range, sizes)
- Progress indicator
- Skip option for preferences (can set later)
- Terms & conditions checkbox
```

### 2. Main Feed Screen (`(tabs)/index.tsx`)

**The core swiping interface - most important screen**

#### Layout & Components:
```tsx
<SafeAreaView>
  <Header>
    <Logo />
    <FilterButton />
    <NotificationBell />
  </Header>
  
  <SwipeableCardStack>
    {items.map(item => (
      <FashionCard key={item.id} item={item} />
    ))}
  </SwipeableCardStack>
  
  <ActionButtons>
    <PassButton onPress={handlePass} />
    <LikeButton onPress={handleLike} />
    <SaveButton onPress={handleSave} />
  </ActionButtons>
  
  <FloatingActionButton onPress={createVoteSession} />
</SafeAreaView>
```

#### Gesture Handling:
```tsx
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedGestureHandler } from 'react-native-reanimated';

// Swipe gestures:
// - LEFT: Pass (red overlay)
// - RIGHT: Like (green overlay) 
// - UP: Save (blue overlay)
// - Velocity threshold: 800 for auto-action
// - Rotation during swipe for natural feel
```

#### Fashion Card Component:
```tsx
<Animated.View style={cardStyle}>
  <Image source={{ uri: item.imageUrl }} />
  <Gradient overlay for text readability />
  
  <CardContent>
    <ItemName>{item.name}</ItemName>
    <Brand>{item.brand}</Brand>
    <Price>${item.price}</Price>
    <Tags>{item.tags.join(' • ')}</Tags>
    
    <SwipeIndicators>
      <PassOverlay opacity={passOpacity} />
      <LikeOverlay opacity={likeOpacity} />
      <SaveOverlay opacity={saveOpacity} />
    </SwipeIndicators>
  </CardContent>
</Animated.View>
```

#### Key Features:
- Infinite scroll with intelligent preloading
- Smooth 60fps animations
- Haptic feedback on swipe actions
- Empty state when no more items
- Pull-to-refresh functionality
- Filter modal (category, brand, price range)

### 3. Saved Items Screen (`(tabs)/saved.tsx`)

```tsx
<ScrollView>
  <Header title="Saved Items" />
  
  <FilterTabs>
    <Tab active>All</Tab>
    <Tab>Clothes</Tab>
    <Tab>Shoes</Tab>
    <Tab>Accessories</Tab>
  </FilterTabs>
  
  <ItemGrid>
    {savedItems.map(item => (
      <SavedItemCard 
        key={item.id} 
        item={item}
        onPress={() => navigateToItem(item.id)}
        onRemove={() => removeSave(item.id)}
      />
    ))}
  </ItemGrid>
</ScrollView>
```

Features:
- Grid layout (2 columns on mobile)
- Quick remove action with undo
- Sort options (date saved, price, brand)
- Share functionality
- Add to vote session option

### 4. Friends Screen (`(tabs)/friends.tsx`)

```tsx
<SafeAreaView>
  <Header>
    <Title>Friends</Title>
    <AddFriendButton />
  </Header>
  
  <SearchBar placeholder="Search friends..." />
  
  <FriendsList>
    {friends.map(friend => (
      <FriendCard key={friend.id}>
        <Avatar src={friend.avatar} />
        <FriendInfo>
          <Name>{friend.username}</Name>
          <CompatibilityScore score={friend.compatibility.score} />
          <SharedLikes>{friend.compatibility.sharedLikes} shared likes</SharedLikes>
        </FriendInfo>
        <Actions>
          <ViewProfileButton />
          <StartVoteSessionButton />
        </Actions>
      </FriendCard>
    ))}
  </FriendsList>
  
  <PendingRequests>
    {pendingRequests.map(request => (
      <RequestCard key={request.id}>
        <UserInfo>{request.username}</UserInfo>
        <Actions>
          <AcceptButton />
          <DeclineButton />
        </Actions>
      </RequestCard>
    ))}
  </PendingRequests>
</SafeAreaView>
```

Features:
- Compatibility scoring with color coding:
  - 80-100%: Green (Perfect match)
  - 60-79%: Orange (Good match)  
  - 40-59%: Yellow (Okay match)
  - 0-39%: Red (Different taste)
- Friend request management
- Quick actions to start vote sessions

### 5. Profile Screen (`(tabs)/profile.tsx`)

```tsx
<ScrollView>
  <ProfileHeader>
    <Avatar editable />
    <Username>{user.username}</Username>
    <Email>{user.email}</Email>
    <EditProfileButton />
  </ProfileHeader>
  
  <StatsSection>
    <StatCard>
      <Number>{stats.totalLikes}</Number>
      <Label>Items Liked</Label>
    </StatCard>
    <StatCard>
      <Number>{stats.totalSaves}</Number>
      <Label>Items Saved</Label>
    </StatCard>
    <StatCard>
      <Number>{stats.friendsCount}</Number>
      <Label>Friends</Label>
    </StatCard>
  </StatsSection>
  
  <PreferencesSection>
    <SectionTitle>Style Preferences</SectionTitle>
    <PreferencesList>
      <PreferenceItem>
        <Label>Favorite Brands</Label>
        <TagList tags={preferences.favoriteBrands} />
      </PreferenceItem>
      <PreferenceItem>
        <Label>Preferred Categories</Label>
        <TagList tags={preferences.preferredCategories} />
      </PreferenceItem>
      <PreferenceItem>
        <Label>Budget Range</Label>
        <BudgetRange range={preferences.budgetRange} />
      </PreferenceItem>
    </PreferencesList>
  </PreferencesSection>
  
  <ActionsSection>
    <MenuItem>Settings</MenuItem>
    <MenuItem>Help & Support</MenuItem>
    <MenuItem>Privacy Policy</MenuItem>
    <LogoutButton>Logout</LogoutButton>
  </ActionsSection>
</ScrollView>
```

### 6. Vote Session Screens

#### Create Vote Session (`votes/create.tsx`)
```tsx
<SafeAreaView>
  <Header>
    <BackButton />
    <Title>Create Vote Session</Title>
  </Header>
  
  <StepIndicator currentStep={1} totalSteps={3} />
  
  {step === 1 && (
    <ItemSelection>
      <Title>Choose items to vote on</Title>
      <Options>
        <OptionCard onPress={() => setSelectionType('liked')}>
          <Icon name="heart" />
          <Label>From Liked Items</Label>
        </OptionCard>
        <OptionCard onPress={() => setSelectionType('saved')}>
          <Icon name="bookmark" />
          <Label>From Saved Items</Label>
        </OptionCard>
        <OptionCard onPress={() => setSelectionType('random')}>
          <Icon name="shuffle" />
          <Label>Random Items</Label>
        </OptionCard>
      </Options>
    </ItemSelection>
  )}
  
  {step === 2 && (
    <ItemGrid>
      {availableItems.map(item => (
        <SelectableItemCard 
          key={item.id}
          item={item}
          selected={selectedItems.includes(item.id)}
          onToggle={() => toggleItem(item.id)}
        />
      ))}
    </ItemGrid>
  )}
  
  {step === 3 && (
    <SessionCreated>
      <SuccessIcon />
      <SessionCode>{sessionCode}</SessionCode>
      <Instructions>Share this code with friends to let them join!</Instructions>
      <ShareButton />
      <StartSessionButton />
    </SessionCreated>
  )}
</SafeAreaView>
```

#### Vote Session (`votes/[sessionId].tsx`)
```tsx
<SafeAreaView>
  <Header>
    <SessionCode>{session.code}</SessionCode>
    <ParticipantCount>{session.participants.length} participants</ParticipantCount>
  </Header>
  
  <VotingInterface>
    {!hasVoted ? (
      <SwipeableVoteCards>
        {session.items.map(item => (
          <VoteCard 
            key={item.id}
            item={item}
            onVote={(vote) => castVote(item.id, vote)}
          />
        ))}
      </SwipeableVoteCards>
    ) : (
      <WaitingScreen>
        <Message>Waiting for others to finish voting...</Message>
        <ParticipantsList>
          {session.participants.map(participant => (
            <ParticipantItem key={participant.id}>
              <Name>{participant.username}</Name>
              <Status>{hasVoted(participant.id) ? '✅' : '⏳'}</Status>
            </ParticipantItem>
          ))}
        </ParticipantsList>
      </WaitingScreen>
    )}
  </VotingInterface>
  
  {allVotesComplete && (
    <ResultsSection>
      <WinnerCard item={results.winner} />
      <ResultsList results={results.results} />
      <Actions>
        <ShareResultsButton />
        <NewSessionButton />
      </Actions>
    </ResultsSection>
  )}
</SafeAreaView>
```

#### Join Vote Session (`votes/join.tsx`)
```tsx
<SafeAreaView>
  <Header>
    <BackButton />
    <Title>Join Vote Session</Title>
  </Header>
  
  <JoinForm>
    <Instructions>Enter the 6-digit code shared by your friend</Instructions>
    <CodeInput
      value={code}
      onChangeText={setCode}
      maxLength={6}
      placeholder="000000"
      keyboardType="numeric"
    />
    <JoinButton onPress={joinSession} disabled={code.length !== 6}>
      Join Session
    </JoinButton>
  </JoinForm>
  
  <RecentSessions>
    <SectionTitle>Recent Sessions</SectionTitle>
    {recentSessions.map(session => (
      <SessionCard key={session.id} onPress={() => rejoinSession(session.id)}>
        <SessionInfo>
          <Code>{session.code}</Code>
          <ItemCount>{session.itemCount} items</ItemCount>
        </SessionInfo>
        <RejoinButton />
      </SessionCard>
    ))}
  </RecentSessions>
</SafeAreaView>
```

## 🔧 Technical Implementation Details

### API Service Layer
```typescript
// services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('authToken');
      // Navigate to login
    }
    return Promise.reject(error);
  }
);
```

### State Management with React Query
```typescript
// hooks/useItems.ts
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useFeed = (filters?: FeedFilters) => {
  return useInfiniteQuery({
    queryKey: ['feed', filters],
    queryFn: ({ pageParam = 0 }) => api.getFeed({ offset: pageParam, ...filters }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length * 20 : undefined;
    },
  });
};

export const useLikeItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemId: string) => api.likeItem(itemId),
    onSuccess: () => {
      // Invalidate and refetch feed
      queryClient.invalidateQueries(['feed']);
      // Update saved items cache
      queryClient.invalidateQueries(['user', 'likes']);
    },
  });
};
```

### Gesture-Based Swipe Implementation
```typescript
// components/SwipeableCard.tsx
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const SWIPE_THRESHOLD = 150;
const ROTATION_FACTOR = 0.1;

export const SwipeableCard = ({ item, onSwipe, ...props }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(1.05);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    },
    onEnd: (event) => {
      scale.value = withSpring(1);
      
      if (Math.abs(event.velocityX) > 800) {
        // High velocity swipe
        const direction = event.velocityX > 0 ? 'right' : 'left';
        runOnJS(onSwipe)(direction);
      } else if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
        // Position-based swipe
        const direction = translateX.value > 0 ? 'right' : 'left';
        runOnJS(onSwipe)(direction);
      } else if (translateY.value < -SWIPE_THRESHOLD) {
        // Swipe up for save
        runOnJS(onSwipe)('up');
      } else {
        // Return to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${translateX.value * ROTATION_FACTOR}deg` },
      { scale: scale.value },
    ],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: Math.abs(translateX.value) / SWIPE_THRESHOLD,
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        
        {/* Swipe Overlays */}
        <Animated.View style={[styles.likeOverlay, overlayStyle]}>
          <Text style={styles.overlayText}>LIKE</Text>
        </Animated.View>
        
        <Animated.View style={[styles.passOverlay, overlayStyle]}>
          <Text style={styles.overlayText}>PASS</Text>
        </Animated.View>
        
        <View style={styles.cardContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.price}>${item.price}</Text>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};
```

### Real-time Vote Sessions (Optional Enhancement)
```typescript
// hooks/useVoteSession.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useVoteSession = (sessionId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      auth: { token: authToken }
    });

    newSocket.emit('join-session', sessionId);
    
    newSocket.on('vote-cast', (vote: Vote) => {
      setVotes(prev => [...prev, vote]);
    });
    
    newSocket.on('participant-joined', (user: User) => {
      setParticipants(prev => [...prev, user]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId]);

  const castVote = (itemId: string, vote: boolean) => {
    socket?.emit('cast-vote', { sessionId, itemId, vote });
  };

  return { votes, participants, castVote };
};
```

## 🎨 Design System & Styling

### Color Palette
```typescript
export const colors = {
  primary: {
    50: '#FFF5F5',
    100: '#FED7D7',
    500: '#E53E3E', // Main brand color
    600: '#C53030',
    900: '#742A2A',
  },
  gray: {
    50: '#F7FAFC',
    100: '#EDF2F7',
    200: '#E2E8F0',
    500: '#718096',
    700: '#2D3748',
    900: '#1A202C',
  },
  green: {
    400: '#48BB78',
    500: '#38A169', // Like action
  },
  red: {
    400: '#F56565',
    500: '#E53E3E', // Pass action
  },
  blue: {
    400: '#4299E1',
    500: '#3182CE', // Save action
  },
};
```

### Typography Scale
```typescript
export const typography = {
  heading: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
  },
};
```

### Component Styling Examples
```typescript
const styles = StyleSheet.create({
  swipeCard: {
    width: '90%',
    height: '75%',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  
  likeOverlay: {
    position: 'absolute',
    top: 50,
    left: 30,
    backgroundColor: colors.green[500],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    transform: [{ rotate: '-15deg' }],
  },
  
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
```

## 🔄 State Management Architecture

### Auth Context
```typescript
// contexts/AuthContext.tsx
const AuthContext = createContext<{
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
} | null>(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        const userData = await api.getMe();
        setUser(userData);
      }
    } catch (error) {
      await SecureStore.deleteItemAsync('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  // ... implementation
};
```

## 📱 Platform-Specific Considerations

### iOS Specific
- Use native iOS style navigation headers
- Implement haptic feedback for swipe actions
- Handle safe area insets properly
- Support iOS gesture navigation

### Android Specific  
- Material Design elements where appropriate
- Handle Android back button properly
- Implement proper status bar styling
- Support gesture navigation

## 🚀 Performance Optimizations

### Image Optimization
```typescript
// components/OptimizedImage.tsx
import { Image } from 'expo-image';

export const OptimizedImage = ({ uri, ...props }) => (
  <Image
    source={{ uri }}
    contentFit="cover"
    transition={200}
    cachePolicy="memory-disk"
    {...props}
  />
);
```

### List Performance
```typescript
// Use FlashList for better performance
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={renderItem}
  estimatedItemSize={200}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
/>
```

## 🧪 Testing Strategy

### Unit Tests
- Component rendering tests
- Hook functionality tests  
- Utility function tests

### Integration Tests
- API integration tests
- Navigation flow tests
- User interaction tests

### E2E Tests
- Critical user journeys
- Swipe gesture functionality
- Vote session flows

## 📦 Required Dependencies

```json
{
  "dependencies": {
    "expo": "~49.0.0",
    "react": "18.2.0",
    "react-native": "0.72.0",
    "@expo/vector-icons": "^13.0.0",
    "expo-router": "^2.0.0",
    "expo-secure-store": "~12.3.1",
    "expo-image": "~1.3.2",
    "expo-linear-gradient": "~12.3.0",
    "expo-haptics": "~12.4.0",
    "@tanstack/react-query": "^4.29.0",
    "axios": "^1.4.0",
    "react-native-reanimated": "~3.3.0",
    "react-native-gesture-handler": "~2.12.0",
    "react-native-safe-area-context": "4.6.3",
    "react-native-svg": "13.9.0",
    "@shopify/flash-list": "^1.4.0",
    "nativewind": "^2.0.11"
  },
  "devDependencies": {
    "@types/react": "~18.2.14",
    "@types/react-native": "~0.72.2",
    "typescript": "^5.1.3",
    "tailwindcss": "3.3.2"
  }
}
```

## 🔧 Environment Configuration

### App Config (`app.json`)
```json
{
  "expo": {
    "name": "Fashion Tinder",
    "slug": "fashion-tinder",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#E53E3E"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.yourcompany.fashiontinder"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#E53E3E"
      },
      "package": "com.yourcompany.fashiontinder"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ]
  }
}
```

## 📋 Implementation Checklist

### Phase 1: Core Functionality
- [ ] Set up Expo project with TypeScript
- [ ] Implement authentication flow
- [ ] Create main feed with swipe gestures
- [ ] Implement basic API integration
- [ ] Add navigation structure

### Phase 2: Enhanced Features  
- [ ] Implement friends system
- [ ] Add saved items functionality
- [ ] Create user profile with preferences
- [ ] Add search functionality
- [ ] Implement vote sessions

### Phase 3: Polish & Performance
- [ ] Add animations and transitions
- [ ] Implement proper error handling
- [ ] Add loading states and empty states
- [ ] Optimize performance
- [ ] Add offline support

### Phase 4: Testing & Deployment
- [ ] Write comprehensive tests
- [ ] Test on multiple devices
- [ ] Prepare for app store submission
- [ ] Set up CI/CD pipeline

## 🎯 Key Success Metrics

### User Engagement
- Daily active users
- Average session duration
- Swipe-through rate
- Items saved per session

### Social Features
- Friend connections made
- Vote sessions created
- Session participation rate
- Friend compatibility accuracy

### Technical Performance
- App launch time < 3 seconds
- Swipe response time < 100ms
- API response time < 500ms
- Crash-free sessions > 99.5%

## 🚨 Important Notes

1. **Backend Integration**: The existing NestJS backend is fully operational at `http://localhost:3000/api` with all endpoints documented above.

2. **Real-time Features**: While not implemented in the backend yet, the vote sessions currently use polling. Consider adding WebSocket support for real-time updates.

3. **Image Optimization**: All fashion item images should be optimized and served via CDN for better performance.

4. **Offline Support**: Implement caching strategies for critical data like liked/saved items.

5. **Push Notifications**: Consider adding push notifications for friend requests and vote session invitations.

6. **Analytics**: Integrate analytics to track user behavior and improve recommendations.

This comprehensive specification should provide everything needed to create a polished, production-ready Fashion Tinder frontend that seamlessly integrates with the existing backend infrastructure.