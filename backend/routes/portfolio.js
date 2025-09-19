const express = require('express');
const router = express.Router();

// Get available services
router.get('/services', async (req, res) => {
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

// Complete portfolio creation
router.post('/complete', async (req, res) => {
    const transaction = await req.ctx.db.sequelize.transaction();

    try {
        const { db } = req.ctx;
        const { userPk, business, services, serviceAreas, testimonials, licenses } = req.body;

        // Find user's organization
        const user = await db.User.findByPk(userPk);
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
                //yearsInBusiness: business.yearsInBusiness,
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
                //yearsInBusiness: business.yearsInBusiness,
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

// Get complete portfolio data
router.get('/business/:businessPk', async (req, res) => {
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

    return {
        business: business,
        websiteProfile: business.WebsiteProfiles?.[0] || null,
        services: business.Services || [],
        serviceAreas: business.ServiceAreas || [],
        testimonials: business.Testimonials || [],
        licenses: business.Licenses || []
    };
}

module.exports = router;
