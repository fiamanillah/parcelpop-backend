const { verifyAccessToken } = require('../utils/jwtUtils');

// Middleware to check for the access token
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header is missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token is required' });
    }

    try {
        const user = verifyAccessToken(token);
        if (!user) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user; // Attach user to request
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        } else {
            return res.status(403).json({ message: 'Authentication failed' });
        }
    }
};

module.exports = authenticateJWT;
