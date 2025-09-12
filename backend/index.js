const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const loadDb = require('./models');
const db = loadDb();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost and subdomains
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // Allow any subdomain pattern for development
    if (origin.match(/^https?:\/\/[^.]+\.localhost(:\d+)?$/)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Multi-Tenant Portfolio Backend API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// File upload endpoint
app.post('/api/upload', upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      fileUrl: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Delete uploaded file endpoint
app.delete('/api/upload/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// API endpoint to create user and website profile
app.post('/api/register', async (req, res) => {
  try {
    const { email, subdomain } = req.body;

    // Validate input
    if (!email || !subdomain) {
      return res.status(400).json({
        error: 'Email and subdomain are required',
        success: false
      });
    }

    // Check if user already exists
    const existingUser = await db.User.findOne({ where: { email } });

    if (existingUser) {
      // User exists - check if they have a website profile
      const existingProfile = await db.WebsiteProfile.findOne({
        where: { userPk: existingUser.pk }
      });

      if (existingProfile) {
        // User has existing profile - allow login
        return res.status(200).json({
          success: true,
          message: 'Welcome back! You can now update your portfolio.',
          isExistingUser: true,
          data: {
            user: {
              pk: existingUser.pk,
              email: existingUser.email
            },
            websiteProfile: {
              pk: existingProfile.pk,
              subdomain: existingProfile.subdomain
            }
          }
        });
      } else {
        // User exists but no profile - check if subdomain is available
        const existingSubdomain = await db.WebsiteProfile.findOne({ where: { subdomain } });
        if (existingSubdomain) {
          return res.status(409).json({
            error: 'Subdomain is already taken',
            success: false
          });
        }

        // Create website profile for existing user
        const websiteProfile = await db.WebsiteProfile.create({
          userPk: existingUser.pk,
          subdomain
        });

        return res.status(201).json({
          success: true,
          message: 'Website profile created for existing user',
          isExistingUser: true,
          data: {
            user: {
              pk: existingUser.pk,
              email: existingUser.email
            },
            websiteProfile: {
              pk: websiteProfile.pk,
              subdomain: websiteProfile.subdomain
            }
          }
        });
      }
    }

    // Check if subdomain is already taken for new users
    const existingSubdomain = await db.WebsiteProfile.findOne({ where: { subdomain } });
    if (existingSubdomain) {
      return res.status(409).json({
        error: 'Subdomain is already taken',
        success: false
      });
    }

    // Create new user
    const user = await db.User.create({ email });

    // Create website profile
    const websiteProfile = await db.WebsiteProfile.create({
      userPk: user.pk,
      subdomain
    });

    res.status(201).json({
      success: true,
      message: 'User and website profile created successfully',
      isExistingUser: false,
      data: {
        user: {
          pk: user.pk,
          email: user.email
        },
        websiteProfile: {
          pk: websiteProfile.pk,
          subdomain: websiteProfile.subdomain
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
      const { title, description, logo, buttonText, items } = sectionData;

      // Create section
      const section = await db.WebsiteProfileSection.create({
        websiteProfilePk,
        title,
        description,
        logo: logo || '',
        buttonText
      });

      // Create section items
      const sectionItems = [];
      if (items && Array.isArray(items)) {
        for (const itemData of items) {
          const item = await db.WebsiteProfileSectionItems.create({
            websiteProfileSectionPk: section.pk,
            itemTitle: itemData.title,
            itemDescription: itemData.description,
            itemButtonText: itemData.buttonText || 'Learn More'
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

// API endpoint to get portfolio by subdomain (for subdomain access)
app.get('/api/portfolio/subdomain/:subdomain', async (req, res) => {
  try {
    const { subdomain } = req.params;

    // Find website profile by subdomain
    const websiteProfile = await db.WebsiteProfile.findOne({
      where: { subdomain },
      include: [
        {
          model: db.User,
          attributes: ['email']
        }
      ]
    });

    if (!websiteProfile) {
      return res.status(404).json({
        error: 'Portfolio not found for this subdomain',
        success: false
      });
    }

    // Get overview
    const overview = await db.WebsiteProfileOverview.findOne({
      where: { websiteProfilePk: websiteProfile.pk }
    });

    // Get sections with items
    const sections = await db.WebsiteProfileSection.findAll({
      where: { websiteProfilePk: websiteProfile.pk },
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
    console.error('Portfolio fetch by subdomain error:', error);
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
