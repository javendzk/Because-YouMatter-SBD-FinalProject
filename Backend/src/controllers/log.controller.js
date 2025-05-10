const logRepository = require('../repositories/log.repository');
const llmRepository = require('../repositories/llm.repository');
const llmService = require('../services/llm.service');
const baseResponse = require('../utils/baseResponse');


exports.createDailyLog = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { activity, day_description } = req.body;
        
        const mood = await llmService.analyzeMood(activity, day_description);
        
        const feedbackData = await llmService.generateFeedback(activity, day_description, mood);
        
        const llmResponse = await llmRepository.createResponse({
            message: feedbackData.message,
            response: feedbackData.response
        });
        
        const dailyLog = await logRepository.createDailyLog({
            userId,
            activity,
            day_description,
            mood,
            responseId: llmResponse.response_id
        });
        
        const result = {
            ...dailyLog,
            llmResponse: JSON.parse(llmResponse.response)
        };
        
        return baseResponse(res, true, 201, 'Daily log created successfully', result);
    } catch (error) {
        console.error('Create daily log controller error:', error);
        return baseResponse(res, false, 500, 'Failed to create daily log', null);
    }
};


exports.getUserLogs = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const logs = await logRepository.getDailyLogsByUserId(userId);
        
        const processedLogs = logs.map(log => {
            let llmResponse = null;
            
            if (log.response) {
                try {
                    llmResponse = JSON.parse(log.response);
                } catch (e) {
                    console.error('Error parsing LLM response:', e);
                }
            }
            
            return {
                ...log,
                llmResponse
            };        });
        
        return baseResponse(res, true, 200, 'User logs retrieved successfully', processedLogs);
    } catch (error) {
        console.error('Get user logs controller error:', error);
        return baseResponse(res, false, 500, 'Failed to retrieve user logs', null);
    }
};


exports.getLogById = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const logId = req.params.id;

        const log = await logRepository.getDailyLogById(logId);
        
        if (!log) {
            return baseResponse(res, false, 404, 'Log not found', null);
        }
        
        if (log.user_id !== userId) {
            return baseResponse(res, false, 403, 'Unauthorized access to log', null);
        }
        
        let llmResponse = null;        
        if (log.response) {
            try {
                llmResponse = JSON.parse(log.response);
            } catch (e) {
                console.error('Error parsing LLM response:', e);
            }
        }
        
        const result = {
            ...log,
            llmResponse
        };
        
        return baseResponse(res, true, 200, 'Log retrieved successfully', result);
    } catch (error) {
        console.error('Get log by ID controller error:', error);
        return baseResponse(res, false, 500, 'Failed to retrieve log', null);
    }
};


exports.deleteLog = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const logId = req.params.id;      
        const log = await logRepository.getDailyLogById(logId);
        
        if (!log) {
            return baseResponse(res, false, 404, 'Log not found', null);
        }
        
        if (log.user_id !== userId) {
            return baseResponse(res, false, 403, 'Unauthorized to delete this log', null);
        }
        
        await logRepository.deleteDailyLog(logId);
        
        return baseResponse(res, true, 200, 'Log deleted successfully', null);
    } catch (error) {
        console.error('Delete log controller error:', error);
        return baseResponse(res, false, 500, 'Failed to delete log', null);
    }
};
