const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        userName: { type: String, required: true },
        userEmail: { type: String, required: true },
        userPhone: { type: String },
        parcelType: { type: String, required: true },
        parcelWeight: { type: Number, required: true },
        receiverName: { type: String, required: true },
        receiverPhone: { type: String, required: true },
        deliveryAddress: { type: String, required: true },
        deliveryLat: { type: Number },
        deliveryLng: { type: Number },
        price: { type: Number, required: true },
        requestedDeliveryDate: { type: Date, required: true },
        approximateDeliveryDate: { type: Date },
        bookingDate: { type: Date, default: Date.now },
        deliveryManId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: {
            type: String,
            enum: ['Pending', 'On The Way', 'Delivered', 'Returned', 'Cancelled'],
            default: 'Pending',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Parcel', parcelSchema);
