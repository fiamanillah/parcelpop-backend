const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parcelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parcel', required: true },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Success', 'Failed'], default: 'Success' },
    paymentDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);
