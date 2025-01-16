const User = require('../models/User');
const { verifyFirebaseToken } = require('../utils/firebaseUtils');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtUtils');

const register = async (req, res) => {
    const { name, email, password, idToken } = req.body;

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
        } else {
            // Email/password registration
            user = await User.findOne({ email });
            if (user) return res.status(400).json({ message: 'User already exists' });

            user = new User({ name, email, password });
        }

        // Save the user to the database (this will trigger pre-save hook for password hashing)
        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.status(201).json({
            user: {
                id: user._id,
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
const login = async (req, res) => {};

module.exports = { register };
