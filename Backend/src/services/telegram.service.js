const axios = require('axios');
require('dotenv').config();


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
    console.log('[!] Telegram bot token not set!');
}


exports.sendTelegramMessage = async (chatId, message) => {
    try {
        if (!chatId) {
            throw new Error('No Telegram chat ID provided');
        }

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        });

        if (response.data.ok) {
            return {
                success: true,
                message_id: response.data.result.message_id
            };
        } else {
            throw new Error(`Telegram API error: ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        throw error;
    }
};

exports.sendTelegramPhoto = async (chatId, photoUrl, caption) => {
    try {
        if (!chatId) {
            throw new Error('No Telegram chat ID provided');
        }

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
        
        const response = await axios.post(url, {
            chat_id: chatId,
            photo: photoUrl,
            caption: caption,
            parse_mode: 'HTML'
        });

        if (response.data.ok) {
            return {
                success: true,
                message_id: response.data.result.message_id
            };
        } else {
            throw new Error(`Telegram API error: ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        console.error('Error sending Telegram photo:', error);
        throw error;
    }
};
