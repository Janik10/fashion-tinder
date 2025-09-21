const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
// const { query, queryOne, transaction } = require('../config/database');

// In-memory user storage (for testing)
const users = new Map();
let nextUserId = 1;
const { generateToken, authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Validation rules
const registerValidation = [
    body('username')
        .isLength({ min: 3, max: 50 })
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username must be 3-50 characters, alphanumeric and underscores only'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
];

const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
];

// Register new user
router.post('/register', registerValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { username, email, password } = req.body;

        // Check if user already exists
        for (const [id, user] of users) {
            if (user.email === email || user.username === username) {
                return res.status(409).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user in memory
        const userId = nextUserId++;
        const newUser = {
            id: userId,
            username,
            email,
            password: hashedPassword,
            created_at: new Date(),
            preferences: {
                style: null,
                size: null,
                brands: []
            }
        };

        users.set(userId, newUser);

        // Generate JWT token
        const token = generateToken({
            id: userId,
            email,
            username
        });

        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userWithoutPassword,
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
});

// Login user
router.post('/login', loginValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Get user with password hash
        const user = await queryOne(
            'SELECT id, username, email, password_hash, created_at FROM users WHERE email = ?',
            [email]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken(user.id);

        // Remove password hash from response
        const { password_hash, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        // Get user with preferences
        const user = await queryOne(`
            SELECT 
                u.id, u.username, u.email, u.profile_image, u.bio, u.created_at,
                up.preferred_categories, up.preferred_brands, up.preferred_colors,
                up.preferred_price_min, up.preferred_price_max, up.preferred_seasons,
                up.preferred_gender
            FROM users u
            LEFT JOIN user_preferences up ON u.id = up.user_id
            WHERE u.id = ?
        `, [req.user.id]);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Parse JSON fields
        if (user.preferred_categories) {
            user.preferred_categories = JSON.parse(user.preferred_categories);
        }
        if (user.preferred_brands) {
            user.preferred_brands = JSON.parse(user.preferred_brands);
        }
        if (user.preferred_colors) {
            user.preferred_colors = JSON.parse(user.preferred_colors);
        }
        if (user.preferred_seasons) {
            user.preferred_seasons = JSON.parse(user.preferred_seasons);
        }

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile'
        });
    }
});

// Verify token endpoint
router.post('/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        data: {
            user: req.user
        }
    });
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

module.exports = router;
module.exports.users = users;