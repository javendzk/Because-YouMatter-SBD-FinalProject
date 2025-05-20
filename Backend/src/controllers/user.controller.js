const userRepository = require('../repositories/user.repository');
const baseResponse = require('../utils/baseResponse');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;



const uploadImageToCloudinary = async (file) => {
    try {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = "data:" + file.mimetype + ";base64," + b64;
        
        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
            unique_filename: true
        });
        
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading to cloudinary:', error);
        throw error;
    }
};


exports.register = async (req, res) => {
    try {
        const { username, password, email, telegram_id, interest, gender, fullname, birthday } = req.body;
        
        console.log('Controller: Registration request received with data:', {
            username,
            email,
            telegram_id: telegram_id || 'not provided',
            interest: interest || 'not provided',
            gender: gender || 'not provided',
            fullname: fullname || 'not provided',
            birthday: birthday || 'not provided'
        });
        
        const user = await userRepository.createUser({
            username,
            password,
            email,
            telegram_id,
            interest,
            gender,
            fullname,
            birthday
        });
        
        if (!user) {
            console.log('Controller: Registration failed - Email already registered:', email);
            return baseResponse(res, false, 400, 'Email already registered', null);
        }
        
        console.log('Controller: User registered successfully:', user.user_id);
          if (telegram_id) {
            try {
                const telegramService = require('../services/telegram.service');
                const telegramRepository = require('../repositories/telegram.repository');
                
                const welcomeMessage = `
Hello ${fullname || username}! 👋 I'm Yumi, your personal mental wellness companion from YouMatter! 
                
I'm here to support you on your journey to better mental health and well-being. You can share your daily thoughts and feelings with me, and I'll be here to listen, provide feedback, and cheer you on.

Remember to log your mood daily to maintain your streak and unlock special rewards! 

Looking forward to our journey together! 💪
                `;
                
                // Send welcome image instead of text message
                const welcomeImageUrl = 'https://i.imgur.com/rBOWBm8.png';
                
                await telegramService.sendTelegramPhoto(telegram_id, welcomeImageUrl, welcomeMessage);
                
                await telegramRepository.createTelegramLog({
                    userId: user.user_id,
                    messageContent: `[Welcome Image] ${welcomeMessage}`
                });
                
                console.log(`Welcome message with image sent to user ${username} via Telegram`);
            } catch (telegramError) {
                console.error('Failed to send Telegram welcome message:', telegramError);
            }
        } else {
            console.log(`User ${username} registered without Telegram ID`);
        }
        
        return baseResponse(res, true, 201, 'User registered successfully', user);
    } catch (error) {
        console.error('Register controller error:', error);
        return baseResponse(res, false, 500, 'Failed to register user', null);
    }
};


exports.login = async (req, res) => {
    try {
        console.log('=== LOGIN REQUEST RECEIVED ===');
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
        
        const { email, password } = req.body;
        
        console.log('Attempting login for email:', email);
        const result = await userRepository.loginUser({ email, password });
        console.log('Login result:', { success: result.success, message: result.message });
        
        if (!result.success) {
            console.log('Login failed:', result.message);
            return baseResponse(res, false, 401, result.message, null);
        }
        
        console.log('Login successful for user:', result.user.username);
        const token = jwt.sign(
            { 
                user_id: result.user.user_id,
                username: result.user.username,
                email: result.user.email
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );        return baseResponse(res, true, 200, 'Login successful', {
            token,
            user: result.user
        });
    } catch (error) {
        console.error('=== LOGIN ERROR ===');
        console.error('Error details:', error);
        console.error('Stack trace:', error.stack);
        return baseResponse(res, false, 500, 'Failed to login', null);
    }
};


exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const user = await userRepository.getUserById(userId);
        
        if (!user) {
            return baseResponse(res, false, 404, 'User not found', null);
        }
        
        return baseResponse(res, true, 200, 'User profile retrieved', user);
    } catch (error) {
        console.error('Get user profile controller error:', error);
        return baseResponse(res, false, 500, 'Failed to retrieve user profile', null);
    }
};


exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadImageToCloudinary(req.file);
        }
        
        const { username, email, interest, gender, telegram_id, fullname, birthday } = req.body;
        
        const updateData = {};
        
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (interest !== undefined) updateData.interest = interest;
        if (gender) updateData.gender = gender;
        if (telegram_id !== undefined) updateData.telegram_id = telegram_id;
        if (fullname !== undefined) updateData.fullname = fullname;
        if (birthday !== undefined) updateData.birthday = birthday;
        
        if (imageUrl || req.body.user_image_url) {
            updateData.user_image_url = imageUrl || req.body.user_image_url;
        }
        
        const updatedUser = await userRepository.updateUserProfile(userId, updateData);
        
        if (!updatedUser) {
            return baseResponse(res, false, 404, 'User not found or no changes provided', null);
        }
        
        return baseResponse(res, true, 200, 'Profile updated successfully', updatedUser);
    } catch (error) {
        console.error('Update profile controller error:', error);
        return baseResponse(res, false, 500, 'Failed to update profile', null);
    }
};
