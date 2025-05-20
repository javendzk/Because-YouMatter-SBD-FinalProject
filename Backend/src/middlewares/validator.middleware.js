const baseResponse = require('../utils/baseResponse');


exports.validateUserRegistration = (req, res, next) => {
    const { username, email, password, telegram_id, interest, gender, fullname, birthday } = req.body;
    
    if (!username || !email || !password) {
        return baseResponse(res, false, 400, 'Username, email, and password are required', null);
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return baseResponse(res, false, 400, 'Invalid email format', null);
    }
    
    if (password.length < 8) {
        return baseResponse(res, false, 400, 'Password must be at least 8 characters', null);
    }
    
    if (gender && !['male', 'female', 'others'].includes(gender)) {
        return baseResponse(res, false, 400, 'Gender must be one of: male, female, others', null);
    }
    if (telegram_id !== undefined && telegram_id !== null) {
        if (isNaN(Number(telegram_id))) {
            return baseResponse(res, false, 400, 'Telegram ID must be a number', null);
        }
    }
    
    next();
};


exports.validateUserLogin = (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return baseResponse(res, false, 400, 'Email and password are required', null);
    }
    
    next();
};


exports.validateDailyLog = (req, res, next) => {
    const { day_description, mood } = req.body;
    
    if (!day_description || !mood) {
        return baseResponse(res, false, 400, 'Day description and mood are required', null);
    }
    
    const validMoods = ['awesome', 'good', 'okay', 'bad', 'terrible'];
    if (!validMoods.includes(mood.toLowerCase())) {
        return baseResponse(res, false, 400, 'Mood must be one of: awesome, good, okay, bad, terrible', null);
    }
    
    next();
};
