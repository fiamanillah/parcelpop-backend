const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
        },
        profileImage: {
            type: String,
            default: '',
        },
        role: {
            type: String,
            enum: ['User', 'Admin', 'DeliveryMan'],
            default: 'User',
        },
        parcelsBooked: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Hash password before saving if it's modified
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
