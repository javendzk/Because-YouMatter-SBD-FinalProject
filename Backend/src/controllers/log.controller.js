const logRepository = require('../repositories/log.repository');
const llmRepository = require('../repositories/llm.repository');
const llmService = require('../services/llm.service');
const baseResponse = require('../utils/baseResponse');


exports.createDailyLog = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { day_description, mood } = req.body;
        
        const dailyLog = await logRepository.createDailyLog({
            userId,
            day_description,
            mood
        });
        
        const feedbackData = await llmService.generateFeedback(day_description, mood);
        
        await llmRepository.createResponse({
            logId: dailyLog.log_id,
            message: feedbackData.message,
            response: feedbackData.response,
            tags: feedbackData.tags,
            insight: feedbackData.insight
        });
        
        return baseResponse(res, true, 201, 'Daily log created successfully', dailyLog);
    } catch (error) {
        console.error('Create daily log controller error:', error);
        return baseResponse(res, false, 500, 'Failed to create daily log', null);
    }
};


exports.getUserLogs = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const logs = await logRepository.getDailyLogsByUserId(userId);
        
        const processedLogs = logs.map(async log => {
            let llm_response = null;
            let tags = [];
            let insight = null;
            
            try {
                const llmResponseData = await llmRepository.getResponseByLogId(log.log_id);
                if (llmResponseData) {
                    if (llmResponseData.response) {
                        llm_response = JSON.parse(llmResponseData.response);
                    }
                    
                    tags = llmResponseData.tags || [];
                    insight = llmResponseData.insight || null;
                }
            } catch (err) {
                console.error('Error parsing LLM response:', err);
            }
            
            return {
                ...log,
                llm_response,
                tags,
                insight
            };
        });
        
        const resolvedLogs = await Promise.all(processedLogs);
        
        return baseResponse(res, true, 200, 'User logs retrieved successfully', resolvedLogs);
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
        
        let llm_response = null;
        let tags = [];
        let insight = null;
        
        try {
            const llmResponseData = await llmRepository.getResponseByLogId(log.log_id);
            if (llmResponseData) {
                if (llmResponseData.response) {
                    llm_response = JSON.parse(llmResponseData.response);
                }
                
                tags = llmResponseData.tags || [];
                insight = llmResponseData.insight || null;
            }
        } catch (err) {
            console.error('Error parsing LLM response:', err);
        }
        
        const result = {
            ...log,
            llm_response,
            tags,
            insight
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
