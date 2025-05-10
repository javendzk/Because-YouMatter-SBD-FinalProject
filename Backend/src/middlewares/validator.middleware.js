const baseResponse = require('../utils/baseResponse');


exports.validateUserRegistration = (req, res, next) => {
    const { username, email, password, telegram_id, occupation, gender } = req.body;
    
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
    
    if (telegram_id && isNaN(telegram_id)) {
        return baseResponse(res, false, 400, 'Telegram ID must be a number', null);
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
    const { activity, day_description } = req.body;
    
    if (!activity || !day_description) {
        return baseResponse(res, false, 400, 'Activity and day description are required', null);
    }
    
    next();
};
