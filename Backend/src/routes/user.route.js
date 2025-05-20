const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validatorMiddleware = require('../middlewares/validator.middleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/login', (req, res, next) => {
    next();
}, validatorMiddleware.validateUserLogin, userController.login);
router.post('/register', validatorMiddleware.validateUserRegistration, userController.register);
router.get('/profile', authMiddleware.verifyToken, userController.getUserProfile);
router.put('/profile', authMiddleware.verifyToken, upload.single('image'), userController.updateProfile);

module.exports = router;
