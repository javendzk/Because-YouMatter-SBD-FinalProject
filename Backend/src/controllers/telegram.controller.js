const telegramRepository = require('../repositories/telegram.repository');
const logRepository = require('../repositories/log.repository');
const llmRepository = require('../repositories/llm.repository');
const telegramService = require('../services/telegram.service');
const baseResponse = require('../utils/baseResponse');


exports.sendTelegramFeedback = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { logId } = req.body;
        
        const telegramId = await telegramRepository.getUserTelegramId(userId);
        if (!telegramId) {
            return baseResponse(res, false, 400, 'User has no linked Telegram ID', null);
        }        

        const log = await logRepository.getDailyLogById(logId);
        if (!log) {
            return baseResponse(res, false, 404, 'Log not found', null);
        }
        
        if (log.user_id !== userId) {
            return baseResponse(res, false, 403, 'Unauthorized access to log', null);
        }
          const llmResponse = await llmRepository.getResponseByLogId(log.log_id);
        if (!llmResponse) {
            return baseResponse(res, false, 404, 'LLM response not found', null);
        }
        
        let telegramMessage;
        try {
            const parsedResponse = JSON.parse(llmResponse.response);
            telegramMessage = parsedResponse.telegramMessage || 'Keep up the good work!';
        } catch (e) {
            console.error('Error parsing LLM response:', e);
            telegramMessage = 'Keep up the good work!';
        }        

        const finalMessage = `Hi ${req.user.username}! 🌟\n\n${telegramMessage}\n\nYumi, Your YouMatter Assistant`;
        
        await telegramService.sendTelegramMessage(telegramId, finalMessage);
        
        await telegramRepository.createTelegramLog({
            userId,
            messageContent: finalMessage
        });
        
        return baseResponse(res, true, 200, 'Telegram message sent successfully', { message: finalMessage });
    } catch (error) {
        console.error('Send Telegram feedback controller error:', error);
        return baseResponse(res, false, 500, 'Failed to send Telegram message', null);
    }
};


exports.sendLatestFeedback = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const telegramId = await telegramRepository.getUserTelegramId(userId);

        if (!telegramId) {
            return baseResponse(res, false, 400, 'User has no linked Telegram ID', null);
        }

        const latestResponse = await llmRepository.getLatestResponseByUserId(userId);
        if (!latestResponse) {
            return baseResponse(res, false, 404, 'No LLM responses found for this user', null);
        }

        let telegramMessage;
        try {
            const parsedResponse = JSON.parse(latestResponse.response);
            telegramMessage = parsedResponse.telegramMessage || 'Keep up the good work!';
        } catch (e) {
            console.error('Error parsing LLM response:', e);
            telegramMessage = 'Keep up the good work!';
        }

        const finalMessage = `Hi ${req.user.username}! 🌟\n\n${telegramMessage}\n\nYumi, Your YouMatter Assistant`;
        await telegramService.sendTelegramMessage(telegramId, finalMessage);
        await telegramRepository.createTelegramLog({
            userId,
            messageContent: finalMessage
        });
        
        return baseResponse(res, true, 200, 'Latest feedback sent to Telegram', { message: finalMessage });
    } catch (error) {
        console.error('Send latest feedback controller error:', error);
        return baseResponse(res, false, 500, 'Failed to send latest feedback to Telegram', null);
    }
};
