const db = require('../configs/pg.config');


exports.createTelegramLog = async ({ userId, messageContent }) => {
    try {
        const result = await db.query(
            `INSERT INTO telegram_logs (user_id, message_content)
            VALUES ($1, $2)
            RETURNING *`,
            [userId, messageContent]
        );
        
        return result.rows[0];
    } catch (error) {
        console.error('Error in createTelegramLog repository:', error);
        throw error;
    }
};


exports.getUserTelegramId = async (userId) => {
    try {
        const result = await db.query(
            'SELECT telegram_id FROM users WHERE user_id = $1 AND telegram_id IS NOT NULL',
            [userId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0].telegram_id;
    } catch (error) {
        console.error('Error in getUserTelegramId repository:', error);
        throw error;
    }
};


exports.hasStreakRewardBeenSent = async (userId, streakValue) => {
    try {
        const result = await db.query(
            `SELECT * FROM telegram_logs 
            WHERE user_id = $1 
            AND message_content LIKE $2
            LIMIT 1`,
            [userId, `%${streakValue}-day streak milestone%`]
        );
        
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error in hasStreakRewardBeenSent repository:', error);
        throw error;
    }
};
