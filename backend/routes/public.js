const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * PUBLIC ROUTES - No authentication required
 */

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        success: true
    });
});

// Sign up route
router.post('/auth/signup', async (req, res) => {
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
router.post('/auth/login', async (req, res) => {
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

// Get available services (public for portfolio building)
router.get('/portfolio/services', async (req, res) => {
    try {
        const { db } = req.ctx;

        const services = await db.Service.findAll({
            where: { isActive: true },
            order: [['category', 'ASC'], ['name', 'ASC']]
        });

        res.json({
            success: true,
            data: services
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch services'
        });
    }
});

// Get portfolio by subdomain (public access for viewing portfolios)
router.get('/portfolio/subdomain/:subdomain', async (req, res) => {
    try {
        const { db } = req.ctx;
        const { subdomain } = req.params;

        // Find the website profile by subdomain
        const websiteProfile = await db.WebsiteProfile.findOne({
            where: { subdomain: subdomain, isActive: true },
            include: [{
                model: db.Business
            }]
        });

        if (!websiteProfile || !websiteProfile.Business) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio not found for this subdomain'
            });
        }

        const portfolio = await getCompletePortfolio(db, websiteProfile.Business.pk);

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio data not found'
            });
        }

        res.json({
            success: true,
            data: portfolio
        });
    } catch (error) {
        console.error('Error fetching portfolio by subdomain:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch portfolio'
        });
    }
});

// Get portfolio by business ID (public access)
router.get('/portfolio/business/:businessPk', async (req, res) => {
    try {
        const { db } = req.ctx;
        const { businessPk } = req.params;

        const portfolio = await getCompletePortfolio(db, businessPk);

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio not found'
            });
        }

        res.json({
            success: true,
            data: portfolio
        });
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch portfolio'
        });
    }
});

// Helper function to get complete portfolio data
async function getCompletePortfolio(db, businessPk) {
    const business = await db.Business.findByPk(businessPk, {
        include: [
            {
                model: db.WebsiteProfile
            },
            {
                model: db.Service,
                through: {
                    model: db.BusinessService,
                    attributes: ['customDescription']
                }
            },
            {
                model: db.ServiceArea
            },
            {
                model: db.Testimonial,
                order: [['sortOrder', 'ASC']]
            },
            {
                model: db.License
            }
        ]
    });

    if (!business) {
        return null;
    }

    // Transform data to match PublicPortfolio component expectations
    const overview = {
        companyName: business.publicName || business.legalName,
        companyTitle: business.tagline || business.publicName,
        companyDescription: business.about || `Professional ${business.publicName} services`,
        companyEmail: business.email,
        companyPhone: business.phone,
        companyAddress: [business.addressLine1, business.addressLine2, business.city, business.region, business.postalCode].filter(Boolean).join(', '),
        companyRating: business.Testimonials?.length > 0
            ? Math.round(business.Testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / business.Testimonials.length)
            : 5, // Calculate average rating from testimonials, default to 5
        companyLogo: null // Would need to be handled by file upload
    };

    // Transform services to sections format with more details
    const sections = business.Services?.map(service => ({
        title: service.name,
        description: service.BusinessService?.customDescription || service.description,
        logo: null, // Would need service logos
        buttonText: "Get Quote",
        category: service.category,
        WebsiteProfileSectionItems: [] // Could be populated from service details
    })) || [];

    // Add service areas as a special section if they exist
    if (business.ServiceAreas && business.ServiceAreas.length > 0) {
        sections.push({
            title: "Service Areas",
            description: "We proudly serve the following areas:",
            logo: null,
            buttonText: "Contact Us",
            category: "Service Areas",
            WebsiteProfileSectionItems: business.ServiceAreas.map(area => ({
                itemTitle: area.label,
                itemDescription: `${area.coverageType}: ${area.value}`,
                itemButtonText: "Get Quote"
            }))
        });
    }

    // Add testimonials as a section if they exist
    if (business.Testimonials && business.Testimonials.length > 0) {
        sections.push({
            title: "Customer Reviews",
            description: "What our customers are saying about us:",
            logo: null,
            buttonText: "Read More Reviews",
            category: "Testimonials",
            WebsiteProfileSectionItems: business.Testimonials.map(testimonial => ({
                itemTitle: testimonial.authorName || "Satisfied Customer",
                itemDescription: `"${testimonial.quote}" ${testimonial.rating ? `- ${testimonial.rating}/5 stars` : ''}`,
                itemButtonText: "Leave Review"
            }))
        });
    }

    // Add licenses as a section if they exist
    if (business.Licenses && business.Licenses.length > 0) {
        sections.push({
            title: "Licenses & Certifications",
            description: "We are fully licensed and certified:",
            logo: null,
            buttonText: "Verify License",
            category: "Licenses",
            WebsiteProfileSectionItems: business.Licenses.map(license => ({
                itemTitle: `License #${license.licenseNo}`,
                itemDescription: `${license.authority}${license.state ? ` - ${license.state}` : ''}${license.expiresOn ? ` (Expires: ${new Date(license.expiresOn).toLocaleDateString()})` : ''}`,
                itemButtonText: "Verify"
            }))
        });
    }

    return {
        overview: overview,
        sections: sections,
        // Keep original structure for backward compatibility
        business: business,
        websiteProfile: business.WebsiteProfiles?.[0] || null,
        services: business.Services || [],
        serviceAreas: business.ServiceAreas || [],
        testimonials: business.Testimonials || [],
        licenses: business.Licenses || []
    };
}

module.exports = router;
