const jwt = require('jsonwebtoken');
// const { queryOne } = require('../config/database');

// Access to in-memory users from auth routes
let users;
const getUsersMap = () => {
    if (!users) {
        // Import the users map from auth-simple route
        const authModule = require('../routes/auth-simple');
        users = authModule.users || new Map();
    }
    return users;
};

// JWT Authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access token required' 
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from memory - handle different token structures
        let userId;
        if (decoded.userId && typeof decoded.userId === 'object') {
            userId = decoded.userId.id; // New token format
        } else {
            userId = decoded.userId; // Old token format
        }

        const usersMap = getUsersMap();
        const user = usersMap.get(userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token - user not found'
            });
        }

        // Add user to request object (without password)
        const { password: _, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired' 
            });
        }
        
        console.error('Auth middleware error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Authentication error' 
        });
    }
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Verify token utility
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    authenticateToken,
    generateToken,
    verifyToken
};