const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:"],
            fontSrc: ["'self'", "https:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:3000',
            'http://localhost:8080',
            'http://localhost:5173'
        ].filter(Boolean);
        
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for development
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Fashion Tinder API is running (dev mode)',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Mock auth endpoints for testing
app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    
    // Mock validation
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username, email, and password are required'
        });
    }
    
    // Mock successful registration
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: {
                id: '1',
                username,
                email,
                createdAt: new Date().toISOString()
            },
            token: 'mock-jwt-token-' + Math.random().toString(36).substring(7)
        }
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Mock validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }
    
    // Mock successful login
    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: '1',
                username: 'testuser',
                email,
                createdAt: new Date().toISOString()
            },
            token: 'mock-jwt-token-' + Math.random().toString(36).substring(7)
        }
    });
});

app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token || !token.startsWith('mock-jwt-token')) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }
    
    res.json({
        success: true,
        data: {
            user: {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                createdAt: new Date().toISOString()
            }
        }
    });
});

app.post('/api/auth/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// Mock items endpoint
app.get('/api/items/swipe', (req, res) => {
    const mockItems = [
        {
            id: '1',
            name: 'Stylish Summer Dress',
            brand: 'Fashion Brand',
            price: 89.99,
            currency: 'USD',
            imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500',
            colors: ['#FF6B6B', '#4ECDC4'],
            season: 'summer',
            gender: 'women',
            category: 'Dresses',
            tags: ['summer', 'casual', 'trendy']
        },
        {
            id: '2',
            name: 'Classic Denim Jacket',
            brand: 'Denim Co',
            price: 129.99,
            currency: 'USD',
            imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
            colors: ['#4A90E2', '#2C5282'],
            season: 'all-season',
            gender: 'unisex',
            category: 'Jackets',
            tags: ['classic', 'denim', 'versatile']
        }
    ];
    
    res.json({
        success: true,
        data: {
            items: mockItems,
            count: mockItems.length
        }
    });
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Fashion Tinder API v1.0 (Development Mode)',
        endpoints: {
            auth: {
                'POST /api/auth/register': 'Register new user',
                'POST /api/auth/login': 'Login user',
                'GET /api/auth/me': 'Get current user profile',
                'POST /api/auth/logout': 'Logout user'
            },
            items: {
                'GET /api/items/swipe': 'Get swipable fashion items'
            }
        },
        note: 'This is a development server with mock data'
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.path
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Fashion Tinder API Server running (DEV MODE)!`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
    console.log(`\n⚠️  Using mock data - no database required\n`);
});

module.exports = app;