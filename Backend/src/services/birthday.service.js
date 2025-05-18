const db = require('../configs/pg.config');
const telegramService = require('./telegram.service');
const telegramRepository = require('../repositories/telegram.repository');


exports.checkAndSendBirthdayGreetings = async () => {
    try {
        const birthdayUsersResult = await db.query(
            `SELECT * FROM get_users_with_birthday_today()`
        );
        
        const birthdayUsers = birthdayUsersResult.rows;
        const results = [];
        
        for (const user of birthdayUsers) {
            try {
                const name = user.fullname || user.username || 'friend';
                const birthdayMessage = generateBirthdayMessage(name);
                
                await telegramService.sendTelegramMessage(user.telegram_id, birthdayMessage);
                
                await telegramRepository.createTelegramLog({
                    userId: user.user_id,
                    messageContent: birthdayMessage
                });
                
                results.push({
                    userId: user.user_id,
                    name: name,
                    success: true,
                    message: 'Birthday greeting sent successfully'
                });
                
                console.log(`Birthday greeting sent to user ${name} (ID: ${user.user_id})`);
            } catch (error) {
                console.error(`Error sending birthday greeting to user ${user.user_id}:`, error);
                results.push({
                    userId: user.user_id,
                    name: user.fullname || user.username,
                    success: false,
                    error: error.message
                });
            }
        }
        
        return {
            success: true,
            totalUsers: birthdayUsers.length,
            results
        };
    } catch (error) {
        console.error('Error in checkAndSendBirthdayGreetings service:', error);
        return { success: false, error: error.message };
    }
};


function generateBirthdayMessage(name) {
    const birthdayMessages = [
        `🎉 Happy Birthday, ${name}! 🎂 Today is all about YOU! May your day be filled with joy, laughter, and wonderful memories. Remember that your mental well-being is precious, so take time to celebrate yourself today. You deserve all the happiness in the world! 🎁✨`,
        
        `🎂 It's your special day, ${name}! 🎈 Wishing you a birthday filled with peace, happiness, and everything that brings a smile to your face. Take a moment today to appreciate how far you've come and all the growth you've experienced. Celebrate yourself! 🥳`,
        
        `🌟 Happy Birthday to the amazing ${name}! 🎊 Your journey of growth and resilience inspires us all. May your new year ahead be filled with self-discovery, joy, and moments of calm reflection. Today is your day to shine! 🎂`,
        
        `🎁 Birthday wishes to our wonderful ${name}! 🎉 On this special day, I hope you take time to nurture your spirit and celebrate the unique, amazing person you are. Your presence in this world makes such a difference. Enjoy your celebration! 🎂💕`,
        
        `🎊 Happy Birthday, dear ${name}! 🎈 May this new year of life bring you strength for challenges, joy in simple moments, and peace within yourself. You deserve to be celebrated today and every day! 🎂✨`
    ];
    
    const randomIndex = Math.floor(Math.random() * birthdayMessages.length);
    return birthdayMessages[randomIndex];
}
