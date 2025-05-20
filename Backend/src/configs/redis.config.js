const redis = require('redis');
const { promisify } = require('util');
require('dotenv').config();

const client = redis.createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT) || 6379
    }
});

client.on('error', err => console.log('[!] Redis Client Error', err));
client.on('connect', () => console.log('[v] Redis Client Connected'));
client.on('ready', () => console.log('[v] Redis Client Ready'));

const connectRedis = async () => {
    try {
        if (!client.isOpen) {
            await client.connect();
        }
        return true;
    } catch (error) {
        console.error('[!] Redis Connection Error:', error);
        return false;
    }
};

module.exports = {
    client,
    connectRedis,
    getAsync: async (key) => {
        await connectRedis();
        return client.get(key);
    },
    setAsync: async (key, value, options = {}) => {
        await connectRedis();
        return client.set(key, value, options);
    },
    delAsync: async (key) => {
        await connectRedis();
        return client.del(key);
    },
    expireAsync: async (key, seconds) => {
        await connectRedis();
        return client.expire(key, seconds);
    }
};
