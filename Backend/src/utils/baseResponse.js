const baseResponse = (res, success, status, message, payload) => {
    
    return res.status(status).json({
        success,
        message,
        data: payload, 
    });
};

module.exports = baseResponse;
