const rewardRepository = require('../repositories/reward.repository');
const baseResponse = require('../utils/baseResponse');


exports.getAllRewards = async (req, res) => {
    try {
        const rewards = await rewardRepository.getAllRewards();
        
        return baseResponse(res, true, 200, 'Rewards retrieved successfully', rewards);
    } catch (error) {
        console.error('Get all rewards controller error:', error);
        return baseResponse(res, false, 500, 'Failed to retrieve rewards', null);
    }
};


exports.getUserRewards = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const result = await rewardRepository.getUserAvailableRewards(userId);
        
        if (!result) {
            return baseResponse(res, false, 404, 'User not found', null);
        }
        
        return baseResponse(res, true, 200, 'User rewards retrieved successfully', result);
    } catch (error) {
        console.error('Get user rewards controller error:', error);
        return baseResponse(res, false, 500, 'Failed to retrieve user rewards', null);
    }
};

exports.sendStreakMilestoneReward = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const telegramRepository = require('../repositories/telegram.repository');
        const telegramService = require('../services/telegram.service');
        
        const result = await rewardRepository.getStreakMilestoneReward(userId);
        
        if (!result) {
            return baseResponse(res, false, 404, 'User not found', null);
        }

        if (!result.isMultipleOf7) {
            return baseResponse(res, false, 400, 'User streak is not a milestone (multiple of 7)', {
                streak: result.user.streak_counter
            });
        }

        const telegramId = result.user.telegram_id;
        if (!telegramId) {
            return baseResponse(res, false, 400, 'User has no linked Telegram ID', null);
        }

        let message = `🎉 Congratulations ${result.user.username}! 🎉\n\n`;
        message += `You've achieved a ${result.streak}-day streak milestone! That's ${result.milestone} weeks of consistency.\n\n`;
        
        if (result.reward) {
            message += `You've unlocked the "${result.reward.title}" reward!`;
            
            await telegramService.sendTelegramPhoto(
                telegramId,
                result.reward.image_url,
                message
            );
        } else {
            message += `Keep up the amazing work!`;
            
            await telegramService.sendTelegramMessage(telegramId, message);
        }

        await telegramRepository.createTelegramLog({
            userId,
            messageContent: message
        });
        
        return baseResponse(res, true, 200, 'Streak milestone reward sent successfully', {
            streak: result.streak,
            milestone: result.milestone,
            reward: result.reward
        });
    } catch (error) {
        console.error('Send streak milestone reward controller error:', error);
        return baseResponse(res, false, 500, 'Failed to send streak milestone reward', null);
    }
};
