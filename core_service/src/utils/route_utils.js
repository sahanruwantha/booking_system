const db = require('./db');

async function get_route(start, end) {
    console.log('Getting route from', start, 'to', end);
    const query = `
        WITH RECURSIVE route_path AS (
            SELECT 
                r.id as route_id,
                r.route_name,
                rs.stop_order,
                t.town_name,
                1 as depth,
                t.town_name as path
            FROM busroutes r
            JOIN route_stops rs ON r.id = rs.route_id
            JOIN towns t ON rs.town_id = t.town_id
            WHERE t.town_name = ?

            UNION ALL

            SELECT 
                rp.route_id,
                rp.route_name,
                rs.stop_order,
                t.town_name,
                rp.depth + 1,
                rp.path || ' -> ' || t.town_name
            FROM route_path rp
            JOIN route_stops rs ON rp.route_id = rs.route_id
            JOIN towns t ON rs.town_id = t.town_id
            WHERE rs.stop_order > rp.stop_order
            AND rp.depth < 20
        )
        SELECT 
            route_name as route,
            path,
            depth - 1 as numberOfStops
        FROM route_path
        WHERE town_name = ?
        AND path LIKE ? || '%' || ?
        ORDER BY depth
        LIMIT 1`;

    try {
        // Try forward direction
        let row = await db.get(query, [start, end, start, end]);
        if (row) {
            return {
                route: row.route,
                stops: row.path.split(' -> '),
                numberOfStops: row.numberOfStops
            };
        }

        // Try reverse direction
        row = await db.get(query, [end, start, end, start]);
        if (row) {
            return {
                route: row.route + ' (Reverse Direction)',
                stops: row.path.split(' -> ').reverse(),
                numberOfStops: row.numberOfStops
            };
        }

        return {
            error: "No direct route found between these towns"
        };
    } catch (err) {
        throw err;
    }
}

async function list_routes() {
    const rows = await db.all("SELECT route_name FROM busroutes", []);
    return rows.map(row => row.route_name);
}

async function get_route_stops(routeName) {
    const query = `
        SELECT t.town_name
        FROM busroutes r
        JOIN route_stops rs ON r.id = rs.route_id
        JOIN towns t ON rs.town_id = t.town_id
        WHERE r.route_name = ?
        ORDER BY rs.stop_order`;
        
    const rows = await db.all(query, [routeName]);
    return rows.map(row => row.town_name);
}

async function add_route(routeName, stops) {
    try {
        await db.run('BEGIN TRANSACTION');

        // Insert route
        const routeResult = await db.run('INSERT INTO busroutes (route_name) VALUES (?)', [routeName]);
        const routeId = routeResult.lastID;

        // Insert stops
        for (let i = 0; i < stops.length; i++) {
            const town = stops[i];
            
            // Insert town if it doesn't exist
            await db.run('INSERT OR IGNORE INTO towns (town_name) VALUES (?)', [town]);
            
            // Get town_id
            const townRow = await db.get('SELECT town_id FROM towns WHERE town_name = ?', [town]);
            
            // Insert route stop
            await db.run(
                'INSERT INTO route_stops (route_id, town_id, stop_order) VALUES (?, ?, ?)',
                [routeId, townRow.town_id, i]
            );
        }

        await db.run('COMMIT');
        return {
            message: "Route added successfully",
            routeId: routeId
        };
    } catch (err) {
        await db.run('ROLLBACK');
        throw err;
    }
}

module.exports = {
    get_route,
    list_routes,
    get_route_stops,
    add_route
};