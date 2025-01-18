const statisticsSchema = new mongoose.Schema({
    totalParcelsBooked: { type: Number, default: 0 },
    totalParcelsDelivered: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Statistics', statisticsSchema);
