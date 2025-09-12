const express = require('express');
const cors = require('cors');
require('dotenv').config();

const loadDb = require('./models');
const db = loadDb();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Multi-Tenant Portfolio Backend API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API endpoint to create user and website profile
app.post('/api/register', async (req, res) => {
  try {
    const { email, domain } = req.body;

    // Validate input
    if (!email || !domain) {
      return res.status(400).json({ 
        error: 'Email and domain are required',
        success: false 
      });
    }

    // Check if user already exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists',
        success: false 
      });
    }

    // Check if domain is already taken
    const existingDomain = await db.WebsiteProfile.findOne({ where: { domain } });
    if (existingDomain) {
      return res.status(409).json({ 
        error: 'Domain is already taken',
        success: false 
      });
    }

    // Create user
    const user = await db.User.create({ email });

    // Create website profile
    const websiteProfile = await db.WebsiteProfile.create({
      userPk: user.pk,
      domain
    });

    res.status(201).json({
      success: true,
      message: 'User and website profile created successfully',
      data: {
        user: {
          pk: user.pk,
          email: user.email
        },
        websiteProfile: {
          pk: websiteProfile.pk,
          domain: websiteProfile.domain
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(err => err.message),
        success: false
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      success: false 
    });
  }
});

// API endpoint to save portfolio overview
app.post('/api/portfolio/overview', async (req, res) => {
  try {
    const { websiteProfilePk, companyName, companyDescription, companyLogo, companyTitle, companyAddress, companyPhone, companyEmail, companyRating } = req.body;

    // Validate input
    if (!websiteProfilePk || !companyName || !companyDescription || !companyTitle || !companyAddress || !companyPhone || !companyEmail) {
      return res.status(400).json({ 
        error: 'All company details are required',
        success: false 
      });
    }

    // Check if overview already exists
    const existingOverview = await db.WebsiteProfileOverview.findOne({ where: { websiteProfilePk } });
    
    let overview;
    if (existingOverview) {
      // Update existing overview
      overview = await existingOverview.update({
        companyName,
        companyDescription,
        companyLogo: companyLogo || '',
        companyTitle,
        companyAddress,
        companyPhone,
        companyEmail,
        companyRating: companyRating || 5
      });
    } else {
      // Create new overview
      overview = await db.WebsiteProfileOverview.create({
        websiteProfilePk,
        companyName,
        companyDescription,
        companyLogo: companyLogo || '',
        companyTitle,
        companyAddress,
        companyPhone,
        companyEmail,
        companyRating: companyRating || 5
      });
    }

    res.status(201).json({
      success: true,
      message: 'Portfolio overview saved successfully',
      data: overview
    });

  } catch (error) {
    console.error('Overview save error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      success: false 
    });
  }
});

// API endpoint to save portfolio sections
app.post('/api/portfolio/sections', async (req, res) => {
  try {
    const { websiteProfilePk, sections } = req.body;

    if (!websiteProfilePk || !sections || !Array.isArray(sections)) {
      return res.status(400).json({ 
        error: 'Website profile ID and sections array are required',
        success: false 
      });
    }
    await db.WebsiteProfileSection.destroy({ where: { websiteProfilePk } });

    const createdSections = [];

    for (const sectionData of sections) {
      const { title, description, buttonText, buttonLink, items } = sectionData;

      // Create section
      const section = await db.WebsiteProfileSection.create({
        websiteProfilePk,
        title,
        description,
        buttonText,
        buttonLink
      });

      // Create section items
      const sectionItems = [];
      if (items && Array.isArray(items)) {
        for (const itemData of items) {
          const item = await db.WebsiteProfileSectionItems.create({
            websiteProfileSectionPk: section.pk,
            itemTitle: itemData.title,
            itemDescription: itemData.description,
            itemButtonText: itemData.buttonText || 'Learn More',
            itemButtonLink: itemData.buttonLink || '#'
          });
          sectionItems.push(item);
        }
      }

      createdSections.push({
        ...section.toJSON(),
        items: sectionItems
      });
    }

    res.status(201).json({
      success: true,
      message: 'Portfolio sections saved successfully',
      data: createdSections
    });

  } catch (error) {
    console.error('Sections save error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      success: false 
    });
  }
});

// API endpoint to get complete portfolio data
app.get('/api/portfolio/:websiteProfilePk', async (req, res) => {
  try {
    const { websiteProfilePk } = req.params;

    // Get website profile
    const websiteProfile = await db.WebsiteProfile.findByPk(websiteProfilePk, {
      include: [
        {
          model: db.User,
          attributes: ['email']
        }
      ]
    });

    if (!websiteProfile) {
      return res.status(404).json({ 
        error: 'Website profile not found',
        success: false 
      });
    }

    // Get overview
    const overview = await db.WebsiteProfileOverview.findOne({
      where: { websiteProfilePk }
    });

    // Get sections with items
    const sections = await db.WebsiteProfileSection.findAll({
      where: { websiteProfilePk },
      include: [
        {
          model: db.WebsiteProfileSectionItems,
          as: 'WebsiteProfileSectionItems'
        }
      ]
    });

    res.json({
      success: true,
      data: {
        websiteProfile,
        overview,
        sections
      }
    });

  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      success: false 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
