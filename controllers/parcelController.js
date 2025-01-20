const Parcel = require('../models/parcelSchema'); // Adjust the path to your Parcel model
const Review = require('../models/reviewSchema'); // Adjust the path to your Parcel model
const User = require('../models/User');

// Save a new parcel to the database
const createParcel = async (req, res) => {
    try {
        const {
            userId,
            userName,
            userEmail,
            userPhone,
            parcelType,
            parcelWeight,
            receiverName,
            receiverPhone,
            deliveryAddress,
            deliveryLat,
            deliveryLng,
            price,
            requestedDeliveryDate,
            approximateDeliveryDate,
            deliveryManId,
            status,
        } = req.body;

        console.log(req.body);

        const newParcel = new Parcel({
            userId,
            userName,
            userEmail,
            userPhone,
            parcelType,
            parcelWeight,
            receiverName,
            receiverPhone,
            deliveryAddress,
            deliveryLat,
            deliveryLng,
            price,
            requestedDeliveryDate,
            approximateDeliveryDate,
            deliveryManId,
            status,
        });

        const savedParcel = await newParcel.save();
        res.status(201).json({
            success: true,
            message: 'Parcel created successfully',
            data: savedParcel,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error creating parcel',
            error: error.message,
        });
    }
};

const updateParcel = async (req, res) => {
    try {
        const { id } = req.params; // Parcel ID
        const updates = req.body; // Fields to update

        // Find the parcel by ID
        const parcel = await Parcel.findById({ _id: id });

        if (!parcel) {
            return res.status(404).json({
                success: false,
                message: 'Parcel not found',
            });
        }

        // Check if the parcel is in "Pending" status
        if (parcel.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Parcel can only be updated when status is "Pending".',
            });
        }

        // Update the parcel details
        Object.keys(updates).forEach(key => {
            parcel[key] = updates[key];
        });

        // Save the updated parcel
        const updatedParcel = await parcel.save();

        res.status(200).json({
            success: true,
            message: 'Parcel updated successfully',
            data: updatedParcel,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating parcel',
            error: error.message,
        });
    }
};

// Get all parcels
const getAllParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find().populate('userId').populate('deliveryManId');
        res.status(200).json({ success: true, data: parcels });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching parcels',
            error: error.message,
        });
    }
};

// Get a parcel by ID
const getParcelById = async (req, res) => {
    try {
        const { id } = req.params;
        const parcel = await Parcel.findById(id).populate('userId').populate('deliveryManId');
        if (!parcel) {
            return res.status(404).json({ success: false, message: 'Parcel not found' });
        }
        res.status(200).json({ success: true, data: parcel });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching parcel',
            error: error.message,
        });
    }
};

const getMyParcels = async (req, res) => {
    try {
        const { userId } = req.params; // Get the userId from the request parameters

        // Find parcels where userId matches and return only necessary fields
        const parcels = await Parcel.find({ userId });

        if (parcels.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No parcels found for this user.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Parcels fetched successfully',
            data: parcels,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching parcels',
            error: error.message,
        });
    }
};

const cancelParcelBooking = async (req, res) => {
    try {
        const { parcelId } = req.params; // Get the parcelId from the request parameters
        const user = req.user; // Assuming userId is available via authentication middleware

        // Find the parcel by its ID and ensure it's the user's parcel
        const parcel = await Parcel.findById(parcelId);
        console.log(parcel.userId, user._id);

        if (!parcel) {
            return res.status(404).json({
                success: false,
                message: 'Parcel not found.',
            });
        }

        // Ensure the parcel belongs to the logged-in user
        if (parcel.userId.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only cancel your own parcels.',
            });
        }

        // Check if the parcel is still in "Pending" status
        if (parcel.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'You can only cancel parcels that are in "Pending" status.',
            });
        }

        // Update the parcel status to "Cancelled"
        parcel.status = 'Cancelled';
        await parcel.save();

        res.status(200).json({
            success: true,
            message: 'Parcel booking cancelled successfully.',
            data: parcel,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling parcel booking.',
            error: error.message,
        });
    }
};

// Controller to filter parcels by date range
const filterParcels = async (req, res) => {
    const { dateFrom, dateTo } = req.query; // Getting date range from query params

    console.log(dateFrom, dateTo);

    try {
        // Validate date format (simple validation, you may use a library for robust validation)
        if (!dateFrom || !dateTo) {
            return res.status(400).json({ message: 'Both dateFrom and dateTo are required.' });
        }

        // Convert the dates from string to Date objects
        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({ message: 'Invalid date format.' });
        }

        // Query the database for parcels within the date range
        const parcels = await Parcel.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        });

        // If no parcels found
        if (parcels.length === 0) {
            return res
                .status(404)
                .json({ message: 'No parcels found in the specified date range.' });
        }

        // Return the filtered parcels
        return res.status(200).json(parcels);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// Assign deliveryman and update parcel status
const assignDeliveryMan = async (req, res) => {
    const { id } = req.params; // The parcel ID from the URL
    const { deliveryManId, deliveryDate } = req.body; // The deliveryManId and deliveryDate from the request body

    try {
        // Validate required fields
        if (!deliveryManId || !deliveryDate) {
            return res
                .status(400)
                .json({ message: 'DeliveryManId and deliveryDate are required.' });
        }

        // Find the parcel by ID
        const parcel = await Parcel.findById(id);
        if (!parcel) {
            return res.status(404).json({ message: 'Parcel not found.' });
        }

        // Check if parcel status is not already 'Delivered', 'Returned', or 'Cancelled'
        if (['Delivered', 'Returned', 'Cancelled'].includes(parcel.status)) {
            return res.status(400).json({
                message:
                    'Cannot assign deliveryman to a parcel that is already delivered, returned, or cancelled.',
            });
        }

        // Assign the deliveryManId and update the status
        parcel.deliveryManId = deliveryManId;
        parcel.approximateDeliveryDate = deliveryDate; // Assuming the deliveryDate is approximateDeliveryDate
        parcel.status = 'On The Way'; // Update the parcel status to 'On The Way'

        // Save the updated parcel
        await parcel.save();

        // Respond with the updated parcel details
        return res.status(200).json({
            message: 'Parcel updated successfully.',
            parcel,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to assign deliveryman and update parcel.' });
    }
};

const getParcelsForDeliveryMan = async (req, res) => {
    try {
        const deliveryManId = req.user._id; // Assuming deliveryManId is available from the authentication middleware
        const { page, limit } = req.query; // Pagination parameters

        // Set default values for pagination if not provided
        const pageNumber = parseInt(page) || 1; // Default to page 1
        const pageSize = parseInt(limit) || 0; // If no limit provided, fetch all

        const skip = (pageNumber - 1) * pageSize;

        // Query to find parcels assigned to the delivery man, sorted by latest first
        const query = { deliveryManId };

        const parcelsQuery = Parcel.find(query).sort({ createdAt: -1 }); // Sort by latest first

        // If pagination is enabled, apply skip and limit
        if (pageSize > 0) {
            parcelsQuery.skip(skip).limit(pageSize);
        }

        const parcels = await parcelsQuery.exec();

        // Check if parcels are found
        if (!parcels.length) {
            return res.status(404).json({
                success: false,
                message: 'No parcels found for the delivery man.',
            });
        }

        // Return the parcels with success response
        res.status(200).json({
            success: true,
            message: 'Parcels fetched successfully.',
            data: parcels,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching parcels.',
            error: error.message,
        });
    }
};

// Add a review
const addReview = async (req, res) => {
    try {
        const { deliveryManId, parcelId, rating, feedback } = req.body;

        // Validate input
        if (!deliveryManId || !parcelId || !rating) {
            return res
                .status(400)
                .json({ message: 'DeliveryManId, parcelId, and rating are required.' });
        }

        // Check if the parcel status is 'Delivered'
        const parcel = await Parcel.findOne({
            _id: parcelId,
            deliveryManId,
            status: 'Delivered', // Check if the status is Delivered
        });

        if (!parcel) {
            return res.status(400).json({
                message: 'Cannot add a review. Parcel status must be Delivered.',
            });
        }

        // Check if user has already reviewed this parcel and delivery man
        const existingReview = await Review.findOne({
            userId: req.user._id, // Assuming userId is available in req.user from your auth middleware
            deliveryManId,
            parcelId,
        });

        if (existingReview) {
            return res.status(400).json({
                message: 'You have already reviewed this delivery man for this parcel.',
            });
        }

        // Create and save the new review
        const review = new Review({
            userId: req.user._id, // From auth middleware
            deliveryManId,
            rating,
            feedback,
        });

        await review.save();

        return res.status(201).json({
            message: 'Review added successfully!',
            review,
        });
    } catch (error) {
        console.error('Error adding review:', error);
        return res.status(500).json({
            message: 'An error occurred while adding the review.',
            error: error.message,
        });
    }
};

// Get My Reviews
const getMyReviews = async (req, res) => {
    try {
        const deliveryManId = req.user._id; // Assuming the deliveryManId comes from the auth middleware

        // Fetch reviews for the delivery man
        const reviews = await Review.find({ deliveryManId })
            .populate('userId', 'name email profileImage') // Populate user details for better context
            .sort({ reviewDate: -1 }); // Sort by reviewDate (latest first)

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this delivery man.' });
        }

        return res.status(200).json({
            message: 'Reviews fetched successfully!',
            reviews,
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({
            message: 'An error occurred while fetching reviews.',
            error: error.message,
        });
    }
};

const updateParcelStatus = async (req, res) => {
    try {
        const { id } = req.params; // Parcel ID from the URL
        const { status } = req.body; // New status from the request body

        // Validate input
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required.',
            });
        }

        // Allowed status transitions
        const allowedStatuses = ['Pending', 'On The Way', 'Delivered', 'Returned', 'Cancelled'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(', ')}`,
            });
        }

        // Find the parcel by ID
        const parcel = await Parcel.findById(id);

        if (!parcel) {
            return res.status(404).json({
                success: false,
                message: 'Parcel not found.',
            });
        }

        // Ensure the current status and new status are valid transitions
        const validTransitions = {
            Pending: ['On The Way', 'Cancelled'],
            'On The Way': ['Delivered', 'Cancelled'],
            Delivered: [],
            Cancelled: [],
        };

        if (!validTransitions[parcel.status].includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot transition from '${parcel.status}' to '${status}'.`,
            });
        }

        // Update the status
        parcel.status = status;

        // Save the updated parcel
        const updatedParcel = await parcel.save();

        res.status(200).json({
            success: true,
            message: 'Parcel status updated successfully.',
            data: updatedParcel,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating parcel status.',
            error: error.message,
        });
    }
};

// Controller to get statistics
const getAppStatistics = async (req, res) => {
    try {
        // Get the total number of users
        const totalUsers = await User.countDocuments();

        // Get the total number of parcels booked
        const totalParcelsBooked = await Parcel.countDocuments();

        // Get the total number of parcels delivered
        const totalParcelsDelivered = await Parcel.countDocuments({ status: 'Delivered' });

        // Respond with the aggregated data
        res.status(200).json({
            totalUsers,
            totalParcelsBooked,
            totalParcelsDelivered,
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics.' });
    }
};

const getTopDeliveryMen = async (req, res) => {
    try {
        // Aggregate the parcels data to get top delivery men based on delivered parcels and average rating
        const topDeliveryMen = await Parcel.aggregate([
            // Match parcels that are delivered
            { $match: { status: 'Delivered' } },

            // Group by deliveryManId to calculate the total parcels delivered
            {
                $group: {
                    _id: '$deliveryManId', // Group by deliveryManId (the delivery man's user ID)
                    totalParcelsDelivered: { $sum: 1 }, // Count total delivered parcels for this delivery man
                },
            },

            // Join with the Review collection to calculate average rating for each delivery man
            {
                $lookup: {
                    from: 'reviews', // Review collection name
                    localField: '_id', // Field that links to the delivery man's userId in the Review collection
                    foreignField: 'deliveryManId', // Reference to deliveryManId in the Review collection
                    as: 'reviews', // Output the joined data as 'reviews'
                },
            },

            // Add the average rating field
            {
                $addFields: {
                    averageRating: {
                        $avg: '$reviews.rating', // Calculate average rating from the reviews
                    },
                },
            },

            // Join with the User collection to get additional details about the delivery man
            {
                $lookup: {
                    from: 'users', // User collection name
                    localField: '_id', // Field that links to the delivery man's userId in the User collection
                    foreignField: '_id', // Reference to _id in the User collection
                    as: 'deliveryManDetails', // Output the joined data as 'deliveryManDetails'
                },
            },

            // Unwind the 'deliveryManDetails' array (since $lookup produces an array even for one element)
            { $unwind: '$deliveryManDetails' },

            // Sort by total parcels delivered (descending) and then by average rating (descending)
            {
                $sort: {
                    totalParcelsDelivered: -1,
                    averageRating: -1,
                },
            },

            // Limit the results to top 3 delivery men
            { $limit: 3 },

            // Project the desired fields (delivery man details and delivery info)
            {
                $project: {
                    _id: 0, // Exclude the _id from the output
                    deliveryManId: '$_id', // Include deliveryManId
                    name: '$deliveryManDetails.name', // Name of the delivery man
                    profileImage: '$deliveryManDetails.profileImage', // Profile image URL of the delivery man
                    totalParcelsDelivered: 1,
                    averageRating: 1,
                },
            },
        ]);

        // Send the top delivery men data as a response
        res.status(200).json({ success: true, data: topDeliveryMen });
    } catch (error) {
        console.error('Error fetching top delivery men:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get statistics data for charts
const getStatisticsData = async (req, res) => {
    try {
        // Aggregate data for both bar chart and line chart
        const bookingsData = await Parcel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } }, // Group by booking date
                    bookedCount: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$status', 'Pending'] },
                                        { $eq: ['$status', 'On The Way'] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    deliveredCount: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } },
                    totalBookings: { $sum: 1 }, // Total bookings for the bar chart
                },
            },
            { $sort: { _id: 1 } }, // Sort by booking date ascending
        ]);

        // Transform the data to fit chart requirements
        const barChartData = bookingsData.map(item => ({
            date: item._id,
            totalBookings: item.totalBookings,
        }));

        const lineChartData = bookingsData.map(item => ({
            date: item._id,
            booked: item.bookedCount,
            delivered: item.deliveredCount,
        }));

        res.status(200).json({
            success: true,
            data: {
                barChartData, // For bar chart: bookings by date
                lineChartData, // For line chart: booked vs delivered parcels by date
            },
        });
    } catch (error) {
        console.error('Error fetching statistics data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics data',
        });
    }
};

module.exports = {
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
};
