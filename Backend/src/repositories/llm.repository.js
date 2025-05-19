const db = require('../configs/pg.config');


exports.createResponse = async ({ logId, message, response, tags, insight }) => {
    try {
        const result = await db.query(
            `INSERT INTO llm_responses (log_id, message, response, tags, insight)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [logId, message, response, tags, insight]
        );

        return result.rows[0];
    } catch (error) {
        console.error('Error in createResponse repository:', error);
        throw error;
    }
};

exports.updateResponse = async ({ logId, message, response, tags, insight }) => {
    try {
        const result = await db.query(
            `UPDATE llm_responses 
            SET message = $1, response = $2, tags = $3, insight = $4
            WHERE log_id = $5
            RETURNING *`,
            [message, response, tags, insight, logId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (error) {
        console.error('Error in updateResponse repository:', error);
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

exports.getResponseByLogId = async (logId) => {
    try {
        const result = await db.query(
            'SELECT * FROM llm_responses WHERE log_id = $1',
            [logId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (error) {
        console.error('Error in getResponseByLogId repository:', error);
        throw error;
    }
};


exports.getLatestResponseByUserId = async (userId) => {
    try {
        const result = await db.query(
            `SELECT lr.* FROM llm_responses lr
            JOIN daily_logs dl ON lr.log_id = dl.log_id
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
