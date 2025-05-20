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

  // Update an existing log by ID
  updateDailyLog: async (logId, logData) => {
    // Pastikan data memiliki format yang diharapkan oleh backend
    const formattedData = {
      mood: logData.mood,
      day_description: logData.day_description || "" // Pastikan day_description ada
    };
    
    console.log(`LOG SERVICE: Updating daily log ID ${logId} with data:`, formattedData);
    const response = await apiClient.put(`/logs/${logId}`, formattedData);
    return response.data;
  },

  // Get today's log (helper function)
  getTodayLog: async () => {
    try {
      const response = await apiClient.get('/logs');
      console.log('LOG SERVICE: Getting today\'s log');
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        // Get all logs
        const logs = response.data.data;
        
        // Get today's date in Jakarta timezone (GMT+7)
        const today = new Date();
        const jakartaOffset = 7 * 60; // Jakarta is GMT+7 (7 hours = 420 minutes)
        const userOffset = today.getTimezoneOffset(); // User's timezone offset in minutes
        const jakartaTime = new Date(today.getTime() + (jakartaOffset + userOffset) * 60000);
        const jakartaDateString = jakartaTime.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Find today's log by comparing dates
        for (const log of logs) {
          // First, check if we have the pre-formatted date from backend
          if (log.date_formatted && log.date_formatted === jakartaDateString) {
            console.log('LOG SERVICE: Found today\'s log with ID:', log.log_id);
            return log;
          }
          
          // Fallback to manual date conversion if date_formatted is not available
          if (log.date) {
            const logDate = new Date(log.date);
            const logDateJakarta = new Date(logDate.getTime() + (jakartaOffset + userOffset) * 60000);
            const logDateString = logDateJakarta.toISOString().split('T')[0];
            
            if (logDateString === jakartaDateString) {
              console.log('LOG SERVICE: Found today\'s log with ID:', log.log_id);
              return log;
            }
          }
        }
      }
      
      console.log('LOG SERVICE: No log found for today');
      return null;
    } catch (error) {
      console.error('Error getting today\'s log:', error);
      return null;
    }
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
      console.log('LOG SERVICE: Response status:', response.data.success);
      console.log('LOG SERVICE: Logs count:', response.data.data ? response.data.data.length : 0);
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        // Get the most recent log
        const logs = response.data.data;
        
        // Sort logs by date (newest first)
        const sortedLogs = [...logs].sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
          // Get today's date in Jakarta timezone (GMT+7)
        const today = new Date();
        const jakartaOffset = 7 * 60; // Jakarta is GMT+7 (7 hours = 420 minutes)
        const userOffset = today.getTimezoneOffset(); // User's timezone offset in minutes
        const jakartaTime = new Date(today.getTime() + (jakartaOffset + userOffset) * 60000);
        const jakartaDateString = jakartaTime.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Compare with the most recent log's date
        const latestLog = sortedLogs[0];
        console.log('LOG SERVICE: Latest log data:', latestLog);
        
        // First, check if we have the pre-formatted date from backend
        if (latestLog.date_formatted) {
          console.log('LOG SERVICE: Using pre-formatted date from backend:', latestLog.date_formatted);
          return latestLog.date_formatted === jakartaDateString;
        }
        
        if (!latestLog.date) {
          console.log('LOG SERVICE: Latest log does not have date field');
          return false;
        }
        
        // Convert log date to Jakarta timezone for consistent comparison
        const logDate = new Date(latestLog.date);
        // Account for timezone differences by using ISO date string (YYYY-MM-DD)
        const logDateJakarta = new Date(logDate.getTime() + (jakartaOffset + userOffset) * 60000);
        const logDateString = logDateJakarta.toISOString().split('T')[0];
        
        console.log('LOG SERVICE: Today (Jakarta time):', jakartaDateString);
        console.log('LOG SERVICE: Latest log date (Jakarta time):', logDateString);
        console.log('LOG SERVICE: Do dates match?', logDateString === jakartaDateString);
        
        return logDateString === jakartaDateString;
      }
      
      console.log('LOG SERVICE: No logs found or request unsuccessful');
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
