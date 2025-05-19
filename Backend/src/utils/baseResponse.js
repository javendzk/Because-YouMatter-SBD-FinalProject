const baseResponse = (res, success, status, message, payload) => {
    console.log('=== BASE RESPONSE ===');
    console.log('Status:', status);
    console.log('Success:', success);
    console.log('Message:', message);
    console.log('Payload:', payload ? 'Present' : 'None');
    
    return res.status(status).json({
        success,
        message,
        data: payload,  // Using 'data' field for consistency
    });
};

module.exports = baseResponse;
