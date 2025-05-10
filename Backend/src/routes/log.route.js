const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validatorMiddleware = require('../middlewares/validator.middleware');

router.use(authMiddleware.verifyToken);
router.post('/', validatorMiddleware.validateDailyLog, logController.createDailyLog);
router.get('/', logController.getUserLogs);
router.get('/:id', logController.getLogById);
router.delete('/:id', logController.deleteLog);
module.exports = router;
