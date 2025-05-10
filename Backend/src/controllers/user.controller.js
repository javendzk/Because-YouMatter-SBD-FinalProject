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
        
        const { occupation, gender } = req.body;
        
        const updatedUser = await userRepository.updateUserProfile(userId, {
            user_image_url: imageUrl || req.body.user_image_url,
            occupation,
            gender
        });
        
        if (!updatedUser) {
            return baseResponse(res, false, 404, 'User not found or no changes provided', null);
        }
        
        return baseResponse(res, true, 200, 'Profile updated successfully', updatedUser);
    } catch (error) {
        console.error('Update profile controller error:', error);
        return baseResponse(res, false, 500, 'Failed to update profile', null);
    }
};
