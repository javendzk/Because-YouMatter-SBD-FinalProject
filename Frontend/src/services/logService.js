import apiClient from './api';

const logService = {  
  createDailyLog: async (logData) => {
    const formattedData = {
      mood: logData.mood,
      day_description: logData.day_description || "" 
    };
    
    const response = await apiClient.post('/logs', formattedData);
    return response.data;
  },

  updateDailyLog: async (logId, logData) => {
    const formattedData = {
      mood: logData.mood,
      day_description: logData.day_description || "" 
    };
    
    const response = await apiClient.put(`/logs/${logId}`, formattedData);
    return response.data;
  },

  getTodayLog: async () => {
    try {
      const response = await apiClient.get('/logs');
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const logs = response.data.data;
        
        const today = new Date();
        const jakartaOffset = 7 * 60; 
        const userOffset = today.getTimezoneOffset(); 
        const jakartaTime = new Date(today.getTime() + (jakartaOffset + userOffset) * 60000);
        const jakartaDateString = jakartaTime.toISOString().split('T')[0]; 
        
        for (const log of logs) {
          if (log.date_formatted && log.date_formatted === jakartaDateString) {
            return log;
          }
          
          if (log.date) {
            const logDate = new Date(log.date);
            const logDateJakarta = new Date(logDate.getTime() + (jakartaOffset + userOffset) * 60000);
            const logDateString = logDateJakarta.toISOString().split('T')[0];
            
            if (logDateString === jakartaDateString) {
              return log;
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting today\'s log:', error);
      return null;
    }
  },

  getUserLogs: async () => {
    const response = await apiClient.get('/logs');
    return response.data;
  },

  getLogById: async (logId) => {
    const response = await apiClient.get(`/logs/${logId}`);
    return response.data;
  },

  deleteLog: async (logId) => {
    const response = await apiClient.delete(`/logs/${logId}`);
    return response.data;
  },  
  hasLoggedToday: async () => {
    try {
      const response = await apiClient.get('/logs');
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const logs = response.data.data;
        
        const sortedLogs = [...logs].sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });

        const today = new Date();
        const jakartaOffset = 7 * 60;
        const userOffset = today.getTimezoneOffset(); 
        const jakartaTime = new Date(today.getTime() + (jakartaOffset + userOffset) * 60000);
        const jakartaDateString = jakartaTime.toISOString().split('T')[0]; 
        
        const latestLog = sortedLogs[0];
        
        if (latestLog.date_formatted) {
          return latestLog.date_formatted === jakartaDateString;
        }
        
        if (!latestLog.date) {
          return false;
        }
        
        const logDate = new Date(latestLog.date);
        const logDateJakarta = new Date(logDate.getTime() + (jakartaOffset + userOffset) * 60000);
        const logDateString = logDateJakarta.toISOString().split('T')[0];        
        return logDateString === jakartaDateString;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking if user has logged today:', error);
      return false;
    }
  },

  calculateUserStats: async () => {
    try {
      const response = await apiClient.get('/logs');
      
      if (!response.data.success) {
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
      

      return {
        success: true,
        data: stats
      };
    } catch (error) {
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
