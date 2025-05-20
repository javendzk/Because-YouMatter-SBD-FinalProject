import apiClient from './api';

const rewardService = {
  getAllRewards: async () => {
    const response = await apiClient.get('/rewards');
    return response.data;
  },

  getUserRewards: async () => {
    const response = await apiClient.get('/rewards/user');
    return response.data;
  },

  sendMilestoneReward: async () => {
    const response = await apiClient.post('/rewards/send-milestone');
    return response.data;
  },

  getUserStreak: async () => {
    try {
      const response = await apiClient.get('/rewards/user');
      return {
        success: response.data.success,
        data: {
          currentStreak: response.data.data?.streak || 0,
          rewards: response.data.data?.rewards || []
        }
      };
    } catch (error) {
      console.error('Error fetching user streak:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch streak information',
        data: { currentStreak: 0, rewards: [] }
      };
    }
  },

  isMilestoneStreak: (streak) => {
    return streak > 0 && streak % 7 === 0;
  }
};

export default rewardService;
