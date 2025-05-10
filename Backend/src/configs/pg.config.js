const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.PG_CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false,
    },
});

const query = async (text, params) => {
    const client = await pool.connect();
    try {
        const res = await client.query(text, params);
        return res;
    } finally {
        client.release();
    }
};

const connect = async () => {
    try {
        const client = await pool.connect();
        console.log("[v] Database connected");
        client.release();
    } catch (err) {
        console.log("[!] Database connection gagal\n" + err);
    }
};

module.exports = {
    query,
    connect,
    pool,
};
