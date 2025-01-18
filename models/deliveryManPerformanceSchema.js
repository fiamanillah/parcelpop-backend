const deliveryManPerformanceSchema = new mongoose.Schema({
    deliveryManId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parcelsDelivered: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
});

module.exports = mongoose.model('DeliveryManPerformance', deliveryManPerformanceSchema);
