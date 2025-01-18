const roleMiddleware = requiredRoles => {
    return (req, res, next) => {
        const userRole = req.user?.role;

        console.log(userRole);

        if (!userRole || !requiredRoles.includes(userRole)) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }

        next();
    };
};

module.exports = roleMiddleware;
