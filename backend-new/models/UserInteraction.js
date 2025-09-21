const { query, queryOne } = require('../config/database');

class UserInteraction {
    // Record user interaction (like, pass, save)
    static async create(userId, itemId, interactionType) {
        try {
            const sql = `
                INSERT INTO user_interactions (user_id, item_id, interaction_type)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    interaction_type = VALUES(interaction_type),
                    created_at = CURRENT_TIMESTAMP
            `;

            await query(sql, [userId, itemId, interactionType]);
            return { success: true };
        } catch (error) {
            console.error('Error creating user interaction:', error);
            throw error;
        }
    }

    // Get user's liked items
    static async getLikedItems(userId, limit = 20, offset = 0) {
        try {
            const sql = `
                SELECT fi.*, ui.created_at as liked_at
                FROM fashion_items fi
                JOIN user_interactions ui ON fi.id = ui.item_id
                WHERE ui.user_id = ? AND ui.interaction_type = 'like'
                ORDER BY ui.created_at DESC
                LIMIT ? OFFSET ?
            `;

            return await query(sql, [userId, limit, offset]);
        } catch (error) {
            console.error('Error getting liked items:', error);
            throw error;
        }
    }

    // Get user's saved items
    static async getSavedItems(userId, limit = 20, offset = 0) {
        try {
            const sql = `
                SELECT fi.*, ui.created_at as saved_at
                FROM fashion_items fi
                JOIN user_interactions ui ON fi.id = ui.item_id
                WHERE ui.user_id = ? AND ui.interaction_type = 'save'
                ORDER BY ui.created_at DESC
                LIMIT ? OFFSET ?
            `;

            return await query(sql, [userId, limit, offset]);
        } catch (error) {
            console.error('Error getting saved items:', error);
            throw error;
        }
    }

    // Get user interaction for specific item
    static async getUserInteraction(userId, itemId) {
        try {
            const sql = `
                SELECT interaction_type, created_at
                FROM user_interactions
                WHERE user_id = ? AND item_id = ?
            `;

            return await queryOne(sql, [userId, itemId]);
        } catch (error) {
            console.error('Error getting user interaction:', error);
            throw error;
        }
    }

    // Delete user interaction
    static async delete(userId, itemId) {
        try {
            const sql = 'DELETE FROM user_interactions WHERE user_id = ? AND item_id = ?';
            const result = await query(sql, [userId, itemId]);
            return { success: result.affectedRows > 0 };
        } catch (error) {
            console.error('Error deleting user interaction:', error);
            throw error;
        }
    }

    // Get user interaction stats
    static async getUserStats(userId) {
        try {
            const sql = `
                SELECT
                    interaction_type,
                    COUNT(*) as count
                FROM user_interactions
                WHERE user_id = ?
                GROUP BY interaction_type
            `;

            const stats = await query(sql, [userId]);
            const result = { likes: 0, passes: 0, saves: 0 };

            stats.forEach(stat => {
                result[stat.interaction_type + 's'] = stat.count;
            });

            return result;
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }
}

module.exports = UserInteraction;