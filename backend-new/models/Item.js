const { query, queryOne } = require('../config/database');

class Item {
    // Get items for feed with pagination
    static async getFeed(userId, limit = 20, offset = 0) {
        try {
            // Get items that user hasn't interacted with
            const sql = `
                SELECT fi.*
                FROM fashion_items fi
                LEFT JOIN user_interactions ui ON fi.id = ui.item_id AND ui.user_id = ?
                WHERE ui.item_id IS NULL
                ORDER BY RAND()
                LIMIT ? OFFSET ?
            `;

            const items = await query(sql, [userId, limit, offset]);

            // Transform the data to match frontend expectations
            return items.map(item => ({
                id: item.id,
                name: item.name,
                brand: item.brand,
                price: item.price,
                imageUrl: item.image_url,
                category: item.category || 'Fashion',
                tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : [],
                colors: item.colors_available ?
                    item.colors_available.split(',').slice(0, 3).map(color => color.trim()) :
                    ['#E8E8E8', '#F5F5F5', '#FFFFFF'],
                fit: item.fit,
                availability: item.availability,
                rating: item.rating,
                reviewCount: item.review_count,
                productUrl: item.product_url
            }));
        } catch (error) {
            console.error('Error getting feed:', error);
            throw error;
        }
    }

    // Get all items (for admin/import purposes)
    static async getAll(limit = 100, offset = 0) {
        try {
            const sql = 'SELECT * FROM fashion_items ORDER BY created_at DESC LIMIT ? OFFSET ?';
            return await query(sql, [limit, offset]);
        } catch (error) {
            console.error('Error getting all items:', error);
            throw error;
        }
    }

    // Get item by ID
    static async getById(id) {
        try {
            const sql = 'SELECT * FROM fashion_items WHERE id = ?';
            return await queryOne(sql, [id]);
        } catch (error) {
            console.error('Error getting item by ID:', error);
            throw error;
        }
    }

    // Create a new item
    static async create(itemData) {
        try {
            const {
                id, name, brand, price, sale_price, image_url, product_url,
                category, fit, colors_available, sizes_available, tags,
                badge, availability, rating, review_count
            } = itemData;

            const sql = `
                INSERT INTO fashion_items (
                    id, name, brand, price, sale_price, image_url, product_url,
                    category, fit, colors_available, sizes_available, tags,
                    badge, availability, rating, review_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    brand = VALUES(brand),
                    price = VALUES(price),
                    sale_price = VALUES(sale_price),
                    image_url = VALUES(image_url),
                    product_url = VALUES(product_url),
                    category = VALUES(category),
                    fit = VALUES(fit),
                    colors_available = VALUES(colors_available),
                    sizes_available = VALUES(sizes_available),
                    tags = VALUES(tags),
                    badge = VALUES(badge),
                    availability = VALUES(availability),
                    rating = VALUES(rating),
                    review_count = VALUES(review_count),
                    updated_at = CURRENT_TIMESTAMP
            `;

            await query(sql, [
                id, name, brand, price, sale_price, image_url, product_url,
                category, fit, colors_available, sizes_available, tags,
                badge, availability, rating, review_count
            ]);

            return { success: true, id };
        } catch (error) {
            console.error('Error creating item:', error);
            throw error;
        }
    }

    // Batch insert items (for CSV import)
    static async batchInsert(items) {
        try {
            const sql = `
                INSERT IGNORE INTO fashion_items (
                    id, name, brand, price, sale_price, image_url, product_url,
                    category, fit, colors_available, sizes_available, tags,
                    badge, availability, rating, review_count
                ) VALUES ?
            `;

            const values = items.map(item => [
                item.id, item.name, item.brand, item.price, item.sale_price,
                item.image_url, item.product_url, item.category, item.fit,
                item.colors_available, item.sizes_available, item.tags,
                item.badge, item.availability, item.rating, item.review_count
            ]);

            const result = await query(sql, [values]);
            return { success: true, insertedCount: result.affectedRows };
        } catch (error) {
            console.error('Error batch inserting items:', error);
            throw error;
        }
    }

    // Delete item
    static async delete(id) {
        try {
            const sql = 'DELETE FROM fashion_items WHERE id = ?';
            const result = await query(sql, [id]);
            return { success: result.affectedRows > 0 };
        } catch (error) {
            console.error('Error deleting item:', error);
            throw error;
        }
    }

    // Get count of all items
    static async getCount() {
        try {
            const sql = 'SELECT COUNT(*) as count FROM fashion_items';
            const result = await queryOne(sql);
            return result.count;
        } catch (error) {
            console.error('Error getting item count:', error);
            throw error;
        }
    }
}

module.exports = Item;