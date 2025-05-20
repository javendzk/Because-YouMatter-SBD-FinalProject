const cron = require('node-cron');
const cronService = require('../services/cron.service');
const birthdayService = require('../services/birthday.service');


const resetLoginStatusJob = () => {
    cron.schedule('0 0 * * *', async () => {
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


const checkBirthdaysJob = () => {
    cron.schedule('0 9 * * *', async () => {
        console.log('Running birthday check job at 9:00 AM Jakarta time');
        const result = await birthdayService.checkAndSendBirthdayGreetings();
        console.log('Birthday check result:', result);
    }, {
        scheduled: true,
        timezone: "Asia/Jakarta"
    });
};


module.exports = {
    resetLoginStatusJob,
    sendRemindersJob,
    checkBirthdaysJob
};
