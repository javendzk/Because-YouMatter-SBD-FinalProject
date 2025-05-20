const logRepository = require('../repositories/log.repository');
const llmRepository = require('../repositories/llm.repository');
const llmService = require('../services/llm.service');
const baseResponse = require('../utils/baseResponse');
const telegramRepository = require('../repositories/telegram.repository');
const telegramService = require('../services/telegram.service');
const userRepository = require('../repositories/user.repository');
const rewardRepository = require('../repositories/reward.repository');

const checkAndSendStreakReward = async (userId, streakCount) => {
    try {
        const rewardAlreadySent = await telegramRepository.hasStreakRewardBeenSent(userId, streakCount);
        if (rewardAlreadySent) {
            return;
        }
        
        const user = await userRepository.getUserById(userId);
        if (!user || !user.telegram_id) {
            return;
        }
        
        const result = await rewardRepository.getStreakMilestoneReward(userId);
        if (!result || !result.isMultipleOf7) {
            return;
        }
        
        let message = `🎉 Congratulations ${user.username}! 🎉\n\n`;
        message += `You've achieved a ${streakCount}-day streak milestone! That's ${Math.floor(streakCount / 7)} weeks of consistency.\n\n`;
        
        if (result.reward) {
            message += `You've unlocked the "${result.reward.title}" reward!`;
            
            await telegramService.sendTelegramPhoto(
                user.telegram_id,
                result.reward.image_url,
                message
            );
        } else {
            message += `Keep up the amazing work!`;
            
            await telegramService.sendTelegramMessage(user.telegram_id, message);
        }
        
        await telegramRepository.createTelegramLog({
            userId,
            messageContent: message
        });
        
    } catch (error) {
        console.error('Error sending streak reward:', error);
    }
};

exports.createDailyLog = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { day_description, mood } = req.body;
        
        const dailyLog = await logRepository.createDailyLog({
            userId,
            day_description,
            mood
        });
        
        const isNewLog = !await logRepository.hasPreviousDailyLogToday(userId, dailyLog.log_id);
        if (isNewLog) {
            const streakResult = await logRepository.updateUserStreak(userId);
            
            if (streakResult && streakResult.streak_counter % 7 === 0 && streakResult.streak_counter > 0) {
                await checkAndSendStreakReward(userId, streakResult.streak_counter);
            }
        }
          const feedbackData = await llmService.generateFeedback(day_description, mood);
        
        const existingResponse = await llmRepository.getResponseByLogId(dailyLog.log_id);
        
        if (existingResponse) {
            await llmRepository.updateResponse({
                logId: dailyLog.log_id,
                message: feedbackData.message,
                response: feedbackData.response,
                tags: feedbackData.tags,
                insight: feedbackData.insight
            });
        } else {
            await llmRepository.createResponse({
                logId: dailyLog.log_id,
                message: feedbackData.message,
                response: feedbackData.response,
                tags: feedbackData.tags,
                insight: feedbackData.insight
            });
        }
        
        return baseResponse(res, true, 201, 'Daily log created successfully', dailyLog);
    } catch (error) {
        console.error('Create daily log controller error:', error);
        return baseResponse(res, false, 500, 'Failed to create daily log', null);
    }
};

exports.updateDailyLog = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const logId = req.params.id;
        const { day_description, mood } = req.body;
        
        const logCheck = await logRepository.getDailyLogById(logId);
        if (!logCheck) {
            return baseResponse(res, false, 404, 'Log not found', null);
        }
        
        if (logCheck.user_id !== userId) {
            return baseResponse(res, false, 403, 'Unauthorized to update this log', null);
        }
        
        const updatedLog = await logRepository.updateDailyLog({
            logId,
            day_description,
            mood
        });
        
        if (!updatedLog) {
            return baseResponse(res, false, 404, 'Failed to update log', null);
        }
        
        const feedbackData = await llmService.generateFeedback(day_description, mood);
        const existingResponse = await llmRepository.getResponseByLogId(logId);
        
        if (existingResponse) {
            await llmRepository.updateResponse({
                logId: logId,
                message: feedbackData.message,
                response: feedbackData.response,
                tags: feedbackData.tags,
                insight: feedbackData.insight
            });
        } else {
            await llmRepository.createResponse({
                logId: logId,
                message: feedbackData.message,
                response: feedbackData.response,
                tags: feedbackData.tags,
                insight: feedbackData.insight
            });
        }
        
        return baseResponse(res, true, 200, 'Daily log updated successfully', updatedLog);
    } catch (error) {
        console.error('Update daily log controller error:', error);
        return baseResponse(res, false, 500, 'Failed to update daily log', null);
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

exports.checkAndSendStreakReward = checkAndSendStreakReward;
