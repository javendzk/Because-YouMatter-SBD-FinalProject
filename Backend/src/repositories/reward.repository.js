const db = require('../configs/pg.config');


exports.getAllRewards = async () => {
    try {
        const result = await db.query(
            'SELECT * FROM rewards ORDER BY required_streak ASC',
            []
        );

        return result.rows;
    } catch (error) {
        console.error('Error in getAllRewards repository:', error);
        throw error;
    }
};


exports.getUserAvailableRewards = async (userId) => {
    try {
        const userResult = await db.query(
            'SELECT streak_counter FROM users WHERE user_id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return null;
        }

        const { streak_counter } = userResult.rows[0];
        const rewardsResult = await db.query(
            'SELECT * FROM rewards WHERE required_streak <= $1 ORDER BY required_streak DESC',
            [streak_counter]
        );

        return {
            streak: streak_counter,
            rewards: rewardsResult.rows
        };
        
    } catch (error) {
        console.error('Error in getUserAvailableRewards repository:', error);
        throw error;
    }
};

exports.getStreakMilestoneReward = async (userId) => {
    try {
        const userResult = await db.query(
            'SELECT user_id, username, streak_counter, telegram_id FROM users WHERE user_id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return null;
        }

        const user = userResult.rows[0];
        
        if (user.streak_counter % 7 !== 0 || user.streak_counter === 0) {
            return {
                isMultipleOf7: false,
                user: user
            };
        }

        const rewardsResult = await db.query(
            'SELECT * FROM rewards WHERE required_streak <= $1 ORDER BY required_streak DESC LIMIT 1',
            [user.streak_counter]
        );

        const reward = rewardsResult.rows.length > 0 ? rewardsResult.rows[0] : null;

        return {
            isMultipleOf7: true,
            streak: user.streak_counter,
            milestone: Math.floor(user.streak_counter / 7),
            user: user,
            reward: reward
        };
        
    } catch (error) {
        console.error('Error in getStreakMilestoneReward repository:', error);
        throw error;
    }
};
