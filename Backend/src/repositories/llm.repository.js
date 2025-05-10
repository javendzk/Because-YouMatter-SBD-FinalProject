const db = require('../configs/pg.config');


exports.createResponse = async ({ message, response }) => {
    try {
        const result = await db.query(
            `INSERT INTO llm_responses (message, response)
            VALUES ($1, $2)
            RETURNING *`,
            [message, response]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in createResponse repository:', error);
        throw error;
    }
};


exports.getResponseById = async (responseId) => {
    try {
        const result = await db.query(
            'SELECT * FROM llm_responses WHERE response_id = $1',
            [responseId]
        );
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error in getResponseById repository:', error);
        throw error;
    }
};


exports.getLatestResponseByUserId = async (userId) => {
    try {
        const result = await db.query(
            `SELECT lr.* FROM llm_responses lr
            JOIN daily_logs dl ON lr.response_id = dl.response_id
            WHERE dl.user_id = $1
            ORDER BY lr.created_at DESC
            LIMIT 1`,
            [userId]
        );
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error in getLatestResponseByUserId repository:', error);
        throw error;
    }
};
