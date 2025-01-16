const express = require('express');
const { register, loginUser, googleLogin } = require('../controllers/authController');
const authRoutes = express.Router();

// User registration with email/password
authRoutes.post('/register', register);

module.exports = authRoutes;
