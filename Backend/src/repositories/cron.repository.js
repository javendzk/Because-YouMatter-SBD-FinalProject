const db = require('../configs/pg.config');


exports.resetDailyLoginStatus = async () => {
    try {
        const result = await db.query(
            'UPDATE users SET logged_in_today = FALSE'
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
            `SELECT user_id, username, telegram_id 
            FROM users 
            WHERE logged_in_today = FALSE 
            AND telegram_id IS NOT NULL`
        );
        
        return result.rows;
    } catch (error) {
        console.error('Error in getInactiveUsers repository:', error);
        throw error;
    }
};
