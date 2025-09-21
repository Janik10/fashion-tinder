const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config();

const { query, transaction, testConnection } = require('../config/database');

// CSV import mapping for different brands
const brandConfigs = {
    gymshark: {
        file: 'gymshark_products.csv',
        brand: 'Gymshark',
        categoryMap: {
            'sports-bra': 'Sports Bras',
            'crop-top': 'Crop Tops',
            'leggings': 'Leggings',
            'shorts': 'Shorts',
            'hoodies': 'Hoodies',
            'default': 'Activewear'
        }
    },
    alo_yoga: {
        file: 'alo_yoga_products.csv',
        brand: 'Alo Yoga',
        categoryMap: {
            'default': 'Yoga Wear'
        }
    },
    altardstate: {
        file: 'altardstate_products.csv',
        brand: 'Altard State',
        categoryMap: {
            'default': 'Fashion'
        }
    },
    cupshe: {
        file: 'cupshe_products.csv',
        brand: 'Cupshe',
        categoryMap: {
            'default': 'Swimwear'
        }
    },
    edikted: {
        file: 'edikted_products.csv',
        brand: 'Edikted',
        categoryMap: {
            'default': 'Fashion'
        }
    },
    nakd: {
        file: 'nakd_products.csv',
        brand: 'Nakd',
        categoryMap: {
            'default': 'Fashion'
        }
    },
    princess_polly: {
        file: 'princess_polly.csv',
        brand: 'Princess Polly',
        categoryMap: {
            'default': 'Fashion'
        }
    },
    vuori: {
        file: 'vuori_products.csv',
        brand: 'Vuori',
        categoryMap: {
            'default': 'Athletic Wear'
        }
    }
};

// Helper functions
function extractPrice(row) {
    // Check different price column names across CSV files
    const priceFields = ['price', 'current_price', 'sale_price', 'original_price'];

    for (const field of priceFields) {
        if (row[field] && row[field].toString().trim()) {
            const match = row[field].toString().match(/[\d.]+/);
            if (match) {
                return parseFloat(match[0]);
            }
        }
    }

    // Fallback: try to find any field containing 'price'
    for (const [key, value] of Object.entries(row)) {
        if (key.toLowerCase().includes('price') && value && value.toString().trim()) {
            const match = value.toString().match(/[\d.]+/);
            if (match) {
                return parseFloat(match[0]);
            }
        }
    }

    return 0;
}

function extractColors(colorStr) {
    if (!colorStr) return ['#E8E8E8', '#F5F5F5'];
    
    const colorMap = {
        'black': '#000000',
        'white': '#FFFFFF',
        'blue': '#0066CC',
        'navy': '#000080',
        'red': '#CC0000',
        'pink': '#FF69B4',
        'purple': '#800080',
        'green': '#008000',
        'yellow': '#FFFF00',
        'orange': '#FFA500',
        'brown': '#964B00',
        'grey': '#808080',
        'gray': '#808080'
    };
    
    const colors = [];
    const lowerColor = colorStr.toLowerCase();
    
    for (const [name, hex] of Object.entries(colorMap)) {
        if (lowerColor.includes(name)) {
            colors.push(hex);
        }
    }
    
    return colors.length > 0 ? colors.slice(0, 2) : ['#E8E8E8', '#F5F5F5'];
}

function getCategoryFromName(name, categoryMap) {
    const lowerName = name.toLowerCase();
    
    for (const [key, category] of Object.entries(categoryMap)) {
        if (key !== 'default' && lowerName.includes(key.replace('-', ' '))) {
            return category;
        }
    }
    
    return categoryMap.default;
}

function extractTags(row) {
    const tags = [];
    
    // Add fit as tag
    if (row.fit) tags.push(row.fit);
    
    // Add tags field if exists
    if (row.tags) {
        const tagList = row.tags.split(',').map(t => t.trim()).filter(t => t);
        tags.push(...tagList);
    }
    
    // Add availability
    if (row.availability) tags.push(row.availability);
    
    return [...new Set(tags)]; // Remove duplicates
}

async function setupBrandsAndCategories() {
    console.log('Setting up brands and categories...');
    
    const brands = [];
    const categories = new Set();
    
    // Collect all brands and categories
    for (const config of Object.values(brandConfigs)) {
        brands.push(config.brand);
        Object.values(config.categoryMap).forEach(cat => categories.add(cat));
    }
    
    // Insert brands
    for (const brandName of brands) {
        await query(`
            INSERT IGNORE INTO brands (name) VALUES (?)
        `, [brandName]);
    }
    
    // Insert categories
    for (const categoryName of categories) {
        await query(`
            INSERT IGNORE INTO categories (name) VALUES (?)
        `, [categoryName]);
    }
    
    console.log(`✅ Setup ${brands.length} brands and ${categories.size} categories`);
}

async function importCSV(brandKey, config) {
    const filePath = path.join(__dirname, '../data', config.file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return 0;
    }
    
    console.log(`📁 Importing ${config.brand} from ${config.file}...`);
    
    // Get brand and category IDs
    const brand = await query('SELECT id FROM brands WHERE name = ?', [config.brand]);
    if (!brand.length) {
        console.error(`❌ Brand not found: ${config.brand}`);
        return 0;
    }
    const brandId = brand[0].id;
    
    let importCount = 0;
    const items = [];
    
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                items.push(row);
            })
            .on('end', async () => {
                try {
                    await transaction(async (connection) => {
                        for (const row of items) {
                            if (!row.name || !row.image_url) continue;
                            
                            // Determine category
                            const categoryName = getCategoryFromName(row.name, config.categoryMap);
                            const categoryResult = await connection.execute(
                                'SELECT id FROM categories WHERE name = ?',
                                [categoryName]
                            );
                            
                            if (!categoryResult[0].length) continue;
                            const categoryId = categoryResult[0][0].id;
                            
                            // Extract data
                            const price = extractPrice(row);
                            const colors = extractColors(row.color || row.current_color || row.available_colors);
                            const tags = extractTags(row);
                            
                            // Insert fashion item
                            const [itemResult] = await connection.execute(`
                                INSERT INTO fashion_items 
                                (name, brand_id, category_id, description, price, image_url, 
                                 color_primary, color_secondary, gender, is_active)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unisex', TRUE)
                            `, [
                                row.name,
                                brandId,
                                categoryId,
                                row.name, // Use name as description for now
                                price,
                                row.image_url,
                                colors[0] || '#E8E8E8',
                                colors[1] || null
                            ]);
                            
                            const itemId = itemResult.insertId;
                            
                            // Insert tags
                            for (const tagName of tags) {
                                if (!tagName) continue;
                                
                                // Insert tag if not exists
                                await connection.execute(
                                    'INSERT IGNORE INTO tags (name) VALUES (?)',
                                    [tagName]
                                );
                                
                                // Get tag ID
                                const [tagResult] = await connection.execute(
                                    'SELECT id FROM tags WHERE name = ?',
                                    [tagName]
                                );
                                
                                if (tagResult.length) {
                                    await connection.execute(
                                        'INSERT IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)',
                                        [itemId, tagResult[0].id]
                                    );
                                }
                            }
                            
                            importCount++;
                        }
                    });
                    
                    console.log(`✅ Imported ${importCount} items for ${config.brand}`);
                    resolve(importCount);
                } catch (error) {
                    console.error(`❌ Error importing ${config.brand}:`, error);
                    reject(error);
                }
            })
            .on('error', reject);
    });
}

async function main() {
    try {
        console.log('🚀 Starting Fashion Tinder data import...\n');
        
        // Test database connection
        const connected = await testConnection();
        if (!connected) {
            console.error('❌ Database connection failed');
            process.exit(1);
        }
        
        // Setup brands and categories
        await setupBrandsAndCategories();
        
        // Import each brand
        let totalImported = 0;
        for (const [brandKey, config] of Object.entries(brandConfigs)) {
            try {
                const count = await importCSV(brandKey, config);
                totalImported += count;
            } catch (error) {
                console.error(`❌ Failed to import ${config.brand}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Import complete! Total items imported: ${totalImported}`);
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Import failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };