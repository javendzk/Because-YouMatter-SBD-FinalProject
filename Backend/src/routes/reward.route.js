const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/reward.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', rewardController.getAllRewards);
router.get('/user', authMiddleware.verifyToken, rewardController.getUserRewards);
module.exports = router;
