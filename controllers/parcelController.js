const Parcel = require('../models/parcelSchema'); // Adjust the path to your Parcel model

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
        const parcels = await Parcel.find({ userId }).select(
            'userName userEmail parcelType parcelWeight receiverName receiverPhone deliveryAddress price requestedDeliveryDate status bookingDate'
        );

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

module.exports = {
    createParcel,
    getAllParcels,
    getParcelById,
    updateParcel,
    getMyParcels,
};
