const db = require('../configs/pg.config');
const redis = require('../configs/redis.config');
const { REDIS_TTL_LOGS } = process.env;


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
            
            await redis.delAsync(`today_log:${userId}`);
            await redis.delAsync(`user_logs:${userId}`);
            console.log(`[Cache Invalidated] Cleared cache for user ${userId} after log update`);
            
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
            
            await redis.delAsync(`today_log:${userId}`);
            await redis.delAsync(`user_logs:${userId}`);
            console.log(`[Cache Invalidated] Cleared cache for user ${userId} after new log creation`);
            
            return result.rows[0];
        }
    } catch (error) {
        console.error('Error in createDailyLog repository:', error);
        throw error;
    }
};

exports.getTodayLogByUserId = async (userId) => {
    try {
        const cacheKey = `today_log:${userId}`;
        const cachedLog = await redis.getAsync(cacheKey);
        
        if (cachedLog) {
            console.log(`[Cache Hit] Retrieved today's log for user ${userId} from Redis cache`);
            const parsedLog = JSON.parse(cachedLog);
            
            if (parsedLog && parsedLog.date) {
                const dateStr = new Date(parsedLog.date).toLocaleDateString('en-CA', { 
                    timeZone: 'Asia/Jakarta' 
                });
                parsedLog.date_formatted = dateStr;
            }
            
            return parsedLog;
        }
        
        console.log(`[Cache Miss] Today's log for user ${userId} not found in cache, fetching from database`);
        
        const result = await db.query(
            `SELECT *, 
            TO_CHAR(date AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') as date_formatted 
            FROM daily_logs 
            WHERE user_id = $1 AND DATE(date AT TIME ZONE 'Asia/Jakarta') = CURRENT_DATE AT TIME ZONE 'Asia/Jakarta'`,
            [userId]
        );

        console.log(result.rows);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        const log = result.rows[0];
        
        await redis.setAsync(
            cacheKey,
            JSON.stringify(log),
            { EX: parseInt(REDIS_TTL_LOGS) || 1800 } 
        );
        console.log(`[Cache Set] Stored today's log for user ${userId} in Redis cache`);
        
        return log;
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
        
        const updatedLog = result.rows[0];
        
        await redis.delAsync(`today_log:${updatedLog.user_id}`);
        await redis.delAsync(`user_logs:${updatedLog.user_id}`);
        console.log(`[Cache Invalidated] Cleared cache for user ${updatedLog.user_id} after log update`);
        
        return updatedLog;
    } catch (error) {
        console.error('Error in updateDailyLog repository:', error);
        throw error;
    }
};

exports.updateUserStreak = async (userId) => {
    try {
        const todayLog = await this.getTodayLogByUserId(userId);
        
        if (todayLog && todayLog.log_id) {
            const currentStreak = await db.query(
                `SELECT streak_counter FROM users WHERE user_id = $1`,
                [userId]
            );
            return currentStreak.rows[0];
        }
        
        const lastLog = await db.query(
            `SELECT 
                date,
                TO_CHAR(date AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') as date_formatted 
             FROM daily_logs 
             WHERE user_id = $1 AND date < (CURRENT_DATE AT TIME ZONE 'Asia/Jakarta')
             ORDER BY date DESC
             LIMIT 1`,
            [userId]
        );
          if (lastLog.rows.length > 0) {
            const diffResult = await db.query(
                `SELECT 
                    (CURRENT_DATE AT TIME ZONE 'Asia/Jakarta' - 
                    (SELECT date AT TIME ZONE 'Asia/Jakarta' FROM daily_logs 
                     WHERE user_id = $1 
                     ORDER BY date DESC 
                     LIMIT 1)) AS days_difference`,
                [userId]
            );
            
            const daysDifference = parseInt(diffResult.rows[0].days_difference);
            console.log(`[Streak] Days difference for user ${userId}: ${daysDifference}`);
            
            let result;
            if (daysDifference === 1) {
                result = await db.query(
                    `UPDATE users 
                     SET streak_counter = streak_counter + 1 
                     WHERE user_id = $1 
                     RETURNING streak_counter`,
                    [userId]
                );
            } else {
                result = await db.query(
                    `UPDATE users 
                     SET streak_counter = 1 
                     WHERE user_id = $1 
                     RETURNING streak_counter`,
                    [userId]
                );
            }
            
            console.log(`[Streak] Updated streak for user ${userId}: ${JSON.stringify(result.rows[0])}`);
            return result.rows[0];
        } else {
            const result = await db.query(
                `UPDATE users
                SET streak_counter = 1
                WHERE user_id = $1
                RETURNING streak_counter`,
                [userId]
            );
            console.log(`[Streak] First log for user ${userId}, setting streak to 1`);
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
        
        const updatedLog = result.rows[0];
        
        await redis.delAsync(`today_log:${updatedLog.user_id}`);
        await redis.delAsync(`user_logs:${updatedLog.user_id}`);
        console.log(`[Cache Invalidated] Cleared cache for user ${updatedLog.user_id} after mood update`);
        
        return updatedLog;
    } catch (error) {
        console.error('Error in updateDailyLogMood repository:', error);
        throw error;
    }
};


exports.getDailyLogsByUserId = async (userId) => {
    try {
        const cacheKey = `user_logs:${userId}`;
        const cachedLogs = await redis.getAsync(cacheKey);
        
        if (cachedLogs) {
            console.log(`[Cache Hit] Retrieved logs for user ${userId} from Redis cache`);
            const parsedLogs = JSON.parse(cachedLogs);
            
            // Ensure proper date formatting for cached logs before returning
            parsedLogs.forEach(log => {
                if (log.date) {
                    // Convert date string to Date object in Jakarta timezone
                    const dateStr = new Date(log.date).toLocaleDateString('en-CA', { 
                        timeZone: 'Asia/Jakarta' 
                    });
                    log.date_formatted = dateStr; // Add a formatted date property for consistency
                }
            });
            
            return parsedLogs;
        }
        
        console.log(`[Cache Miss] Logs for user ${userId} not found in cache, fetching from database`);
        
        const result = await db.query(
            `SELECT dl.*,
            TO_CHAR(dl.date AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') as date_formatted
            FROM daily_logs dl
            WHERE dl.user_id = $1
            ORDER BY dl.date DESC, dl.time DESC`,
            [userId]
        );

        console.log(result.rows);
        
        const logs = result.rows;
        
        await redis.setAsync(
            cacheKey,
            JSON.stringify(logs),
            { EX: parseInt(REDIS_TTL_LOGS) || 1800 } 
        );
        console.log(`[Cache Set] Stored logs for user ${userId} in Redis cache`);
        
        return logs;
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
            AND DATE(date AT TIME ZONE 'Asia/Jakarta') = CURRENT_DATE AT TIME ZONE 'Asia/Jakarta'
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
            `SELECT dl.*,
            TO_CHAR(dl.date AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') as date_formatted
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
        const logQuery = await db.query(
            'SELECT user_id FROM daily_logs WHERE log_id = $1',
            [logId]
        );
        
        if (logQuery.rows.length === 0) {
            return null;
        }
        
        const userId = logQuery.rows[0].user_id;
        
        const result = await db.query(
            'DELETE FROM daily_logs WHERE log_id = $1 RETURNING *',
            [logId]
        );
        
        if (result.rows.length === 0) {
            return null;
        }
        
        await redis.delAsync(`today_log:${userId}`);
        await redis.delAsync(`user_logs:${userId}`);
        console.log(`[Cache Invalidated] Cleared cache for user ${userId} after log deletion`);
        
        return result.rows[0];
    } catch (error) {
        console.error('Error in deleteDailyLog repository:', error);
        throw error;
    }
};
