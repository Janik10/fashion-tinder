const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const dataDir = path.join(__dirname, 'data');

// In-memory storage for testing
let fashionItems = [];

// CSV mapping functions
const csvMappings = {
    alo_yoga: (row) => ({
        id: `alo_${row.name?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: row.name,
        brand: 'Alo Yoga',
        price: parseFloat(row.price?.replace('$', '')) || null,
        imageUrl: row.image_url,
        productUrl: row.product_url,
        category: 'Activewear',
        colors: row.colors_available ? row.colors_available.split(',').slice(0, 3) : ['#E8E8E8', '#F5F5F5', '#FFFFFF'],
        tags: ['yoga', 'activewear', 'fitness'],
        availability: 'In Stock'
    }),

    gymshark: (row) => ({
        id: row.product_id || `gymshark_${row.name?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: row.name,
        brand: 'Gymshark',
        price: parseFloat(row.price?.replace('$', '')) || null,
        imageUrl: row.image_url,
        productUrl: row.url,
        category: 'Fitness',
        colors: row.color ? [row.color] : ['#E8E8E8', '#F5F5F5', '#FFFFFF'],
        tags: row.tags ? row.tags.split(',') : ['fitness', 'gym', 'activewear'],
        availability: row.availability || 'In Stock'
    }),

    cupshe: (row) => ({
        id: `cupshe_${row.name?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: row.name,
        brand: 'Cupshe',
        price: parseFloat(row.price?.replace('$', '')) || null,
        imageUrl: row.image_url,
        productUrl: row.product_url,
        category: 'Swimwear',
        colors: row.colors_available ? row.colors_available.split(',').slice(0, 3) : ['#E8E8E8', '#F5F5F5', '#FFFFFF'],
        tags: ['swimwear', 'beach', 'summer'],
        availability: 'In Stock'
    }),

    edikted: (row) => ({
        id: `edikted_${row.name?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: row.name,
        brand: 'Edikted',
        price: parseFloat(row.price?.replace('$', '')) || null,
        imageUrl: row.image_url,
        productUrl: row.product_url,
        category: 'Fashion',
        colors: row.colors_available ? row.colors_available.split(',').slice(0, 3) : ['#E8E8E8', '#F5F5F5', '#FFFFFF'],
        tags: ['trendy', 'fashion', 'style'],
        availability: 'In Stock'
    }),

    nakd: (row) => ({
        id: `nakd_${row.name?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: row.name,
        brand: 'NA-KD',
        price: parseFloat(row.price?.replace('$', '')) || null,
        imageUrl: row.image_url,
        productUrl: row.product_url,
        category: 'Fashion',
        colors: row.colors_available ? row.colors_available.split(',').slice(0, 3) : ['#E8E8E8', '#F5F5F5', '#FFFFFF'],
        tags: ['fashion', 'style', 'trendy'],
        availability: 'In Stock'
    }),

    princess_polly: (row) => ({
        id: `princess_polly_${row.name?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: row.name,
        brand: 'Princess Polly',
        price: parseFloat(row.price?.replace('$', '')) || null,
        imageUrl: row.image_url,
        productUrl: row.product_url,
        category: 'Fashion',
        colors: row.colors_available ? row.colors_available.split(',').slice(0, 3) : ['#E8E8E8', '#F5F5F5', '#FFFFFF'],
        tags: ['fashion', 'style', 'trendy'],
        availability: 'In Stock'
    }),

    vuori: (row) => ({
        id: `vuori_${row.name?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: row.name,
        brand: 'Vuori',
        price: parseFloat(row.price?.replace('$', '')) || null,
        imageUrl: row.image_url,
        productUrl: row.product_url,
        category: 'Activewear',
        colors: row.colors_available ? row.colors_available.split(',').slice(0, 3) : ['#E8E8E8', '#F5F5F5', '#FFFFFF'],
        tags: ['activewear', 'lifestyle', 'comfort'],
        availability: 'In Stock'
    }),

    altardstate: (row) => ({
        id: `altardstate_${row.name?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: row.name,
        brand: 'Altar\'d State',
        price: parseFloat(row.price?.replace('$', '')) || null,
        imageUrl: row.image_url,
        productUrl: row.product_url,
        category: 'Fashion',
        colors: row.colors_available ? row.colors_available.split(',').slice(0, 3) : ['#E8E8E8', '#F5F5F5', '#FFFFFF'],
        tags: ['fashion', 'alternative', 'style'],
        availability: 'In Stock'
    })
};

async function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(parse({ columns: true, skip_empty_lines: true }))
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

async function loadAllData() {
    console.log('🚀 Loading CSV data into memory...');

    try {
        const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.csv'));
        console.log(`📁 Found ${files.length} CSV files`);

        let totalLoaded = 0;

        for (const file of files) {
            console.log(`📄 Processing ${file}...`);
            const filePath = path.join(dataDir, file);
            const rawData = await readCSV(filePath);

            const brandKey = file.replace('_products.csv', '').replace('.csv', '');
            const mappingFunction = csvMappings[brandKey];

            if (!mappingFunction) {
                console.log(`⚠️  No mapping found for: ${brandKey}`);
                continue;
            }

            const transformedData = rawData
                .map(mappingFunction)
                .filter(item => item.name && item.imageUrl);

            fashionItems.push(...transformedData);
            totalLoaded += transformedData.length;
            console.log(`✅ Loaded ${transformedData.length} items from ${file}`);
        }

        console.log(`🎯 Total items loaded: ${totalLoaded}`);
        return true;

    } catch (error) {
        console.error('❌ Failed to load data:', error.message);
        return false;
    }
}

// In-memory storage for user interactions (for testing)
const userInteractions = new Map();
const userSavedItems = new Map();

function getFeedForUser(userId, limit = 20, offset = 0, userPreferences = null) {
    // Get items user hasn't interacted with
    const userActions = userInteractions.get(userId) || new Set();
    let availableItems = fashionItems.filter(item => !userActions.has(item.id));

    // Apply user preferences if available
    if (userPreferences) {
        const { style, size, brands } = userPreferences;

        // Filter by preferred brands
        if (brands && brands.length > 0) {
            const preferredItems = availableItems.filter(item =>
                brands.some(brand => brand.toLowerCase() === item.brand.toLowerCase())
            );
            // If we have preferred brand items, prioritize them
            if (preferredItems.length > 0) {
                // 70% preferred brands, 30% other items
                const preferredCount = Math.ceil(limit * 0.7);
                const otherCount = limit - preferredCount;

                const shuffledPreferred = preferredItems.sort(() => 0.5 - Math.random());
                const otherItems = availableItems.filter(item =>
                    !brands.some(brand => brand.toLowerCase() === item.brand.toLowerCase())
                );
                const shuffledOther = otherItems.sort(() => 0.5 - Math.random());

                availableItems = [
                    ...shuffledPreferred.slice(0, preferredCount),
                    ...shuffledOther.slice(0, otherCount)
                ];
            }
        }

        // Filter by style preferences (if we have style tags)
        if (style && style !== 'Not set') {
            const styleKeywords = style.toLowerCase().split(' ');
            const styleFilteredItems = availableItems.filter(item =>
                item.tags.some(tag =>
                    styleKeywords.some(keyword => tag.toLowerCase().includes(keyword))
                )
            );

            // If we have style-matching items, prioritize them
            if (styleFilteredItems.length > 0) {
                // 60% style matches, 40% other items
                const styleCount = Math.ceil(availableItems.length * 0.6);
                const otherCount = availableItems.length - styleCount;

                const shuffledStyle = styleFilteredItems.sort(() => 0.5 - Math.random());
                const otherItems = availableItems.filter(item =>
                    !item.tags.some(tag =>
                        styleKeywords.some(keyword => tag.toLowerCase().includes(keyword))
                    )
                );
                const shuffledOther = otherItems.sort(() => 0.5 - Math.random());

                availableItems = [
                    ...shuffledStyle.slice(0, styleCount),
                    ...shuffledOther.slice(0, otherCount)
                ];
            }
        }
    }

    // Final shuffle and return subset
    const shuffled = availableItems.sort(() => 0.5 - Math.random());
    return shuffled.slice(offset, offset + limit);
}

function recordInteraction(userId, itemId, action) {
    if (!userInteractions.has(userId)) {
        userInteractions.set(userId, new Set());
    }
    userInteractions.get(userId).add(itemId);

    // Track saved items separately
    if (action === 'save' || action === 'like') {
        if (!userSavedItems.has(userId)) {
            userSavedItems.set(userId, new Map());
        }
        userSavedItems.get(userId).set(itemId, {
            itemId,
            action,
            savedAt: new Date().toISOString()
        });
    }

    console.log(`👤 User ${userId} ${action}d item ${itemId}`);
}

function getSavedItemsForUser(userId) {
    const savedItems = userSavedItems.get(userId) || new Map();
    const result = [];

    for (const [itemId, saveData] of savedItems) {
        const item = getItemById(itemId);
        if (item) {
            result.push({
                item,
                savedAt: saveData.savedAt,
                action: saveData.action
            });
        }
    }

    // Sort by most recently saved
    return result.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
}

function getItemById(id) {
    return fashionItems.find(item => item.id === id);
}

module.exports = {
    loadAllData,
    getFeedForUser,
    recordInteraction,
    getItemById,
    getSavedItemsForUser,
    getTotalItems: () => fashionItems.length
};