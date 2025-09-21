const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
};

async function setupDatabase() {
    let connection;

    try {
        console.log('🔌 Connecting to MySQL...');
        connection = await mysql.createConnection(dbConfig);

        // Create database if it doesn't exist
        console.log('📦 Creating database...');
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'fashion_tinder'}`);
        await connection.execute(`USE ${process.env.DB_NAME || 'fashion_tinder'}`);

        // Read and execute SQL file
        console.log('📋 Creating tables...');
        const sqlPath = path.join(__dirname, '..', 'sql', 'create_tables.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Split SQL file by semicolons and execute each statement
        const statements = sqlContent.split(';').filter(stmt => stmt.trim());
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.execute(statement);
            }
        }

        console.log('✅ Database setup completed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        return false;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

if (require.main === module) {
    setupDatabase().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { setupDatabase };