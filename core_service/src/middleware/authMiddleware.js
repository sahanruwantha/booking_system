const axios = require('axios');

const AUTH_SERVER = process.env.AUTH_SERVER || 'http://localhost:3001';

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
    }

    try {
        const response = await axios.post(`${AUTH_SERVER}/auth/verify`, { token });
        req.user = response.data.user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.userType)) {
            return res.status(403).json({ 
                error: 'You do not have permission to perform this action' 
            });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
}; 