const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const routeUtils = require('./route_utils');

const createTrip = async (bus_route, driver_name, conductor_name, trip_date) => {
    const trip_id = uuidv4();
    const formattedDate = trip_date.toISOString();
    
    await db.run(
        'INSERT INTO trips (trip_id, bus_route, driver_name, conductor_name, trip_date) VALUES (?, ?, ?, ?, ?)',
        [trip_id, bus_route, driver_name, conductor_name, formattedDate]
    );
    
    return trip_id;
};

const bookSeats = async (trip_id, user_id, seat_ids) => {
    const bookingIds = [];
    const timestamp = new Date().toISOString();

    // Check if seats are already booked
    const existingSeats = await db.all(
        'SELECT seat_id FROM seat_bookings WHERE trip_id = ? AND seat_id IN (?)',
        [trip_id, seat_ids.join(',')]
    );

    if (existingSeats.length > 0) {
        throw new Error('One or more seats are already booked');
    }

    // Book all seats
    for (const seat_id of seat_ids) {
        const booking_id = uuidv4();
        await db.run(
            'INSERT INTO seat_bookings (booking_id, trip_id, user_id, seat_id, created_at) VALUES (?, ?, ?, ?, ?)',
            [booking_id, trip_id, user_id, seat_id, timestamp]
        );
        bookingIds.push(booking_id);
    }

    return bookingIds;
};

const getTrips = async (start, end, date) => {
    const routeInfo = await routeUtils.get_route(start, end);
    if (routeInfo.error) {
        return { error: routeInfo.error };
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const trips = await db.all(
        'SELECT trip_id, trip_date FROM trips WHERE bus_route = ? AND trip_date BETWEEN ? AND ?',
        [
            routeInfo.route.replace(' (Reverse Direction)', ''),
            startOfDay.toISOString(),
            endOfDay.toISOString()
        ]
    );
    
    return {
        route: routeInfo.route,
        stops: routeInfo.stops,
        numberOfStops: routeInfo.numberOfStops,
        availableTrips: trips
    };
};

module.exports = {
    createTrip,
    bookSeats,
    getTrips
};

