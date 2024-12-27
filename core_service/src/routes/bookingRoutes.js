const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const busBookController = require('../controllers/busBookController');


router.post('/book', authenticateToken, busBookController.bookSeatsController);
router.get('/seats/:tripId', authenticateToken, busBookController.getBookedSeatsController);
router.post('/trip', authenticateToken, busBookController.getTripController);
router.post('/trip/create', authenticateToken, busBookController.createTripController);

module.exports = router; 
