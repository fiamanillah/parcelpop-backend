const jwt = require('jsonwebtoken');

// Generate Access Token
const generateAccessToken = user => {
    return jwt.sign({ _id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
};

// Generate Refresh Token
const generateRefreshToken = user => {
    return jwt.sign({ _id: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
};

const verifyAccessToken = token => {
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Access token verification failed:', error.message);
        }
        throw error; // Re-throw error to allow middleware to handle it
    }
};

const verifyRefreshToken = token => {
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Refresh token verification failed:', error.message);
        }
        throw error; // Re-throw error to allow higher-level logic to handle it
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
