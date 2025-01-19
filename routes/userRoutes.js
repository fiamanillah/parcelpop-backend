const express = require('express');
const { getAllUsers } = require('../controllers/userController'); // Adjust the path as needed

const router = express.Router();

// Route to get all users with pagination
router.get('/users', getAllUsers);

module.exports = router;
