const { createTrip, bookSeats, getTrips } = require('../utils/book_utils');
const { getUser } = require('../utils/user_utils');
const db = require('../utils/db');

const getTripController = async (req, res) => {
    try {
        const { start, end, date } = req.body;
        if (!start || !end || !date) {
            return res.status(400).json({ error: 'Start, end locations and date are required' });
        }

        const trips = await getTrips(start, end, date);
        console.log(trips);
        if (trips.error) {
            return res.status(404).json({ error: trips.error });
        }
        res.json(trips);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createTripController = async (req, res) => {
    try {
        const { bus_route, driver_name, conductor_name, trip_date } = req.body;
        
        const tripDate = new Date(trip_date);
        const trip_id = await createTrip(bus_route, driver_name, conductor_name, tripDate);
        
        res.status(201).json({
            success: true,
            trip_id,
            message: 'Trip created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create trip',
            error: error.message
        });
    }
};

const bookSeatsController = async (req, res) => {
    try {
        const { trip_id, seat_ids } = req.body;
        const user_id = req.user.userId;
        
        if (!trip_id || !seat_ids || !Array.isArray(seat_ids)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request parameters'
            });
        }

        const bookingIds = await bookSeats(trip_id, user_id, seat_ids);
        
        res.status(201).json({
            success: true,
            booking_ids: bookingIds,
            message: 'Seats booked successfully'
        });
    } catch (error) {
        const statusCode = error.message.includes('UNIQUE constraint failed') ? 409 : 500;
        res.status(statusCode).json({
            success: false,
            message: statusCode === 409 ? 'One or more seats are already booked' : 'Failed to book seats',
            error: error.message
        });
    }
};

const getBookedSeatsController = async (req, res) => {
    try {
        const { tripId } = req.params;
        console.log(tripId);
        
        // Convert the callback-based db.all to a Promise
        const bookedSeats = await db.all(
            'SELECT seat_id FROM seat_bookings WHERE trip_id = ?',
            [tripId]
        );

        // Transform the results to just an array of seat IDs
        const seatIds = bookedSeats.map(seat => seat.seat_id);
        console.log(seatIds);
        
        res.json({ 
            success: true,
            bookedSeats: seatIds 
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booked seats',
            error: error.message
        });
    }
};

const getTripsController = async (req, res) => {
    try {
        const trips = await db.all('SELECT * FROM trips ORDER BY trip_date DESC');
        res.json({ trips });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trips',
            error: error.message
        });
    }
};

const getTripByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await db.get('SELECT * FROM trips WHERE trip_id = ?', [id]);
        
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        res.json({ trip });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trip',
            error: error.message
        });
    }
};

const updateTripController = async (req, res) => {
    try {
        const { id } = req.params;
        const { bus_route, driver_name, conductor_name, trip_date } = req.body;

        const result = await db.run(
            'UPDATE trips SET bus_route = ?, driver_name = ?, conductor_name = ?, trip_date = ? WHERE trip_id = ?',
            [bus_route, driver_name, conductor_name, trip_date, id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        res.json({
            success: true,
            message: 'Trip updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update trip',
            error: error.message
        });
    }
};

const deleteTripController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.run('DELETE FROM trips WHERE trip_id = ?', [id]);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        res.json({
            success: true,
            message: 'Trip deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete trip',
            error: error.message
        });
    }
};

module.exports = {
    createTripController,
    bookSeatsController,
    getTripController,
    getBookedSeatsController,
    getTripsController,
    getTripByIdController,
    updateTripController,
    deleteTripController
};
