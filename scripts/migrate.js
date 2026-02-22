const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function runMigration() {
    const connectionString = process.env.POSTGRES_URL_NON_POOLING;

    if (!connectionString) {
        console.error('POSTGRES_URL_NON_POOLING not found in .env.local');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database (pooler).');

        const sqlFilePath = path.join(__dirname, '../supabase/migrations/20260222_create_suppliers.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('Running migration...');
        await client.query(sql);

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Error running migration:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
