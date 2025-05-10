const db = require('../configs/pg.config');


exports.createDailyLog = async ({ userId, activity, day_description, mood, responseId }) => {
    try {
        const today = new Date().toISOString().split('T')[0];       
        const existingLog = await db.query(
            'SELECT * FROM daily_logs WHERE user_id = $1 AND date = $2',
            [userId, today]
        );        if (existingLog.rows.length > 0) {
            const result = await db.query(
                `UPDATE daily_logs 
                SET activity = $1, day_description = $2, mood = $3, response_id = $4
                WHERE user_id = $5 AND date = $6
                RETURNING *`,
                [activity, day_description, mood, responseId, userId, today]
            );
            return result.rows[0];        } else {
            const result = await db.query(
                `INSERT INTO daily_logs 
                (user_id, date, activity, day_description, mood, response_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [userId, today, activity, day_description, mood, responseId]
            );
            return result.rows[0];
        }
    } catch (error) {
        console.error('Error in createDailyLog repository:', error);
        throw error;
    }
};


exports.updateDailyLogMood = async ({ logId, mood, responseId }) => {
    try {
        const result = await db.query(
            `UPDATE daily_logs
            SET mood = $1, response_id = $2
            WHERE log_id = $3
            RETURNING *`,
            [mood, responseId, logId]
        );
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error in updateDailyLogMood repository:', error);
        throw error;
    }
};


exports.getDailyLogsByUserId = async (userId) => {
    try {
        const result = await db.query(
            `SELECT dl.*, lr.response, lr.message
            FROM daily_logs dl
            LEFT JOIN llm_responses lr ON dl.response_id = lr.response_id
            WHERE dl.user_id = $1
            ORDER BY dl.date DESC`,
            [userId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error in getDailyLogsByUserId repository:', error);
        throw error;
    }
};


exports.getDailyLogById = async (logId) => {
    try {
        const result = await db.query(
            `SELECT dl.*, lr.response, lr.message
            FROM daily_logs dl
            LEFT JOIN llm_responses lr ON dl.response_id = lr.response_id
            WHERE dl.log_id = $1`,
            [logId]
        );
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error in getDailyLogById repository:', error);
        throw error;
    }
};


exports.deleteDailyLog = async (logId) => {
    try {
        const result = await db.query(
            'DELETE FROM daily_logs WHERE log_id = $1 RETURNING *',
            [logId]
        );
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error in deleteDailyLog repository:', error);
        throw error;
    }
};
