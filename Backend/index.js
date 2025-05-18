const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const corsConfig = require('./src/configs/cors.config');
const pgConfig = require('./src/configs/pg.config');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const userRoutes = require('./src/routes/user.route');
const logRoutes = require('./src/routes/log.route');
const telegramRoutes = require('./src/routes/telegram.route');
const rewardRoutes = require('./src/routes/reward.route');

const cronJobs = require('./src/crons/cron.jobs');

pgConfig.connect();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors(corsConfig));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send("Welcome to YouMatter API");
});


app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/rewards', rewardRoutes);


app.listen(PORT, () => {
    console.log(`[v] Server running on port ${PORT}!`);
    
    cronJobs.resetLoginStatusJob();
    cronJobs.sendRemindersJob();
    cronJobs.checkBirthdaysJob();
    
    console.log('[v] Cron jobs scheduled');
});
