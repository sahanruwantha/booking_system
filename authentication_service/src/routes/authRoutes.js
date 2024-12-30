const express = require('express');
const router = express.Router();
const auth_controller = require('../controllers/authController')

router.post('/register', auth_controller.register)

router.post('/login', auth_controller.login)

router.post('/verify', auth_controller.verifyToken)

router.post('/refresh', auth_controller.refreshToken)

module.exports = router; 