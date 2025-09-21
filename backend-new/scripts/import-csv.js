const fs = require('fs');
const path = require('path');
const csv = require('csv-parse');
const { query } = require('../config/database');
const Item = require('../models/Item');
require('dotenv').config();

const dataDir = path.join(__dirname, '..', 'data');

// CSV mapping functions for different brands
const csvMappings = {
    alo_yoga: (row) => ({
        id: `alo_${row.name?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: row.name,
        brand: 'Alo Yoga',
        price: parseFloat(row.price?.replace('$', '')) || null,
        sale_price: row.sale_price ? parseFloat(row.sale_price.replace('$', '')) : null,
        image_url: row.image_url,
        product_url: row.product_url,
        category: 'Activewear',
        colors_available: row.colors_available,
        sizes_available: row.sizes_available,
        tags: 'yoga,activewear,fitness',
        badge: row.badge,
        availability: 'In Stock',
        rating: parseFloat(row.rating) || null,
        review_count: parseInt(row.review_count) || null
    }),

    gymshark: (row) => ({
        id: row.product_id || `gymshark_${row.name?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: row.name,
        brand: 'Gymshark',
        price: parseFloat(row.price?.replace('$', '')) || null,
        sale_price: null,
        image_url: row.image_url,
        product_url: row.url,
        category: 'Fitness',
        fit: row.fit,
        colors_available: row.color,
        sizes_available: null,
        tags: row.tags || 'fitness,gym,activewear',
        badge: null,
        availability: row.availability || 'In Stock',
        rating: null,
        review_count: null
    }),

    cupshe: (row) => ({
        id: `cupshe_${row.name?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: row.name,
        brand: 'Cupshe',
        price: parseFloat(row.price?.replace('$', '')) || null,
        sale_price: row.sale_price ? parseFloat(row.sale_price.replace('$', '')) : null,
        image_url: row.image_url,
        product_url: row.product_url,
        category: 'Swimwear',
        colors_available: row.colors_available,
        sizes_available: row.sizes_available,
        tags: 'swimwear,beach,summer',
        badge: row.badge,
        availability: 'In Stock',
        rating: parseFloat(row.rating) || null,
        review_count: parseInt(row.review_count) || null
    }),

    edikted: (row) => ({
        id: `edikted_${row.name?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: row.name,
        brand: 'Edikted',
        price: parseFloat(row.price?.replace('$', '')) || null,
        sale_price: row.sale_price ? parseFloat(row.sale_price.replace('$', '')) : null,
        image_url: row.image_url,
        product_url: row.product_url,
        category: 'Fashion',
        colors_available: row.colors_available,
        sizes_available: row.sizes_available,
        tags: 'trendy,fashion,style',
        badge: row.badge,
        availability: 'In Stock',
        rating: parseFloat(row.rating) || null,
        review_count: parseInt(row.review_count) || null
    }),

    nakd: (row) => ({
        id: `nakd_${row.name?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: row.name,
        brand: 'NA-KD',
        price: parseFloat(row.price?.replace('$', '')) || null,
        sale_price: row.sale_price ? parseFloat(row.sale_price.replace('$', '')) : null,
        image_url: row.image_url,
        product_url: row.product_url,
        category: 'Fashion',
        colors_available: row.colors_available,
        sizes_available: row.sizes_available,
        tags: 'fashion,style,trendy',
        badge: row.badge,
        availability: 'In Stock',
        rating: parseFloat(row.rating) || null,
        review_count: parseInt(row.review_count) || null
    }),

    princess_polly: (row) => ({
        id: `princess_polly_${row.name?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: row.name,
        brand: 'Princess Polly',
        price: parseFloat(row.price?.replace('$', '')) || null,
        sale_price: row.sale_price ? parseFloat(row.sale_price.replace('$', '')) : null,
        image_url: row.image_url,
        product_url: row.product_url,
        category: 'Fashion',
        colors_available: row.colors_available,
        sizes_available: row.sizes_available,
        tags: 'fashion,style,trendy',
        badge: row.badge,
        availability: 'In Stock',
        rating: parseFloat(row.rating) || null,
        review_count: parseInt(row.review_count) || null
    }),

    vuori: (row) => ({
        id: `vuori_${row.name?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: row.name,
        brand: 'Vuori',
        price: parseFloat(row.price?.replace('$', '')) || null,
        sale_price: row.sale_price ? parseFloat(row.sale_price.replace('$', '')) : null,
        image_url: row.image_url,
        product_url: row.product_url,
        category: 'Activewear',
        colors_available: row.colors_available,
        sizes_available: row.sizes_available,
        tags: 'activewear,lifestyle,comfort',
        badge: row.badge,
        availability: 'In Stock',
        rating: parseFloat(row.rating) || null,
        review_count: parseInt(row.review_count) || null
    }),

    altardstate: (row) => ({
        id: `altardstate_${row.name?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: row.name,
        brand: 'Altar\'d State',
        price: parseFloat(row.price?.replace('$', '')) || null,
        sale_price: row.sale_price ? parseFloat(row.sale_price.replace('$', '')) : null,
        image_url: row.image_url,
        product_url: row.product_url,
        category: 'Fashion',
        colors_available: row.colors_available,
        sizes_available: row.sizes_available,
        tags: 'fashion,alternative,style',
        badge: row.badge,
        availability: 'In Stock',
        rating: parseFloat(row.rating) || null,
        review_count: parseInt(row.review_count) || null
    })
};

async function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv({ columns: true, skip_empty_lines: true }))
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

async function importCSVFile(fileName) {
    const filePath = path.join(dataDir, fileName);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${fileName}`);
        return { success: false, message: 'File not found' };
    }

    console.log(`📄 Processing ${fileName}...`);

    try {
        const rawData = await readCSV(filePath);
        console.log(`📊 Found ${rawData.length} records in ${fileName}`);

        if (rawData.length === 0) {
            return { success: true, imported: 0, message: 'No data to import' };
        }

        // Determine brand from filename
        const brandKey = fileName.replace('_products.csv', '').replace('.csv', '');
        const mappingFunction = csvMappings[brandKey];

        if (!mappingFunction) {
            console.log(`⚠️  No mapping found for brand: ${brandKey}`);
            return { success: false, message: 'No mapping function found' };
        }

        // Transform data
        const transformedData = rawData
            .map(mappingFunction)
            .filter(item => item.name && item.image_url); // Filter out invalid items

        console.log(`✅ Transformed ${transformedData.length} valid items`);

        if (transformedData.length === 0) {
            return { success: true, imported: 0, message: 'No valid data to import' };
        }

        // Import in batches to avoid memory issues
        const batchSize = 100;
        let totalImported = 0;

        for (let i = 0; i < transformedData.length; i += batchSize) {
            const batch = transformedData.slice(i, i + batchSize);

            try {
                const result = await Item.batchInsert(batch);
                totalImported += result.insertedCount || 0;
                console.log(`  📦 Imported batch ${Math.floor(i / batchSize) + 1}: ${result.insertedCount || 0} items`);
            } catch (batchError) {
                console.error(`  ❌ Batch import failed:`, batchError.message);
                // Continue with next batch
            }
        }

        return {
            success: true,
            imported: totalImported,
            total: transformedData.length,
            message: `Successfully imported ${totalImported} items from ${fileName}`
        };

    } catch (error) {
        console.error(`❌ Error importing ${fileName}:`, error.message);
        return { success: false, message: error.message };
    }
}

async function importAllCSVs() {
    console.log('🚀 Starting CSV import process...\n');

    try {
        const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.csv'));
        console.log(`📁 Found ${files.length} CSV files:\n`, files.map(f => `  - ${f}`).join('\n'));

        if (files.length === 0) {
            console.log('❌ No CSV files found in data directory');
            return;
        }

        let totalImported = 0;
        const results = [];

        for (const file of files) {
            const result = await importCSVFile(file);
            results.push({ file, ...result });

            if (result.success) {
                totalImported += result.imported || 0;
            }

            console.log(''); // Add spacing between files
        }

        // Summary
        console.log('🎉 Import Summary:');
        console.log('================');
        results.forEach(({ file, success, imported, total, message }) => {
            const status = success ? '✅' : '❌';
            const count = imported ? `${imported}${total ? `/${total}` : ''}` : '0';
            console.log(`${status} ${file}: ${count} items - ${message}`);
        });
        console.log(`\n🎯 Total items imported: ${totalImported}`);

    } catch (error) {
        console.error('❌ Import process failed:', error.message);
    }
}

// Run import if this file is executed directly
if (require.main === module) {
    importAllCSVs().then(() => {
        process.exit(0);
    }).catch((error) => {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = { importAllCSVs, importCSVFile };