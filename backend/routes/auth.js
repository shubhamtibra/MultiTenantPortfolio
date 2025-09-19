const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// JWT Secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Helper function to generate JWT token
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

// Helper function to verify JWT token (middleware)
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// Sign up route
router.post('/signup', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required',
                success: false
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Please provide a valid email address',
                success: false
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long',
                success: false
            });
        }

        // Check if user already exists
        const existingUser = await req.ctx.db.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                error: 'User with this email already exists',
                success: false
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create default org for the user
        const org = await req.ctx.db.Org.create({
            name: `${firstName || 'User'}'s Organization`,
            isActive: true
        });

        // Create user
        const user = await req.ctx.db.User.create({
            email,
            password: hashedPassword,
            firstName: firstName || '',
            lastName: lastName || '',
            orgPk: org.pk,
            role: 'admin' // First user in org is admin
        });

        // Generate JWT token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user: {
                    pk: user.pk,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Signup error:', error);

        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors.map(err => err.message),
                success: false
            });
        }

        // Handle unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                error: 'User with this email already exists',
                success: false
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            success: false
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required',
                success: false
            });
        }

        // Find user by email
        const user = await req.ctx.db.User.findOne({
            where: { email },
            include: [
                {
                    model: req.ctx.db.Org,
                    attributes: ['pk', 'name', 'isActive']
                }
            ]
        });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password',
                success: false
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                error: 'Account is deactivated',
                success: false
            });
        }

        // Check if org is active
        if (!user.Org.isActive) {
            return res.status(401).json({
                error: 'Organization is deactivated',
                success: false
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid email or password',
                success: false
            });
        }

        // Generate JWT token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    pk: user.pk,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    orgPk: user.orgPk
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Internal server error',
            success: false
        });
    }
});

// Get current user profile route (protected)
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await req.ctx.db.User.findByPk(req.user.userId, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: req.ctx.db.Org,
                    attributes: ['pk', 'name', 'isActive']
                }
            ]
        });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                success: false
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    pk: user.pk,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    orgPk: user.orgPk,
                    org: user.req.ctx.db.Org
                }
            }
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            error: 'Internal server error',
            success: false
        });
    }
});

// Update user profile route (protected)
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        const userId = req.user.userId;

        const user = await req.ctx.db.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                success: false
            });
        }

        // Update user
        await user.update({
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    pk: user.pk,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    orgPk: user.orgPk
                }
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            error: 'Internal server error',
            success: false
        });
    }
});

// Change password route (protected)
router.put('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Current password and new password are required',
                success: false
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'New password must be at least 6 characters long',
                success: false
            });
        }

        const user = await req.ctx.db.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                success: false
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                error: 'Current password is incorrect',
                success: false
            });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await user.update({ password: hashedNewPassword });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            error: 'Internal server error',
            success: false
        });
    }
});

// Verify token route (to check if token is valid)
router.get('/verify', verifyToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        data: {
            user: req.user
        }
    });
});

module.exports = { router, verifyToken };
