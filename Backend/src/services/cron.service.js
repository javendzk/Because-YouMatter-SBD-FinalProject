const cronRepository = require('../repositories/cron.repository');
const telegramService = require('./telegram.service');
const telegramRepository = require('../repositories/telegram.repository');


exports.resetDailyLogins = async () => {
    try {
        const updatedCount = await cronRepository.resetDailyLoginStatus();
        return { success: true, updatedCount };
    } catch (error) {
        console.error('Error in resetDailyLogins service:', error);
        return { success: false, error: error.message };
    }
};


exports.sendReminderToInactiveUsers = async () => {
    try {
        const inactiveUsers = await cronRepository.getInactiveUsers();
        const results = [];
        
        const reminderMessages = [
            username => `Hi ${username}! 💖 We miss hearing from you today. How are you feeling? Your daily check-in is waiting for you. Your mental wellbeing matters to us!`,
            username => `Hello wonderful ${username}! ✨ Just a gentle nudge to share your day with us. Taking a moment for yourself can make a big difference in your mental health journey.`,
            username => `${username}, we care about you! 🌈 How's your day going? Taking time to reflect on your feelings helps build emotional resilience. We'd love to hear from you today.`,
            username => `Dear ${username}, 🌟 Your daily reflection is missing! Remember that tracking your moods helps you understand yourself better. We're here to support your journey.`,
            username => `${username}! 🤗 It's time for your daily check-in. Even on busy days, a moment of reflection can bring clarity and peace. How are you feeling today?`
        ];
        
        for (const user of inactiveUsers) {
            if (user.telegram_id) {
                try {
                    const randomIndex = Math.floor(Math.random() * reminderMessages.length);
                    const reminderMessage = reminderMessages[randomIndex](user.username);
                    
                    await telegramService.sendTelegramMessage(user.telegram_id, reminderMessage);
                    await telegramRepository.createTelegramLog({
                        userId: user.user_id,
                        messageContent: reminderMessage
                    });
                    results.push({
                        userId: user.user_id,
                        username: user.username,
                        success: true,
                        message: 'Reminder sent'
                    });
                } catch (error) {
                    console.error(`Error sending reminder to user ${user.user_id}:`, error);
                    results.push({
                        userId: user.user_id,
                        username: user.username,
                        success: false,
                        error: error.message
                    });
                }
            }
        }
        return {
            success: true,
            totalUsers: inactiveUsers.length,
            results
        };
    } catch (error) {
        console.error('Error in sendReminderToInactiveUsers service:', error);
        return { success: false, error: error.message };
    }
};
