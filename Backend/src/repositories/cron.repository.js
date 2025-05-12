const db = require('../configs/pg.config');


exports.resetDailyLoginStatus = async () => {
    try {
        // Reset login status at midnight in Jakarta time
        const result = await db.query(
            `UPDATE users SET logged_in_today = FALSE 
             WHERE (CURRENT_DATE AT TIME ZONE 'Asia/Jakarta') > 
                   (last_login AT TIME ZONE 'Asia/Jakarta')::date`
        );

        return result.rowCount;
    } catch (error) {
        console.error('Error in resetDailyLoginStatus repository:', error);
        throw error;
    }
};


exports.getInactiveUsers = async () => {
    try {
        const result = await db.query(
            `SELECT u.user_id, u.username, u.telegram_id 
             FROM users u
             LEFT JOIN daily_logs dl ON u.user_id = dl.user_id 
                AND dl.date = (CURRENT_DATE AT TIME ZONE 'Asia/Jakarta')
             WHERE dl.log_id IS NULL
             AND u.telegram_id IS NOT NULL`
        );
        
        return result.rows;
    } catch (error) {
        console.error('Error in getInactiveUsers repository:', error);
        throw error;
    }
};
