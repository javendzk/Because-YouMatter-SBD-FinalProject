// Reward related API services
import apiClient from './api';

// Reward services
const rewardService = {
  // Get all available rewards
  getAllRewards: async () => {
    const response = await apiClient.get('/rewards');
    return response.data;
  },

  // Get user's available rewards based on streak
  getUserRewards: async () => {
    const response = await apiClient.get('/rewards/user');
    return response.data;
  },

  // Send milestone reward when streak is multiple of 7
  sendMilestoneReward: async () => {
    const response = await apiClient.post('/rewards/send-milestone');
    return response.data;
  },

  // Helper function to check if user's streak is a milestone (multiple of 7)
  isMilestoneStreak: (streak) => {
    return streak > 0 && streak % 7 === 0;
  }
};

export default rewardService;
