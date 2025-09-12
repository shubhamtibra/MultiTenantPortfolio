import React, { useState } from 'react';
import './PortfolioPreview.css';

const PortfolioPreview = ({ portfolioData, onEdit, onPublish }) => {
  const { websiteProfile, overview, sections } = portfolioData;
  const [expandedCard, setExpandedCard] = useState(null);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="portfolio-preview">
      <div className="preview-header">
        <h1>Portfolio Preview</h1>
        <p>This is how your portfolio website will look to visitors.</p>
        <div className="preview-actions">
          <button className="btn-edit" onClick={onEdit}>
            Edit Portfolio
          </button>
          <button className="btn-publish" onClick={() => {
            onPublish();
            // Redirect to subdomain
            window.open(`http://${websiteProfile.domain}:3000`, '_blank');
          }}>
            Host Your Site
          </button>
        </div>
      </div>

      <div className="website-preview">
        {/* Header Section */}
        <header className="website-header">
          <div className="header-content">
            <div className="company-info">
              <div className="company-main">
                {overview.companyLogo && (
                  <img src={overview.companyLogo} alt="Company Logo" className="company-logo" />
                )}
                <h1 className="company-name">{overview.companyName}</h1>
              </div>
              <div className="contact-info">
                <span className="phone">📞 {overview.companyPhone}</span>
                <span className="email">✉️ {overview.companyEmail}</span>
                <div className="rating">
                  <span className="rating-text">Google Rating</span>
                  <div className="stars">
                    {renderStars(overview.companyRating)}
                    <span className="rating-value">{overview.companyRating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">{overview.companyTitle}</h1>
            <p className="hero-description">{overview.companyDescription}</p>
          </div>
        </section>

        {/* Services Section */}
        <section className="services">
          <div className="services-container">
            <div className="services-grid">
              {sections.map((section, index) => (
                <div 
                  key={index} 
                  className={`service-card ${expandedCard === index ? 'expanded' : ''}`}
                  onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                >
                  <div className="service-image">
                    {section.logo ? (
                      <img src={section.logo} alt={section.title} className="service-logo" />
                    ) : (
                      <div className="service-icon">🔧</div>
                    )}
                  </div>
                  <div className="service-content">
                    <h3 className="service-title">{section.title}</h3>
                    <p className="service-description">{section.description}</p>
                    <button className="service-button" onClick={(e) => e.stopPropagation()}>
                      {section.buttonText}
                    </button>

                    {expandedCard === index && section.items && section.items.length > 0 && (
                      <div className="service-details">
                        <h4>What's Included:</h4>
                        <ul className="service-items">
                          {section.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="service-item">
                              <span className="item-check">✓</span>
                              <div className="item-content">
                                <strong>{item.itemTitle}</strong>
                                {item.itemDescription && (
                                  <p>{item.itemDescription}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                        <button className="get-quote-button" onClick={(e) => e.stopPropagation()}>
                          Get Free Quote
                        </button>
                      </div>
                    )}
                  </div>
                  {section.items && section.items.length > 0 && (
                    <div className="expand-indicator">
                      {expandedCard === index ? '−' : '+'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="website-footer">
          <div className="footer-content">
            <div className="footer-info">
              <h3>{overview.companyName}</h3>
              <p>{overview.companyAddress}</p>
              <p>{overview.companyPhone} | {overview.companyEmail}</p>
            </div>
          </div>
        </footer>
      </div>

      <div className="preview-footer">
        <div className="domain-info">
          <strong>Your website will be available at:</strong>
          <span className="domain-url">https://{websiteProfile.domain}</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPreview;
