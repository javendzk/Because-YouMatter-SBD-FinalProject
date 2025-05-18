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
        const { username, password, email, telegram_id, occupation, gender } = req.body;
        
        const user = await userRepository.createUser({
            username,
            password,
            email,
            telegram_id,
            occupation,
            gender
        });
        
        if (!user) {
            return baseResponse(res, false, 400, 'Email already registered', null);
        }
        
                    if (telegram_id) {
            try {
                const telegramService = require('../services/telegram.service');
                const telegramRepository = require('../repositories/telegram.repository');
                
                const welcomeMessage = `
Hello ${username}! 👋 I'm Yumi, your personal mental wellness companion from YouMatter! 
                
I'm here to support you on your journey to better mental health and well-being. You can share your daily thoughts and feelings with me, and I'll be here to listen, provide feedback, and cheer you on.

Remember to log your mood daily to maintain your streak and unlock special rewards! 

Looking forward to our journey together! 💪
                `;
                
                await telegramService.sendTelegramMessage(telegram_id, welcomeMessage);
                
                await telegramRepository.createTelegramLog({
                    userId: user.user_id,
                    messageContent: welcomeMessage
                });
                
                console.log(`Welcome message sent to user ${username} via Telegram`);
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
        const { email, password } = req.body;
        
        const result = await userRepository.loginUser({ email, password });
        
        if (!result.success) {
            return baseResponse(res, false, 401, result.message, null);
        }
        
        const token = jwt.sign(
            { 
                user_id: result.user.user_id,
                username: result.user.username,
                email: result.user.email
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        return baseResponse(res, true, 200, 'Login successful', {
            token,
            user: result.user
        });
    } catch (error) {
        console.error('Login controller error:', error);
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
        
        const { username, email, occupation, gender, github_id } = req.body;
        
        const updateData = {};
        
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (occupation) updateData.occupation = occupation;
        if (gender) updateData.gender = gender;
        if (github_id) updateData.github_id = github_id;
        
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
