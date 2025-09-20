const express = require('express');
const bcrypt = require('bcryptjs');
const { verifyToken, requireAdmin, requireSameOrg } = require('../middleware/auth');

const router = express.Router();

/**
 * AUTHENTICATED ROUTES - All routes require valid JWT token
 * All routes in this file are automatically protected by verifyToken middleware
 */

// Verify token route (to check if token is valid)
router.get('/auth/verify', (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        data: {
            user: req.user
        }
    });
});

// Get current user profile route
router.get('/auth/profile', async (req, res) => {
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
                    org: user.Org
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

// Update user profile route
router.put('/auth/profile', async (req, res) => {
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

// Change password route
router.put('/auth/change-password', async (req, res) => {
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

// Complete portfolio creation (authenticated - user can only create for their org)
router.post('/portfolio/complete', async (req, res) => {
    const transaction = await req.ctx.db.sequelize.transaction();

    try {
        const { db } = req.ctx;
        const { userPk, business, services, serviceAreas, testimonials, licenses } = req.body;

        // Ensure user can only create portfolio for themselves or their org
        if (userPk && userPk !== req.user.userId) {
            // Check if user is admin and userPk belongs to same org
            const targetUser = await db.User.findByPk(userPk);
            if (!targetUser || targetUser.orgPk !== req.user.orgPk) {
                await transaction.rollback();
                return res.status(403).json({
                    success: false,
                    error: 'Access denied. You can only create portfolios for your organization.'
                });
            }
        }

        // Use the requesting user's ID if no userPk provided
        const effectiveUserPk = userPk || req.user.userId;

        // Find user's organization
        const user = await db.User.findByPk(effectiveUserPk);
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Create or update business
        let businessRecord = await db.Business.findOne({
            where: { orgPk: user.orgPk },
            transaction
        });

        if (businessRecord) {
            // Update existing business
            await businessRecord.update({
                legalName: business.legalName || business.publicName,
                publicName: business.publicName,
                tagline: business.tagline,
                about: business.about,
                email: business.email,
                phone: business.phone,
                website: business.website,
                addressLine1: business.addressLine1,
                addressLine2: business.addressLine2,
                city: business.city,
                region: business.region,
                postalCode: business.postalCode,
                country: business.country,
                licensed: business.licensed,
                insured: business.insured
            }, { transaction });
        } else {
            // Create new business
            businessRecord = await db.Business.create({
                orgPk: user.orgPk,
                legalName: business.legalName || business.publicName,
                publicName: business.publicName,
                tagline: business.tagline,
                about: business.about,
                email: business.email,
                phone: business.phone,
                website: business.website,
                addressLine1: business.addressLine1,
                addressLine2: business.addressLine2,
                city: business.city,
                region: business.region,
                postalCode: business.postalCode,
                country: business.country,
                licensed: business.licensed,
                insured: business.insured
            }, { transaction });
        }

        // Create or update website profile
        let websiteProfile = await db.WebsiteProfile.findOne({
            where: { businessPk: businessRecord.pk },
            transaction
        });

        if (websiteProfile) {
            // Update existing website profile
            await websiteProfile.update({
                subdomain: business.subdomain
            }, { transaction });
        } else {
            // Create new website profile
            websiteProfile = await db.WebsiteProfile.create({
                businessPk: businessRecord.pk,
                subdomain: business.subdomain,
                isActive: true
            }, { transaction });
        }

        // Handle services
        if (services && services.length > 0) {
            // Remove existing business services
            await db.BusinessService.destroy({
                where: { businessPk: businessRecord.pk },
                transaction
            });

            // Add new business services
            for (const service of services) {
                let servicePk = service.servicePk;

                // If it's a custom service, create it first
                if (!servicePk && service.name) {
                    const newService = await db.Service.create({
                        name: service.name,
                        description: service.customDescription || service.description,
                        category: service.category || 'Custom',
                        isActive: true
                    }, { transaction });
                    servicePk = newService.pk;
                }

                if (servicePk) {
                    await db.BusinessService.create({
                        businessPk: businessRecord.pk,
                        servicePk: servicePk,
                        customDescription: service.customDescription
                    }, { transaction });
                }
            }
        }

        // Handle service areas
        if (serviceAreas && serviceAreas.length > 0) {
            // Remove existing service areas
            await db.ServiceArea.destroy({
                where: { businessPk: businessRecord.pk },
                transaction
            });

            // Add new service areas
            for (const area of serviceAreas) {
                if (area.label && area.value) {
                    await db.ServiceArea.create({
                        businessPk: businessRecord.pk,
                        label: area.label,
                        coverageType: area.coverageType,
                        value: area.value
                    }, { transaction });
                }
            }
        }

        // Handle testimonials
        if (testimonials && testimonials.length > 0) {
            // Remove existing testimonials
            await db.Testimonial.destroy({
                where: { businessPk: businessRecord.pk },
                transaction
            });

            // Add new testimonials
            for (const testimonial of testimonials) {
                if (testimonial.quote) {
                    await db.Testimonial.create({
                        businessPk: businessRecord.pk,
                        authorName: testimonial.authorName,
                        quote: testimonial.quote,
                        rating: testimonial.rating,
                        sortOrder: testimonial.sortOrder || 100
                    }, { transaction });
                }
            }
        }

        // Handle licenses
        if (licenses && licenses.length > 0) {
            // Remove existing licenses
            await db.License.destroy({
                where: { businessPk: businessRecord.pk },
                transaction
            });

            // Add new licenses
            for (const license of licenses) {
                if (license.licenseNo) {
                    await db.License.create({
                        businessPk: businessRecord.pk,
                        licenseNo: license.licenseNo,
                        authority: license.authority,
                        state: license.state,
                        expiresOn: license.expiresOn
                    }, { transaction });
                }
            }
        }

        await transaction.commit();

        // Return the complete portfolio data
        const completePortfolio = await getCompletePortfolio(db, businessRecord.pk);

        res.json({
            success: true,
            message: 'Portfolio created successfully',
            data: completePortfolio
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error creating portfolio:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create portfolio'
        });
    }
});

// Get user's portfolio by user ID (authenticated - user can access their own or org portfolios)
router.get('/portfolio/user/:userPk', async (req, res) => {
    try {
        const { db } = req.ctx;
        const { userPk } = req.params;

        // Check if user can access this portfolio
        if (userPk !== req.user.userId.toString()) {
            // Check if user is admin and userPk belongs to same org
            const targetUser = await db.User.findByPk(userPk);
            if (!targetUser || (targetUser.orgPk !== req.user.orgPk && req.user.role !== 'admin')) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied. You can only access portfolios from your organization.'
                });
            }
        }

        // Find user's organization and business
        const user = await db.User.findByPk(userPk);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Find business for this user's organization
        const business = await db.Business.findOne({
            where: { orgPk: user.orgPk },
            include: [{
                model: db.WebsiteProfile
            }]
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                error: 'No portfolio found for this user',
                hasPortfolio: false
            });
        }

        const portfolio = await getCompletePortfolio(db, business.pk);

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio data not found',
                hasPortfolio: false
            });
        }

        res.json({
            success: true,
            data: portfolio,
            hasPortfolio: true
        });
    } catch (error) {
        console.error('Error fetching user portfolio:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch portfolio'
        });
    }
});

// Get my portfolio (current user's portfolio)
router.get('/portfolio/my', async (req, res) => {
    try {
        const { db } = req.ctx;
        const userPk = req.user.userId;

        // Find user's organization and business
        const user = await db.User.findByPk(userPk);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Find business for this user's organization
        const business = await db.Business.findOne({
            where: { orgPk: user.orgPk },
            include: [{
                model: db.WebsiteProfile
            }]
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                error: 'No portfolio found for this user',
                hasPortfolio: false
            });
        }

        const portfolio = await getCompletePortfolio(db, business.pk);

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio data not found',
                hasPortfolio: false
            });
        }

        res.json({
            success: true,
            data: portfolio,
            hasPortfolio: true
        });
    } catch (error) {
        console.error('Error fetching user portfolio:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch portfolio'
        });
    }
});

// Admin only routes
router.get('/admin/users', requireAdmin, async (req, res) => {
    try {
        const { db } = req.ctx;

        const users = await db.User.findAll({
            where: { orgPk: req.user.orgPk },
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: db.Org,
                    attributes: ['pk', 'name', 'isActive']
                }
            ]
        });

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
});

// Helper function to get complete portfolio data (same as in public routes)
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
            : 5,
        companyLogo: null
    };

    // Transform services to sections format with more details
    const sections = business.Services?.map(service => ({
        title: service.name,
        description: service.BusinessService?.customDescription || service.description,
        logo: null,
        buttonText: "Get Quote",
        category: service.category,
        WebsiteProfileSectionItems: []
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
        business: business,
        websiteProfile: business.WebsiteProfiles?.[0] || null,
        services: business.Services || [],
        serviceAreas: business.ServiceAreas || [],
        testimonials: business.Testimonials || [],
        licenses: business.Licenses || []
    };
}

module.exports = router;
