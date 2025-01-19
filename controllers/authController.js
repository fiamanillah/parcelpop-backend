const User = require('../models/User');
const { verifyFirebaseToken } = require('../utils/firebaseUtils');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require('../utils/jwtUtils');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    const { name, email, password, role, idToken } = req.body;

    try {
        let user;
        let userEmail = email; // Avoid overwriting 'email' parameter

        // Firebase social login
        if (idToken) {
            const firebaseUser = await verifyFirebaseToken(idToken);
            userEmail = firebaseUser.email; // Use separate variable for Firebase email

            // Check if user already exists
            user = await User.findOne({ email: userEmail });
            if (user) return res.status(400).json({ message: 'User already exists' });

            // Create new user
            user = new User({
                name: firebaseUser.name || name,
                email: firebaseUser.email,
                profileImage: firebaseUser.picture,
                role: 'User', // Always assign role here
            });
            await user.save();
        } else {
            // Email/password registration
            user = await User.findOne({ email });
            if (user) return res.status(400).json({ message: 'User already exists' });

            if (!req.file) {
                return res.status(400).json({ error: 'No profile picture provided' });
            }
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            user = new User({ name, email, password, role, profileImage: fileUrl });
        }

        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role, // Include role in response
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Log In
const login = async (req, res) => {
    const { email, password, idToken } = req.body;

    try {
        // Validate inputs
        if (!idToken && (!email || !password)) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        let user;
        let userEmail = email;

        if (idToken) {
            // Verify Firebase Token (for social login)
            const firebaseUser = await verifyFirebaseToken(idToken);
            userEmail = firebaseUser.email;

            // Check if user exists in DB
            user = await User.findOne({ email: userEmail });
            if (!user) {
                // Create new user for social login
                user = await User.create({
                    name: firebaseUser.name,
                    email: firebaseUser.email,
                    profileImage: firebaseUser.picture,
                    role: 'User', // Default role
                });
                await user.save();
            }
        } else {
            // Email/Password login
            user = await User.findOne({ email: userEmail });
            if (!user) return res.status(401).json({ message: 'Invalid credentials' });

            // Compare password securely
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate access and refresh tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
const updateProfilePicture = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming user ID is stored in req.user from authentication middleware

        // Check if a file is uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No profile picture provided' });
        }

        // Construct the file URL
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        // Update the user's profile picture in the database
        const user = await User.findByIdAndUpdate(
            userId,
            { profileImage: fileUrl },
            { new: true } // Return the updated user document
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            profileImage: user.profileImage,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const refreshAccessToken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is required' });
    }

    try {
        const user = verifyRefreshToken(refreshToken); // Verify the refresh token

        const newAccessToken = generateAccessToken(user); // Generate a new access token
        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
};

const updateUserRole = async (req, res) => {
    const { _id, role } = req.body; // Admin sends userId and desired role

    if (!['User', 'Admin', 'DeliveryMan'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role; // Update role
        await user.save();

        res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getPrivateUserData = async (req, res) => {
    const { _id } = req.params;

    try {
        // Find the user by ID
        const user = await User.findById(_id).select('-password'); // Exclude the password field

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user data
        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getDeliveryMen = async (req, res) => {
    try {
        const { page, limit } = req.query; // Extract page and limit from query parameters

        // Set default values for page and limit if not provided
        const pageNum = parseInt(page) || 1; // Default to page 1
        const limitNum = parseInt(limit) || 0; // Default to no limit (fetch all)

        // Calculate the number of documents to skip
        const skip = (pageNum - 1) * limitNum;

        // Query delivery personnel with pagination
        const deliveryMenQuery = User.find({ role: 'DeliveryMan' }).select('-password');
        if (limitNum > 0) {
            deliveryMenQuery.skip(skip).limit(limitNum);
        }
        const deliveryMen = await deliveryMenQuery;

        // Check if there are any delivery personnel
        if (deliveryMen.length === 0) {
            return res.status(404).json({ message: 'No delivery personnel found' });
        }

        // Count the total number of delivery personnel
        const totalDeliveryMen = await User.countDocuments({ role: 'DeliveryMan' });

        // Return the list of delivery personnel with pagination info
        res.status(200).json({
            success: true,
            page: pageNum,
            limit: limitNum || 'All',
            totalPages: limitNum > 0 ? Math.ceil(totalDeliveryMen / limitNum) : 1,
            totalDeliveryMen,
            deliveryMen,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    register,
    login,
    refreshAccessToken,
    updateUserRole,
    getPrivateUserData,
    updateProfilePicture,
    getDeliveryMen,
};
