const express = require('express');
const router = express.Router();
const {
    createParcel,
    getAllParcels,
    getParcelById,
    updateParcel,
    getMyParcels,
} = require('../controllers/parcelController'); // Adjust the path

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

module.exports = router;
