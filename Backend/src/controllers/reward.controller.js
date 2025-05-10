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
