const db = require('../configs/pg.config');
const bcrypt = require('bcrypt');


exports.createUser = async ({ username, password, email, telegram_id, interest, gender, fullname, birthday }) => {
    try {
        const emailCheck = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (emailCheck.rows.length > 0) {
            return null;         
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.query(
            `INSERT INTO users 
            (username, password, email, telegram_id, interest, gender, fullname, birthday, last_login) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) 
            RETURNING user_id, username, email, telegram_id, interest, gender, fullname, birthday, last_login, streak_counter`,
            [username, hashedPassword, email, telegram_id || null, interest || null, gender || null, fullname || null, birthday || null]
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
            'SELECT user_id, username, email, telegram_id, interest, gender, fullname, birthday, user_image_url, last_login, streak_counter FROM users WHERE user_id = $1',
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


exports.updateUserProfile = async (userId, { username, email, user_image_url, interest, gender, telegram_id, fullname, birthday }) => {
    try {
        const updateFields = [];
        const values = [];
        let paramCount = 1;
        
        if (username) {
            updateFields.push(`username = $${paramCount++}`);
            values.push(username);
        }
        
        if (email) {
            if (email) {
                const emailCheck = await db.query(
                    'SELECT * FROM users WHERE email = $1 AND user_id != $2',
                    [email, userId]
                );
                
                if (emailCheck.rows.length > 0) {
                    throw new Error('Email already in use');
                }
            }
            
            updateFields.push(`email = $${paramCount++}`);
            values.push(email);
        }
        
        if (user_image_url) {
            updateFields.push(`user_image_url = $${paramCount++}`);
            values.push(user_image_url);
        }

        if (interest !== undefined) {
            updateFields.push(`interest = $${paramCount++}`);
            values.push(interest);
        }

        if (gender) {
            updateFields.push(`gender = $${paramCount++}`);
            values.push(gender);
        }
        
        if (telegram_id !== undefined) {
            updateFields.push(`telegram_id = $${paramCount++}`);
            values.push(telegram_id);
        }

        if (fullname !== undefined) {
            updateFields.push(`fullname = $${paramCount++}`);
            values.push(fullname);
        }

        if (birthday !== undefined) {
            updateFields.push(`birthday = $${paramCount++}`);
            values.push(birthday);
        }

        if (updateFields.length === 0) {
            return null;        
        }
        
        values.push(userId);

        const result = await db.query(
            `UPDATE users SET ${updateFields.join(', ')} 
            WHERE user_id = $${paramCount} 
            RETURNING user_id, username, email, telegram_id, interest, gender, fullname, birthday, user_image_url, last_login, streak_counter`,
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
