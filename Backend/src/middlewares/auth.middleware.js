const jwt = require('jsonwebtoken');
const baseResponse = require('../utils/baseResponse');
require('dotenv').config();



exports.verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return baseResponse(res, false, 401, 'Access token is missing or invalid', null);
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded;
        
        next();
        
    } catch (error) {        
        if (error.name === 'TokenExpiredError') {
            return baseResponse(res, false, 401, 'Token expired', null);
        }
        
        return baseResponse(res, false, 401, 'Invalid token', null);
    }
};
