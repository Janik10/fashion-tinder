const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const dataLoader = require('../data-loader');
const router = express.Router();

// Get swipe endpoint for compatibility (same as feed)
router.get('/swipe', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, offset = 0 } = req.query;

        // Get user preferences from auth middleware (req.user contains full user object)
        const userPreferences = req.user.preferences || null;

        const items = dataLoader.getFeedForUser(userId, parseInt(limit), parseInt(offset), userPreferences);

        res.json({
            success: true,
            data: {
                items,
                count: items.length
            }
        });

    } catch (error) {
        console.error('Get swipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get fashion feed'
        });
    }
});

// Get feed for user (swipable fashion items)
router.get('/feed', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, offset = 0 } = req.query;

        // Get user preferences from auth middleware (req.user contains full user object)
        const userPreferences = req.user.preferences || null;

        const items = dataLoader.getFeedForUser(userId, parseInt(limit), parseInt(offset), userPreferences);

        res.json({
            success: true,
            data: {
                items,
                count: items.length
            }
        });

    } catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get fashion feed'
        });
    }
});

// Like an item
router.post('/like', [
    authenticateToken,
    body('itemId').notEmpty().withMessage('Valid item ID required')
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

        const { itemId } = req.body;
        const userId = req.user.id;

        // Check if item exists
        const item = dataLoader.getItemById(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Fashion item not found'
            });
        }

        dataLoader.recordInteraction(userId, itemId, 'like');

        res.json({
            success: true,
            message: 'Item liked successfully',
            data: { itemId, action: 'like' }
        });

    } catch (error) {
        console.error('Like item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to like item'
        });
    }
});

// Pass on an item
router.post('/pass', [
    authenticateToken,
    body('itemId').notEmpty().withMessage('Valid item ID required')
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

        const { itemId } = req.body;
        const userId = req.user.id;

        dataLoader.recordInteraction(userId, itemId, 'pass');

        res.json({
            success: true,
            message: 'Item passed successfully',
            data: { itemId, action: 'pass' }
        });

    } catch (error) {
        console.error('Pass item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to pass item'
        });
    }
});

// Save an item
router.post('/save', [
    authenticateToken,
    body('itemId').notEmpty().withMessage('Valid item ID required')
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

        const { itemId } = req.body;
        const userId = req.user.id;

        dataLoader.recordInteraction(userId, itemId, 'save');

        res.json({
            success: true,
            message: 'Item saved successfully',
            data: { itemId, action: 'save' }
        });

    } catch (error) {
        console.error('Save item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save item'
        });
    }
});

// Interact with an item (like/pass/save) - legacy endpoint for frontend compatibility
router.post('/interact', [
    authenticateToken,
    body('itemId').notEmpty().withMessage('Valid item ID required'),
    body('action').isIn(['like', 'pass', 'save']).withMessage('Action must be like, pass, or save')
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

        const { itemId, action } = req.body;
        const userId = req.user.id;

        // Check if item exists for like action
        if (action === 'like') {
            const item = dataLoader.getItemById(itemId);
            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: 'Fashion item not found'
                });
            }
        }

        dataLoader.recordInteraction(userId, itemId, action);

        res.json({
            success: true,
            message: `Item ${action}d successfully`,
            data: { itemId, action }
        });

    } catch (error) {
        console.error('Interact error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record interaction'
        });
    }
});

// Get user's saved items
router.get('/saved', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const savedItems = dataLoader.getSavedItemsForUser(userId);

        res.json({
            success: true,
            data: {
                items: savedItems,
                count: savedItems.length
            }
        });

    } catch (error) {
        console.error('Get saved items error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get saved items'
        });
    }
});

module.exports = router;