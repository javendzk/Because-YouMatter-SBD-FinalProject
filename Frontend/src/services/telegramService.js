import apiClient from './api';

const telegramService = {
  sendLogToTelegram: async (logId) => {
    const response = await apiClient.post('/telegram/send', { logId });
    return response.data;
  },

  sendLatestToTelegram: async () => {
    const response = await apiClient.post('/telegram/send-latest');
    return response.data;
  }
};

export default telegramService;
