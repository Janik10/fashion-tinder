const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { generateToken, authenticateToken } = require('../middleware/auth');
const router = express.Router();

// In-memory user storage (for testing)
const users = new Map();
let nextUserId = 1;

// Validation rules - relaxed for development
const registerValidation = [
    body('username')
        .isLength({ min: 1, max: 50 })
        .withMessage('Username must be 1-50 characters'),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address'),
    body('password')
        .isLength({ min: 3 })
        .withMessage('Password must be at least 3 characters')
];

const loginValidation = [
    body('email').isEmail(),
    body('password').notEmpty()
];

// Register new user
router.post('/register', registerValidation, async (req, res) => {
    try {
        console.log('📝 Registration attempt:', req.body);

        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            const errorMessages = errors.array().map(error => error.msg);
            return res.status(400).json({
                success: false,
                message: errorMessages.join('. '),
                errors: errors.array()
            });
        }

        const { username, email, password } = req.body;

        // Check if user already exists
        for (const [id, user] of users) {
            if (user.email === email || user.username === username) {
                console.log('❌ User already exists:', email, username);
                return res.status(409).json({
                    success: false,
                    message: 'User with this email or username already exists'
                });
            }
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
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
        console.log('✅ User created successfully:', userId, username, email);

        // Generate JWT token
        const token = generateToken({
            id: userId,
            email,
            username
        });

        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = newUser;

        console.log('🎯 Sending success response');
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userWithoutPassword,
                token
            }
        });

        console.log(`👤 New user registered: ${username} (${email})`);

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

        // Find user by email
        let foundUser = null;
        for (const [id, user] of users) {
            if (user.email === email) {
                foundUser = user;
                break;
            }
        }

        if (!foundUser) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, foundUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken({
            id: foundUser.id,
            email: foundUser.email,
            username: foundUser.username
        });

        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = foundUser;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                token
            }
        });

        console.log(`🔐 User logged in: ${foundUser.username}`);

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = users.get(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            data: {
                user: userWithoutPassword
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user info'
        });
    }
});

// Update user profile
router.patch('/me', [
    authenticateToken,
    body('username').optional().isLength({ min: 3, max: 50 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('preferences').optional().isObject()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const userId = req.user.id;
        const user = users.get(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const { username, email, preferences } = req.body;

        // Check if new email/username already exists
        if (email && email !== user.email) {
            for (const [id, existingUser] of users) {
                if (id !== userId && existingUser.email === email) {
                    return res.status(409).json({
                        success: false,
                        message: 'Email already exists'
                    });
                }
            }
        }

        if (username && username !== user.username) {
            for (const [id, existingUser] of users) {
                if (id !== userId && existingUser.username === username) {
                    return res.status(409).json({
                        success: false,
                        message: 'Username already exists'
                    });
                }
            }
        }

        // Update user
        if (username) user.username = username;
        if (email) user.email = email;
        if (preferences) user.preferences = { ...user.preferences, ...preferences };

        users.set(userId, user);

        // Return updated user data (without password)
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: userWithoutPassword
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
});

// Get user count (for admin purposes)
router.get('/stats', async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                totalUsers: users.size,
                registeredToday: 0 // Would calculate if we had proper timestamps
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get stats'
        });
    }
});

module.exports = router;
module.exports.users = users;