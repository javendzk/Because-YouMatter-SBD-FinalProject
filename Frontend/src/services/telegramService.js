// Telegram related API services
import apiClient from './api';

// Telegram services
const telegramService = {
  // Send a specific log feedback to Telegram
  sendLogToTelegram: async (logId) => {
    const response = await apiClient.post('/telegram/send', { logId });
    return response.data;
  },

  // Send the latest log feedback to Telegram
  sendLatestToTelegram: async () => {
    const response = await apiClient.post('/telegram/send-latest');
    return response.data;
  }
};

export default telegramService;
