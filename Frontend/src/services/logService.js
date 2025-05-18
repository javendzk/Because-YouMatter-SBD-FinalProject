// Daily log related API services
import apiClient from './api';

// Log management services
const logService = {
  // Create a new daily log
  createDailyLog: async (logData) => {
    const response = await apiClient.post('/logs', logData);
    return response.data;
  },

  // Get all user logs
  getUserLogs: async () => {
    const response = await apiClient.get('/logs');
    return response.data;
  },

  // Get log by ID
  getLogById: async (logId) => {
    const response = await apiClient.get(`/logs/${logId}`);
    return response.data;
  },

  // Delete a log
  deleteLog: async (logId) => {
    const response = await apiClient.delete(`/logs/${logId}`);
    return response.data;
  },

  // Check if user has logged today (helper function)
  hasLoggedToday: async () => {
    try {
      const response = await apiClient.get('/logs');
      if (response.data.success && response.data.data.length > 0) {
        // Get the most recent log
        const logs = response.data.data;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Check if the most recent log is from today
        const latestLog = logs[0]; // Assuming the backend returns logs in descending order
        const logDate = new Date(latestLog.date).toISOString().split('T')[0];
        
        return logDate === today;
      }
      return false;
    } catch (error) {
      console.error('Error checking if user has logged today:', error);
      return false;
    }
  },

  // Calculate user stats from logs
  calculateUserStats: async () => {
    try {
      const response = await apiClient.get('/logs');
      if (!response.data.success) {
        return {
          totalDays: 0,
          goodDays: 0,
          stressedDays: 0,
          goodDaysPercentage: 0
        };
      }

      const logs = response.data.data;
      const totalDays = logs.length;
      const goodDays = logs.filter(log => 
        log.mood === 'awesome' || log.mood === 'good'
      ).length;
      const stressedDays = logs.filter(log => 
        log.mood === 'bad' || log.mood === 'terrible'
      ).length;
      const goodDaysPercentage = totalDays > 0 ? Math.round((goodDays / totalDays) * 100) : 0;

      return {
        totalDays,
        goodDays,
        stressedDays,
        goodDaysPercentage
      };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      return {
        totalDays: 0,
        goodDays: 0,
        stressedDays: 0,
        goodDaysPercentage: 0
      };
    }
  }
};

export default logService;
