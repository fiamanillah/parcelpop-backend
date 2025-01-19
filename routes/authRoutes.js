const express = require('express');
const {
    register,
    login,
    refreshAccessToken,
    updateUserRole,
    getPrivateUserData,
    updateProfilePicture,
    getDeliveryMen,
} = require('../controllers/authController');
const authenticateJWT = require('../middleware/authMiddleware'); // Protect routes
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../utils/multerUtils');

const authRoutes = express.Router();

// User registration with email/password
authRoutes.post('/register', upload.single('profileImage'), register);

authRoutes.post('/login', login);

// Route to update profile picture
authRoutes.put(
    '/profile-picture-update',
    authenticateJWT,
    upload.single('profilePicture'),
    updateProfilePicture
);

authRoutes.post('/refresh-token', refreshAccessToken); // Route to refresh access token

// Example of a protected route
authRoutes.get('/privateUserData/:_id', authenticateJWT, getPrivateUserData);

authRoutes.patch('/update-role', authenticateJWT, roleMiddleware(['Admin']), updateUserRole);

// GET /api/delivery-men
authRoutes.get('/delivery-men', getDeliveryMen);

module.exports = authRoutes;
