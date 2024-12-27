const express = require('express');
const router = express.Router();
const busRouteController = require('../controllers/busRouteController');
const busBookController = require('../controllers/busBookController');
const { authenticateToken } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes
router.get('/routes', busRouteController.listRoutes);
router.get('/routes/:routeName/stops', busRouteController.getRouteStops);

// Protected routes that require admin access
router.get('/trips', authenticateToken, adminMiddleware, busBookController.getTripsController);
router.get('/trips/:id', authenticateToken, adminMiddleware, busBookController.getTripByIdController);
router.post('/trip/create', authenticateToken, adminMiddleware, busBookController.createTripController);
router.put('/trips/:id', authenticateToken, adminMiddleware, busBookController.updateTripController);
router.delete('/trips/:id', authenticateToken, adminMiddleware, busBookController.deleteTripController);

// Protected routes for all authenticated users
router.post('/route/get', authenticateToken, busBookController.getTripController);
router.post('/routes', authenticateToken, adminMiddleware, busRouteController.addRoute);
router.post('/trip/book', authenticateToken, busBookController.bookSeatsController);
router.get('/trips/:tripId/seats', authenticateToken, busBookController.getBookedSeatsController);

module.exports = router;
