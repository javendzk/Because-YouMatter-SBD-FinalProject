const express = require('express');
const router = express.Router();
const telegramController = require('../controllers/telegram.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware.verifyToken);
router.post('/send', telegramController.sendTelegramFeedback);
router.post('/send-latest', telegramController.sendLatestFeedback);
module.exports = router;
