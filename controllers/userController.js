const User = require('../models/User'); // Replace with the actual path to your User model

const getAllUsers = async (req, res) => {
    try {
        // Extract pagination parameters from the query
        const { page = 1, limit = 10 } = req.query;

        // Convert to integers and ensure they are positive
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.max(1, parseInt(limit, 10));

        // Calculate the number of documents to skip
        const skip = (pageNum - 1) * limitNum;

        // Fetch users with pagination
        const users = await User.find()
            .skip(skip) // Skip documents
            .limit(limitNum) // Limit the number of documents
            .sort({ createdAt: -1 }); // Optional: Sort by creation date (newest first)

        // Count the total number of documents
        const totalUsers = await User.countDocuments();

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalUsers / limitNum);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalUsers,
                pageSize: limitNum,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users.',
            error: error.message,
        });
    }
};

module.exports = { getAllUsers };
