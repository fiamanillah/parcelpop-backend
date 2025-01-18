const express = require('express');
const router = express.Router();
const {
    createParcel,
    getAllParcels,
    getParcelById,
    updateParcel,
    getMyParcels,
    cancelParcelBooking,
} = require('../controllers/parcelController'); // Adjust the path
const authenticateJWT = require('../middleware/authMiddleware');

// Create a parcel
router.post('/create', createParcel);

// Get all parcels
router.get('/all-parcel', getAllParcels);

// Get parcel by ID
router.get('/parcelById/:id', getParcelById);

// PUT route to update parcel
router.put('/updateParcel/:id', updateParcel);

// GET route to fetch parcels by userId
router.get('/myParcel/:userId', getMyParcels);

// DELETE route to cancel a parcel booking
router.delete('/cancelMyBooking/:parcelId', authenticateJWT, cancelParcelBooking);

module.exports = router;
