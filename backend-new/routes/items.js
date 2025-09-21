const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { query: dbQuery, queryOne, transaction } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get swipable fashion items with filters
router.get('/swipe', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 10, category, brand, maxPrice, minPrice, gender } = req.query;
        
        // Build dynamic WHERE clause based on filters
        let whereClause = 'fi.is_active = TRUE';
        const params = [];
        
        if (category) {
            whereClause += ' AND c.name = ?';
            params.push(category);
        }
        
        if (brand) {
            whereClause += ' AND b.name = ?';
            params.push(brand);
        }
        
        if (minPrice) {
            whereClause += ' AND fi.price >= ?';
            params.push(parseFloat(minPrice));
        }
        
        if (maxPrice) {
            whereClause += ' AND fi.price <= ?';
            params.push(parseFloat(maxPrice));
        }
        
        if (gender && gender !== 'all') {
            whereClause += ' AND (fi.gender = ? OR fi.gender = "unisex")';
            params.push(gender);
        }
        
        // Exclude items user has already interacted with
        whereClause += ` AND fi.id NOT IN (
            SELECT item_id FROM user_interactions 
            WHERE user_id = ? AND interaction_type IN ('like', 'dislike')
        )`;
        params.push(userId);
        
        const sql = `
            SELECT 
                fi.id,
                fi.name,
                fi.description,
                fi.price,
                fi.currency,
                fi.image_url,
                fi.color_primary,
                fi.color_secondary,
                fi.season,
                fi.gender,
                b.name as brand_name,
                b.logo_url as brand_logo,
                c.name as category_name,
                GROUP_CONCAT(t.name) as tags
            FROM fashion_items fi
            JOIN brands b ON fi.brand_id = b.id
            JOIN categories c ON fi.category_id = c.id
            LEFT JOIN item_tags it ON fi.id = it.item_id
            LEFT JOIN tags t ON it.tag_id = t.id
            WHERE ${whereClause}
            GROUP BY fi.id
            ORDER BY RAND()
            LIMIT ?
        `;
        
        params.push(parseInt(limit));
        
        const items = await dbQuery(sql, params);
        
        // Format response
        const formattedItems = items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            currency: item.currency,
            imageUrl: item.image_url,
            colors: [item.color_primary, item.color_secondary].filter(Boolean),
            season: item.season,
            gender: item.gender,
            brand: {
                name: item.brand_name,
                logo: item.brand_logo
            },
            category: item.category_name,
            tags: item.tags ? item.tags.split(',') : []
        }));
        
        res.json({
            success: true,
            data: {
                items: formattedItems,
                count: formattedItems.length
            }
        });
        
    } catch (error) {
        console.error('Get swipe items error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get fashion items'
        });
    }
});

// Like/Dislike an item
router.post('/interact', [
    authenticateToken,
    body('itemId').isInt().withMessage('Valid item ID required'),
    body('action').isIn(['like', 'dislike']).withMessage('Action must be like or dislike')
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
        
        // Check if item exists
        const item = await queryOne(
            'SELECT id FROM fashion_items WHERE id = ? AND is_active = TRUE',
            [itemId]
        );
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Fashion item not found'
            });
        }
        
        // Insert or update interaction
        await dbQuery(`
            INSERT INTO user_interactions (user_id, item_id, interaction_type)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                interaction_type = VALUES(interaction_type),
                created_at = CURRENT_TIMESTAMP
        `, [userId, itemId, action]);
        
        res.json({
            success: true,
            message: `Item ${action}d successfully`,
            data: {
                itemId,
                action
            }
        });
        
    } catch (error) {
        console.error('Item interaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process interaction'
        });
    }
});

// Save/Unsave an item
router.post('/save', [
    authenticateToken,
    body('itemId').isInt().withMessage('Valid item ID required'),
    body('save').isBoolean().withMessage('Save must be true or false')
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
        
        const { itemId, save } = req.body;
        const userId = req.user.id;
        
        if (save) {
            // Save item
            await dbQuery(`
                INSERT INTO user_interactions (user_id, item_id, interaction_type)
                VALUES (?, ?, 'save')
                ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
            `, [userId, itemId]);
        } else {
            // Remove save
            await dbQuery(
                'DELETE FROM user_interactions WHERE user_id = ? AND item_id = ? AND interaction_type = "save"',
                [userId, itemId]
            );
        }
        
        res.json({
            success: true,
            message: save ? 'Item saved successfully' : 'Item unsaved successfully',
            data: {
                itemId,
                saved: save
            }
        });
        
    } catch (error) {
        console.error('Save item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save item'
        });
    }
});

// Get user's saved items
router.get('/saved', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, offset = 0 } = req.query;
        
        const items = await dbQuery(`
            SELECT 
                fi.id,
                fi.name,
                fi.description,
                fi.price,
                fi.currency,
                fi.image_url,
                fi.color_primary,
                fi.color_secondary,
                fi.season,
                fi.gender,
                b.name as brand_name,
                b.logo_url as brand_logo,
                c.name as category_name,
                ui.created_at as saved_at,
                GROUP_CONCAT(t.name) as tags
            FROM user_interactions ui
            JOIN fashion_items fi ON ui.item_id = fi.id
            JOIN brands b ON fi.brand_id = b.id
            JOIN categories c ON fi.category_id = c.id
            LEFT JOIN item_tags it ON fi.id = it.item_id
            LEFT JOIN tags t ON it.tag_id = t.id
            WHERE ui.user_id = ? AND ui.interaction_type = 'save' AND fi.is_active = TRUE
            GROUP BY fi.id
            ORDER BY ui.created_at DESC
            LIMIT ? OFFSET ?
        `, [userId, parseInt(limit), parseInt(offset)]);
        
        const formattedItems = items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            currency: item.currency,
            imageUrl: item.image_url,
            colors: [item.color_primary, item.color_secondary].filter(Boolean),
            season: item.season,
            gender: item.gender,
            brand: {
                name: item.brand_name,
                logo: item.brand_logo
            },
            category: item.category_name,
            tags: item.tags ? item.tags.split(',') : [],
            savedAt: item.saved_at
        }));
        
        res.json({
            success: true,
            data: {
                items: formattedItems,
                count: formattedItems.length
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

// Get personalized recommendations
router.get('/recommendations', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 10 } = req.query;
        
        // Get user preferences
        const userPrefs = await queryOne(`
            SELECT preferred_categories, preferred_brands, preferred_colors, 
                   preferred_price_min, preferred_price_max, preferred_seasons, preferred_gender
            FROM user_preferences 
            WHERE user_id = ?
        `, [userId]);
        
        // Get user's liked items to analyze preferences
        const likedItems = await dbQuery(`
            SELECT fi.brand_id, fi.category_id, fi.price, fi.season, fi.gender
            FROM user_interactions ui
            JOIN fashion_items fi ON ui.item_id = fi.id
            WHERE ui.user_id = ? AND ui.interaction_type = 'like'
            ORDER BY ui.created_at DESC
            LIMIT 50
        `, [userId]);
        
        // Calculate preference scores based on user behavior
        let brandScores = {};
        let categoryScores = {};
        let priceSum = 0;
        let seasonScores = {};
        let genderScores = {};
        
        if (likedItems.length > 0) {
            likedItems.forEach(item => {
                brandScores[item.brand_id] = (brandScores[item.brand_id] || 0) + 1;
                categoryScores[item.category_id] = (categoryScores[item.category_id] || 0) + 1;
                seasonScores[item.season] = (seasonScores[item.season] || 0) + 1;
                genderScores[item.gender] = (genderScores[item.gender] || 0) + 1;
                priceSum += parseFloat(item.price);
            });
        }
        
        const avgPrice = likedItems.length > 0 ? priceSum / likedItems.length : 100;
        const priceRange = avgPrice * 0.5; // ±50% of average
        
        // Build recommendation query with scoring
        let sql = `
            SELECT 
                fi.id,
                fi.name,
                fi.description,
                fi.price,
                fi.currency,
                fi.image_url,
                fi.color_primary,
                fi.color_secondary,
                fi.season,
                fi.gender,
                b.name as brand_name,
                b.logo_url as brand_logo,
                c.name as category_name,
                GROUP_CONCAT(t.name) as tags,
                (
                    CASE 
                        WHEN fi.brand_id IN (${Object.keys(brandScores).join(',') || '0'}) 
                        THEN 3 ELSE 0 
                    END +
                    CASE 
                        WHEN fi.category_id IN (${Object.keys(categoryScores).join(',') || '0'}) 
                        THEN 2 ELSE 0 
                    END +
                    CASE 
                        WHEN ABS(fi.price - ?) <= ? 
                        THEN 1 ELSE 0 
                    END +
                    CASE 
                        WHEN fi.season IN (${Object.keys(seasonScores).map(() => '?').join(',') || "'all-season'"}) 
                        THEN 1 ELSE 0 
                    END
                ) as recommendation_score
            FROM fashion_items fi
            JOIN brands b ON fi.brand_id = b.id
            JOIN categories c ON fi.category_id = c.id
            LEFT JOIN item_tags it ON fi.id = it.item_id
            LEFT JOIN tags t ON it.tag_id = t.id
            WHERE fi.is_active = TRUE
            AND fi.id NOT IN (
                SELECT item_id FROM user_interactions 
                WHERE user_id = ? AND interaction_type IN ('like', 'dislike')
            )
        `;
        
        const params = [avgPrice, priceRange, ...Object.keys(seasonScores), userId];
        
        // Add user preference filters if available
        if (userPrefs) {
            if (userPrefs.preferred_price_min && userPrefs.preferred_price_max) {
                sql += ' AND fi.price BETWEEN ? AND ?';
                params.push(userPrefs.preferred_price_min, userPrefs.preferred_price_max);
            }
            
            if (userPrefs.preferred_gender && userPrefs.preferred_gender !== 'all') {
                sql += ' AND (fi.gender = ? OR fi.gender = "unisex")';
                params.push(userPrefs.preferred_gender);
            }
        }
        
        sql += `
            GROUP BY fi.id
            ORDER BY recommendation_score DESC, RAND()
            LIMIT ?
        `;
        
        params.push(parseInt(limit));
        
        const items = await dbQuery(sql, params);
        
        const formattedItems = items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            currency: item.currency,
            imageUrl: item.image_url,
            colors: [item.color_primary, item.color_secondary].filter(Boolean),
            season: item.season,
            gender: item.gender,
            brand: {
                name: item.brand_name,
                logo: item.brand_logo
            },
            category: item.category_name,
            tags: item.tags ? item.tags.split(',') : [],
            score: item.recommendation_score
        }));
        
        res.json({
            success: true,
            data: {
                items: formattedItems,
                count: formattedItems.length,
                recommendationBasis: {
                    avgPrice: Math.round(avgPrice),
                    topBrands: Object.keys(brandScores).slice(0, 3),
                    topCategories: Object.keys(categoryScores).slice(0, 3)
                }
            }
        });
        
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get recommendations'
        });
    }
});

// Get categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await dbQuery('SELECT id, name, description FROM categories ORDER BY name');
        
        res.json({
            success: true,
            data: { categories }
        });
        
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get categories'
        });
    }
});

// Get brands
router.get('/brands', async (req, res) => {
    try {
        const brands = await dbQuery('SELECT id, name, logo_url, website FROM brands ORDER BY name');
        
        res.json({
            success: true,
            data: { brands }
        });
        
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get brands'
        });
    }
});

// Get item details
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const itemId = req.params.id;
        const userId = req.user.id;
        
        const item = await queryOne(`
            SELECT 
                fi.id,
                fi.name,
                fi.description,
                fi.price,
                fi.currency,
                fi.image_url,
                fi.color_primary,
                fi.color_secondary,
                fi.season,
                fi.gender,
                b.name as brand_name,
                b.logo_url as brand_logo,
                b.website as brand_website,
                c.name as category_name,
                GROUP_CONCAT(t.name) as tags
            FROM fashion_items fi
            JOIN brands b ON fi.brand_id = b.id
            JOIN categories c ON fi.category_id = c.id
            LEFT JOIN item_tags it ON fi.id = it.item_id
            LEFT JOIN tags t ON it.tag_id = t.id
            WHERE fi.id = ? AND fi.is_active = TRUE
            GROUP BY fi.id
        `, [itemId]);
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }
        
        // Get user's interaction with this item
        const interaction = await queryOne(
            'SELECT interaction_type FROM user_interactions WHERE user_id = ? AND item_id = ?',
            [userId, itemId]
        );
        
        const formattedItem = {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            currency: item.currency,
            imageUrl: item.image_url,
            colors: [item.color_primary, item.color_secondary].filter(Boolean),
            season: item.season,
            gender: item.gender,
            brand: {
                name: item.brand_name,
                logo: item.brand_logo,
                website: item.brand_website
            },
            category: item.category_name,
            tags: item.tags ? item.tags.split(',') : [],
            userInteraction: interaction ? interaction.interaction_type : null
        };
        
        res.json({
            success: true,
            data: { item: formattedItem }
        });
        
    } catch (error) {
        console.error('Get item details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get item details'
        });
    }
});

module.exports = router;