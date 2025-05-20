const db = require('../configs/pg.config');
const bcrypt = require('bcrypt');
const redis = require('../configs/redis.config');
const { REDIS_TTL_USER } = process.env;


exports.createUser = async ({ username, password, email, telegram_id, interest, gender, fullname, birthday }) => {
    try {
        console.log('Repository: Creating user with data:', {
            username,
            email,
            telegram_id: telegram_id || 'not provided',
            interest: interest || 'not provided',
            gender: gender || 'not provided',
            fullname: fullname || 'not provided',
            birthday: birthday || 'not provided'
        });
        
        const emailCheck = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (emailCheck.rows.length > 0) {
            console.log('Repository: Registration failed - Email already exists:', email);
            return null;         
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const defaultProfilePicture = 'https://i.imgur.com/zZz0JKY.jpeg';

        // Ensure telegram_id is a number or null
        const parsedTelegramId = telegram_id ? (isNaN(Number(telegram_id)) ? null : Number(telegram_id)) : null;
        console.log('Repository: Parsed telegram_id:', parsedTelegramId);

        const result = await db.query(
            `INSERT INTO users 
            (username, password, email, telegram_id, interest, gender, fullname, birthday, last_login, user_image_url) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9) 
            RETURNING user_id, username, email, telegram_id, interest, gender, fullname, birthday, last_login, streak_counter, user_image_url`,
            [username, hashedPassword, email, parsedTelegramId, interest || null, gender || null, fullname || null, birthday || null, defaultProfilePicture]
        );

        console.log('Repository: User created successfully with ID:', result.rows[0].user_id);
        return result.rows[0];
    } catch (error) {
        console.error('Error in createUser repository:', error);
        throw error;
    }
};


exports.loginUser = async ({ email, password }) => {
    try {
        console.log('Repository: Attempting to find user with email:', email);
        
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        console.log('Repository: Query result rows count:', result.rows.length);

        if (result.rows.length === 0) {
            console.log('Repository: No user found with email:', email);
            return { success: false, message: 'Invalid email or password' };
        }

        const user = result.rows[0];
        console.log('Repository: User found, checking password');
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Repository: Password validation result:', isPasswordValid);
       
        if (!isPasswordValid) {
            console.log('Repository: Invalid password for user:', email);
            return { success: false, message: 'Invalid email or password' };
        }
          console.log('Repository: Updating last login for user:', user.user_id);
        await db.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP, logged_in_today = TRUE WHERE user_id = $1',
            [user.user_id]
        );
        
        const updatedUser = await db.query(
            'SELECT user_id, username, email, telegram_id, interest, gender, fullname, birthday, user_image_url, last_login, streak_counter, logged_in_today FROM users WHERE user_id = $1',
            [user.user_id]
        );
        
        const userData = updatedUser.rows[0];
        console.log('Repository: Login successful for user:', userData.user_id, 'logged_in_today:', userData.logged_in_today);

        await redis.delAsync(`user:${userData.user_id}`);

        return { success: true, user: userData };
    } catch (error) {
        console.error('Repository ERROR in loginUser:', error);
        console.error('Repository ERROR stack:', error.stack);
        throw error;
    }
};


exports.getUserById = async (userId) => {
    try {
        const cachedUser = await redis.getAsync(`user:${userId}`);
        
        if (cachedUser) {
            console.log(`[Cache Hit] Retrieved user ${userId} from Redis cache`);
            return JSON.parse(cachedUser);
        }
        
        console.log(`[Cache Miss] User ${userId} not found in cache, fetching from database`);
        
        const result = await db.query(
            'SELECT user_id, username, email, telegram_id, interest, gender, fullname, birthday, user_image_url, last_login, streak_counter FROM users WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return null;
        }
        
        const user = result.rows[0];
        
        await redis.setAsync(
            `user:${userId}`,
            JSON.stringify(user),
            { EX: parseInt(REDIS_TTL_USER) || 3600 }
        );
        console.log(`[Cache Set] Stored user ${userId} in Redis cache`);

        return user;
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
        );        if (result.rows.length === 0) {
            return null;
        }
        
        const updatedUser = result.rows[0];
        
        await redis.setAsync(
            `user:${userId}`,
            JSON.stringify(updatedUser),
            { EX: parseInt(REDIS_TTL_USER) || 3600 } 
        );
        console.log(`[Cache Update] Updated user ${userId} in Redis cache`);
        
        return updatedUser;
    } catch (error) {
        console.error('Error in updateUserProfile repository:', error);
        throw error;
    }
};
