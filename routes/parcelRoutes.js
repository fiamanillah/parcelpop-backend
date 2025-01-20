const express = require('express');
const router = express.Router();
const {
    createParcel,
    getAllParcels,
    getParcelById,
    updateParcel,
    getMyParcels,
    cancelParcelBooking,
    filterParcels,
    assignDeliveryMan,
    getParcelsForDeliveryMan,
    addReview,
    getMyReviews,
    updateParcelStatus,
    getAppStatistics,
    getTopDeliveryMen,
    getStatisticsData,
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

// Route for filtering parcels
router.get('/filterByDate', filterParcels);

// PATCH route for assigning a deliveryman to a parcel
router.patch('/assign/:id', assignDeliveryMan);

// DELETE route to cancel a parcel booking
router.delete('/cancelBooking/:parcelId', authenticateJWT, cancelParcelBooking);

// Route to get parcels for the delivery man
router.get('/parcelForDeliveryMan', authenticateJWT, getParcelsForDeliveryMan);

// POST /api/reviews
router.post('/reviews', authenticateJWT, addReview);

// GET /api/reviews/my-reviews
router.get('/reviews/my-reviews', authenticateJWT, getMyReviews);

router.patch('/:id/status', updateParcelStatus);

// GET /api/stats
router.get('/stats', getAppStatistics);

router.get('/topDeliveryMan', getTopDeliveryMen);

router.get('/statisticsData', getStatisticsData);
module.exports = router;
