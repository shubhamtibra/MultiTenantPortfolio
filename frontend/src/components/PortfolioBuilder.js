import React, { useState } from 'react';
import './PortfolioBuilder.css';

const PortfolioBuilder = ({ websiteProfileData, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Overview form data
  const [overviewData, setOverviewData] = useState({
    companyName: '',
    companyDescription: '',
    companyLogo: '',
    companyTitle: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyRating: 5
  });

  // Sections data
  const [sections, setSections] = useState([
    {
      title: '',
      description: '',
      logo: '',
      buttonText: '',
      buttonLink: '',
      items: []
    }
  ]);

  const handleOverviewChange = (field, value) => {
    setOverviewData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSectionChange = (sectionIndex, field, value) => {
    setSections(prev => prev.map((section, index) => 
      index === sectionIndex ? { ...section, [field]: value } : section
    ));
  };

  const addSection = () => {
    setSections(prev => [...prev, {
      title: '',
      description: '',
      buttonText: '',
      items: []
    }]);
  };

  const removeSection = (sectionIndex) => {
    setSections(prev => prev.filter((_, index) => index !== sectionIndex));
  };

  const addSectionItem = (sectionIndex) => {
    setSections(prev => prev.map((section, index) => 
      index === sectionIndex 
        ? { 
            ...section, 
            items: [...section.items, { title: '', description: '', buttonText: 'Learn More' }] 
          }
        : section
    ));
  };

  const removeSectionItem = (sectionIndex, itemIndex) => {
    setSections(prev => prev.map((section, index) => 
      index === sectionIndex 
        ? { 
            ...section, 
            items: section.items.filter((_, i) => i !== itemIndex)
          }
        : section
    ));
  };

  const handleSectionItemChange = (sectionIndex, itemIndex, field, value) => {
    setSections(prev => prev.map((section, index) => 
      index === sectionIndex 
        ? {
            ...section,
            items: section.items.map((item, i) => 
              i === itemIndex ? { ...item, [field]: value } : item
            )
          }
        : section
    ));
  };

  const saveOverview = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:5000/api/portfolio/overview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteProfilePk: websiteProfileData.websiteProfile.pk,
          ...overviewData
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: 'Overview saved successfully!', type: 'success' });
        setCurrentStep(2);
      } else {
        setMessage({ text: data.error || 'Failed to save overview', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const saveSections = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:5000/api/portfolio/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteProfilePk: websiteProfileData.websiteProfile.pk,
          sections
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: 'Sections saved successfully!', type: 'success' });
        // Pass complete data to parent component for preview
        onComplete({
          websiteProfile: websiteProfileData.websiteProfile,
          overview: overviewData,
          sections: data.data
        });
      } else {
        setMessage({ text: data.error || 'Failed to save sections', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-builder">
      <div className="builder-header">
        <h1>Build Your Portfolio</h1>
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <label>Company Overview</label>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <label>Services & Sections</label>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <label>Preview</label>
          </div>
        </div>
      </div>

      {currentStep === 1 && (
        <div className="overview-form">
          <h2>Company Overview</h2>
          <p>Tell us about your business to create an engaging company profile.</p>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                value={overviewData.companyName}
                onChange={(e) => handleOverviewChange('companyName', e.target.value)}
                placeholder="e.g., Mike's Plumbing Co."
                required
              />
            </div>

            <div className="form-group">
              <label>Company Title/Tagline *</label>
              <input
                type="text"
                value={overviewData.companyTitle}
                onChange={(e) => handleOverviewChange('companyTitle', e.target.value)}
                placeholder="e.g., Kansas City's Premier Plumbing Service"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Company Description *</label>
              <textarea
                value={overviewData.companyDescription}
                onChange={(e) => handleOverviewChange('companyDescription', e.target.value)}
                placeholder="Describe your company, services, and what makes you unique..."
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                value={overviewData.companyPhone}
                onChange={(e) => handleOverviewChange('companyPhone', e.target.value)}
                placeholder="(555) 123-4567"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                value={overviewData.companyEmail}
                onChange={(e) => handleOverviewChange('companyEmail', e.target.value)}
                placeholder="contact@company.com"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Business Address *</label>
              <input
                type="text"
                value={overviewData.companyAddress}
                onChange={(e) => handleOverviewChange('companyAddress', e.target.value)}
                placeholder="123 Main St, City, State 12345"
                required
              />
            </div>

            <div className="form-group">
              <label>Company Logo URL (Optional)</label>
              <input
                type="url"
                value={overviewData.companyLogo}
                onChange={(e) => handleOverviewChange('companyLogo', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="form-group">
              <label>Company Rating</label>
              <select
                value={overviewData.companyRating}
                onChange={(e) => handleOverviewChange('companyRating', parseInt(e.target.value))}
              >
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button 
              className="btn-primary"
              onClick={saveOverview}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="sections-form">
          <h2>Services & Sections</h2>
          <p>Add your services and what's included in each service.</p>

          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="section-card">
              <div className="section-header">
                <h3>Service {sectionIndex + 1}</h3>
                {sections.length > 1 && (
                  <button 
                    className="btn-remove"
                    onClick={() => removeSection(sectionIndex)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Service Title *</label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionChange(sectionIndex, 'title', e.target.value)}
                    placeholder="e.g., Drain Cleaning"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Service Logo (URL)</label>
                  <input
                    type="url"
                    value={section.logo}
                    onChange={(e) => handleSectionChange(sectionIndex, 'logo', e.target.value)}
                    placeholder="https://example.com/service-icon.png"
                  />
                </div>

                <div className="form-group">
                  <label>Button Text</label>
                  <input
                    type="text"
                    value={section.buttonText}
                    onChange={(e) => handleSectionChange(sectionIndex, 'buttonText', e.target.value)}
                    placeholder="e.g., Starting at $150"
                  />
                </div>

                <div className="form-group">
                  <label>Button Link</label>
                  <input
                    type="text"
                    value={section.buttonLink}
                    onChange={(e) => handleSectionChange(sectionIndex, 'buttonLink', e.target.value)}
                    placeholder="e.g., #contact or tel:+1234567890"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Service Description *</label>
                  <textarea
                    value={section.description}
                    onChange={(e) => handleSectionChange(sectionIndex, 'description', e.target.value)}
                    placeholder="Describe this service..."
                    rows="3"
                    required
                  />
                </div>
              </div>

              <div className="section-items">
                <h4>What's Included:</h4>
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="item-card">
                    <div className="item-header">
                      <h5>Item {itemIndex + 1}</h5>
                      <button 
                        className="btn-remove-small"
                        onClick={() => removeSectionItem(sectionIndex, itemIndex)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Item Title</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleSectionItemChange(sectionIndex, itemIndex, 'title', e.target.value)}
                          placeholder="e.g., High-pressure water jetting"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Item Description</label>
                        <textarea
                          value={item.description}
                          onChange={(e) => handleSectionItemChange(sectionIndex, itemIndex, 'description', e.target.value)}
                          placeholder="Describe what's included..."
                          rows="2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  className="btn-add-item"
                  onClick={() => addSectionItem(sectionIndex)}
                >
                  + Add Item
                </button>
              </div>
            </div>
          ))}

          <button className="btn-add-section" onClick={addSection}>
            + Add Another Service
          </button>

          <div className="form-actions">
            <button 
              className="btn-secondary"
              onClick={() => setCurrentStep(1)}
            >
              Back
            </button>
            <button 
              className="btn-primary"
              onClick={saveSections}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save & Preview'}
            </button>
          </div>
        </div>
      )}

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default PortfolioBuilder;
