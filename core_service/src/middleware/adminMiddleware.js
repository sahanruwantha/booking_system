const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.userType === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
};

module.exports = adminMiddleware; 