const cron = require('node-cron');
const cronService = require('../services/cron.service');


const resetLoginStatusJob = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily login reset job at midnight Jakarta time');
        const result = await cronService.resetDailyLogins();
        console.log('Reset daily login status result:', result);
    }, {
        scheduled: true,
        timezone: "Asia/Jakarta"
    });
};


const sendRemindersJob = () => {
    cron.schedule('0 17 * * *', async () => {
        console.log('Running reminder job at 5:00 PM Jakarta time');
        const result = await cronService.sendReminderToInactiveUsers();
        console.log('Send reminders result:', result);
    }, {
        scheduled: true,
        timezone: "Asia/Jakarta"
    });
};


module.exports = {
    resetLoginStatusJob,
    sendRemindersJob
};
