const db = require('../configs/pg.config');


exports.createDailyLog = async ({ userId, day_description, mood }) => {
    try {
        const existingLog = await db.query(
            `SELECT * FROM daily_logs 
            WHERE user_id = $1 AND date = (CURRENT_DATE AT TIME ZONE 'Asia/Jakarta')`,
            [userId]
        );
        
        if (existingLog.rows.length > 0) {
            const result = await db.query(
                `UPDATE daily_logs 
                SET day_description = $1, mood = $2, time = (CURRENT_TIME AT TIME ZONE 'Asia/Jakarta')
                WHERE log_id = $3
                RETURNING *`,
                [day_description, mood, existingLog.rows[0].log_id]
            );
            return result.rows[0];
        } 
        else {
            const result = await db.query(
                `INSERT INTO daily_logs 
                (user_id, date, day_description, mood)
                VALUES ($1, (CURRENT_DATE AT TIME ZONE 'Asia/Jakarta'), $2, $3)
                RETURNING *`,
                [userId, day_description, mood]
            );
            return result.rows[0];
        }
    } catch (error) {
        console.error('Error in createDailyLog repository:', error);
        throw error;
    }
};

exports.getTodayLogByUserId = async (userId) => {
    try {
        const result = await db.query(
            `SELECT * FROM daily_logs 
            WHERE user_id = $1 AND date = (CURRENT_DATE AT TIME ZONE 'Asia/Jakarta')`,
            [userId]
        );
        
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error in getTodayLogByUserId repository:', error);
        throw error;
    }
};

exports.updateDailyLog = async ({ logId, day_description, mood }) => {
    try {
        const result = await db.query(
            `UPDATE daily_logs 
            SET day_description = $1, mood = $2, time = (CURRENT_TIME AT TIME ZONE 'Asia/Jakarta')
            WHERE log_id = $3
            RETURNING *`,
            [day_description, mood, logId]
        );
        
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error in updateDailyLog repository:', error);
        throw error;
    }
};

exports.updateUserStreak = async (userId) => {
    try {
        // Check if there's already a log for today
        const todayLog = await this.getTodayLogByUserId(userId);
        
        // If there's already a log for today, we don't need to update the streak
        if (todayLog && todayLog.log_id) {
            // Just get current streak count
            const currentStreak = await db.query(
                `SELECT streak_counter FROM users WHERE user_id = $1`,
                [userId]
            );
            return currentStreak.rows[0];
        }
        
        // Get the most recent log before today
        const lastLog = await db.query(
            `SELECT date FROM daily_logs 
            WHERE user_id = $1 AND date < (CURRENT_DATE AT TIME ZONE 'Asia/Jakarta')
            ORDER BY date DESC
            LIMIT 1`,
            [userId]
        );
        
        if (lastLog.rows.length > 0) {
            const lastLogDate = new Date(lastLog.rows[0].date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Calculate the difference in days
            const diffTime = Math.abs(today - lastLogDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // If the last log was from yesterday, increment the streak
                const result = await db.query(
                    `UPDATE users
                    SET streak_counter = streak_counter + 1
                    WHERE user_id = $1
                    RETURNING streak_counter`,
                    [userId]
                );
                return result.rows[0];
            } else {
                // If the last log was from more than a day ago, reset streak to 1
                const result = await db.query(
                    `UPDATE users
                    SET streak_counter = 1
                    WHERE user_id = $1
                    RETURNING streak_counter`,
                    [userId]
                );
                return result.rows[0];
            }
        } else {
            // First log ever, set streak to 1
            const result = await db.query(
                `UPDATE users
                SET streak_counter = 1
                WHERE user_id = $1
                RETURNING streak_counter`,
                [userId]
            );
            return result.rows[0];
        }
    } catch (error) {
        console.error('Error in updateUserStreak repository:', error);
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


exports.hasPreviousDailyLogToday = async (userId, currentLogId) => {
    try {
        const result = await db.query(
            `SELECT COUNT(*) as count FROM daily_logs 
            WHERE user_id = $1 
            AND date = (CURRENT_DATE AT TIME ZONE 'Asia/Jakarta')
            AND log_id != $2`,
            [userId, currentLogId]
        );
        
        return parseInt(result.rows[0].count) > 0;
    } catch (error) {
        console.error('Error in hasPreviousDailyLogToday repository:', error);
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
