// Reward related API services
import apiClient from './api';

// Reward services
const rewardService = {
  // Get all available rewards
  getAllRewards: async () => {
    const response = await apiClient.get('/rewards');
    console.log('getAllRewards response:', response.data);
    return response.data;
  },

  // Get user's available rewards based on streak
  getUserRewards: async () => {
    const response = await apiClient.get('/rewards/user');
    console.log('getUserRewards response:', response.data);
    return response.data;
  },

  // Send milestone reward when streak is multiple of 7
  sendMilestoneReward: async () => {
    const response = await apiClient.post('/rewards/send-milestone');
    console.log('sendMilestoneReward response:', response.data);
    return response.data;
  },

  // Get user's streak information
  getUserStreak: async () => {
    try {
      console.log('Fetching user streak information...');
      const response = await apiClient.get('/rewards/user');
      console.log('getUserStreak response:', response.data);
      // Return data in expected format
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

  // Helper function to check if user's streak is a milestone (multiple of 7)
  isMilestoneStreak: (streak) => {
    return streak > 0 && streak % 7 === 0;
  }
};

export default rewardService;
