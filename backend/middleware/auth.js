const jwt = require('jsonwebtoken');

// JWT Secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * Middleware to verify JWT token for protected routes
 * Adds user information to req.user if token is valid
 */
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            error: 'Access denied. No token provided.',
            success: false
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({
            error: 'Invalid token.',
            success: false
        });
    }
};

/**
 * Helper function to generate JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.pk,
            email: user.email,
            orgPk: user.orgPk,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            error: 'Access denied. Admin role required.',
            success: false
        });
    }
};

/**
 * Middleware to check if user belongs to the same organization
 */
const requireSameOrg = (req, res, next) => {
    const targetOrgPk = req.params.orgPk || req.body.orgPk;

    if (req.user && (req.user.orgPk === targetOrgPk || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({
            error: 'Access denied. You can only access your organization data.',
            success: false
        });
    }
};

module.exports = {
    verifyToken,
    generateToken,
    requireAdmin,
    requireSameOrg,
    JWT_SECRET
};
