const db = require('../configs/pg.config');


exports.createDailyLog = async ({ userId, day_description, mood }) => {
    try {
        // Use Jakarta date for consistency
        const result = await db.query(
            `INSERT INTO daily_logs 
            (user_id, date, day_description, mood)
            VALUES ($1, (CURRENT_DATE AT TIME ZONE 'Asia/Jakarta'), $2, $3)
            RETURNING *`,
            [userId, day_description, mood]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in createDailyLog repository:', error);
        throw error;
    }
};


exports.updateDailyLogMood = async ({ logId, mood }) => {
    try {
        const result = await db.query(
            `UPDATE daily_logs
            SET mood = $1
            WHERE log_id = $2
            RETURNING *`,
            [mood, logId]
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
            `SELECT dl.*
            FROM daily_logs dl
            WHERE dl.user_id = $1
            ORDER BY dl.date DESC, dl.time DESC`,
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
            `SELECT dl.*
            FROM daily_logs dl
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
