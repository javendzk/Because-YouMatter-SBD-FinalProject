const db = require('../configs/pg.config');
const bcrypt = require('bcrypt');


exports.createUser = async ({ username, password, email, telegram_id, occupation, gender }) => {
    try {
                const emailCheck = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        if (emailCheck.rows.length > 0) {
            return null;         }
                const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
                const result = await db.query(
            `INSERT INTO users 
            (username, password, email, telegram_id, occupation, gender, last_login) 
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) 
            RETURNING user_id, username, email, telegram_id, occupation, gender, last_login, streak_counter`,
            [username, hashedPassword, email, telegram_id || null, occupation || null, gender || null]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in createUser repository:', error);
        throw error;
    }
};


exports.loginUser = async ({ email, password }) => {
    try {
                const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        if (result.rows.length === 0) {
            return { success: false, message: 'Invalid email or password' };
        }
        const user = result.rows[0];
                const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return { success: false, message: 'Invalid email or password' };
        }
                await db.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
            [user.user_id]
        );
                delete user.password;
        return { success: true, user };
    } catch (error) {
        console.error('Error in loginUser repository:', error);
        throw error;
    }
};


exports.getUserById = async (userId) => {
    try {
        const result = await db.query(
            'SELECT user_id, username, email, telegram_id, occupation, gender, user_image_url, last_login, streak_counter FROM users WHERE user_id = $1',
            [userId]
        );
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error in getUserById repository:', error);
        throw error;
    }
};


exports.updateUserProfile = async (userId, { user_image_url, occupation, gender }) => {
    try {
        const updateFields = [];
        const values = [];
        let paramCount = 1;
                if (user_image_url) {
            updateFields.push(`user_image_url = $${paramCount++}`);
            values.push(user_image_url);
        }
        if (occupation) {
            updateFields.push(`occupation = $${paramCount++}`);
            values.push(occupation);
        }
        if (gender) {
            updateFields.push(`gender = $${paramCount++}`);
            values.push(gender);
        }
        if (updateFields.length === 0) {
            return null;         }
        values.push(userId);
        const result = await db.query(
            `UPDATE users SET ${updateFields.join(', ')} 
            WHERE user_id = $${paramCount} 
            RETURNING user_id, username, email, telegram_id, occupation, gender, user_image_url, last_login, streak_counter`,
            values
        );
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error in updateUserProfile repository:', error);
        throw error;
    }
};
