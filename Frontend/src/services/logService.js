// Daily log related API services
import apiClient from './api';

// Log management services
const logService = {  // Create a new daily log
  createDailyLog: async (logData) => {
    // Pastikan data memiliki format yang diharapkan oleh backend
    const formattedData = {
      mood: logData.mood,
      day_description: logData.day_description || "" // Pastikan day_description ada
    };
    
    console.log('LOG SERVICE: Creating daily log with data:', formattedData);
    const response = await apiClient.post('/logs', formattedData);
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
  },  // Check if user has logged today (helper function)
  hasLoggedToday: async () => {
    try {
      const response = await apiClient.get('/logs');
      console.log('LOG SERVICE: Checking if user has logged today');
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        // Get the logs
        const logs = response.data.data;
        
        // Get today's date in Asia/Jakarta (GMT+7) timezone
        const options = { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' };
        const jakartaDate = new Intl.DateTimeFormat('en-CA', options).format(new Date());
        console.log('LOG SERVICE: Today (Jakarta time):', jakartaDate);
        
        // Check if any log is from today
        for (const log of logs) {
          if (!log.date) continue;
          
          const logDateObj = new Date(log.date);
          const logDate = new Intl.DateTimeFormat('en-CA', options).format(logDateObj);
          console.log('LOG SERVICE: Comparing log date:', logDate);
          
          if (logDate === jakartaDate) {
            console.log('LOG SERVICE: Found a log for today');
            return true;
          }
        }
      }
      
      console.log('LOG SERVICE: No logs found for today');
      return false;
    } catch (error) {
      console.error('Error checking if user has logged today:', error);
      return false;
    }
  },
  // Calculate user stats from logs
  calculateUserStats: async () => {
    try {
      console.log('Calculating user stats...');
      const response = await apiClient.get('/logs');
      console.log('Logs response:', response.data);
      
      if (!response.data.success) {
        console.log('No logs found or error in response');
        return {
          success: false,
          message: response.data.message || 'Failed to fetch logs',
          data: {
            totalDays: 0,
            goodDays: 0,
            stressedDays: 0,
            goodDaysPercentage: 0
          }
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

      const stats = {
        totalDays,
        goodDays,
        stressedDays,
        goodDaysPercentage
      };
      
      console.log('Calculated stats:', stats);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      return {
        success: false,
        message: error.message || 'Error calculating stats',
        data: {
          totalDays: 0,
          goodDays: 0,
          stressedDays: 0,
          goodDaysPercentage: 0
        }
      };
    }
  }
};

export default logService;
