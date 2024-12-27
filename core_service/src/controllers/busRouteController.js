const BusRoute = require('../utils/route_utils');
const { ErrorResponseDto } = require('../models/bus-model');

const getRoute = async (req, res, next) => {
    try {
        // Set JSON content type header
        res.setHeader('Content-Type', 'application/json');

        const route = await BusRoute.get_route(req.params.start, req.params.end);
        
        // Log the route for debugging
        console.log('Route result:', route);

        if (route.error) {
            // Return JSON error response
            return res.status(404).json({
                error: route.error,
                message: `No route found between ${req.params.start} and ${req.params.end}`
            });
        }

        // Return JSON success response
        res.json({
            route: route.route,
            stops: route.stops,
            numberOfStops: route.stops.length
        });
    } catch (error) {
        console.error('Route error:', error);
        // Return JSON error response
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

const listRoutes = async (req, res) => {
    try {
        const routes = await BusRoute.list_routes();
        res.json({ routes });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

const getRouteStops = async (req, res) => {
    try {
        const stops = await BusRoute.get_route_stops(req.params.routeName);
        res.json({ stops });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

const addRoute = async (req, res) => {
    try {
        const { routeName, stops } = req.body;
        const result = await BusRoute.add_route(routeName, stops);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

module.exports = {
    getRoute,
    listRoutes,
    getRouteStops,
    addRoute
};