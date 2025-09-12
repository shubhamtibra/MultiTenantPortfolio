import React, { useState, useEffect } from 'react';
import './PublicPortfolio.css';
import { getApiBaseUrl, getMainAppUrl } from '../utils/domain';

const PublicPortfolio = ({ subdomain }) => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(`${apiBaseUrl}/api/portfolio/subdomain/${subdomain}`);
        const data = await response.json();

        if (data.success) {
          setPortfolioData(data.data);
        } else {
          setError(data.error || 'Portfolio not found');
        }
      } catch (err) {
        setError('Failed to load portfolio. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) {
      fetchPortfolioData();
    }
  }, [subdomain]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="public-portfolio loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-portfolio error">
        <div className="error-message">
          <h1>Portfolio Not Found</h1>
          <p>{error}</p>
          <div className="error-details">
            <p>The subdomain <strong>{subdomain}</strong> doesn't have a portfolio associated with it.</p>
            <a href={getMainAppUrl()} className="create-portfolio-link">
              Create Your Portfolio
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolioData || !portfolioData.overview) {
    return (
      <div className="public-portfolio error">
        <div className="error-message">
          <h1>Portfolio Incomplete</h1>
          <p>This portfolio is still being set up.</p>
          <a href={getMainAppUrl()} className="create-portfolio-link">
            Create Your Portfolio
          </a>
        </div>
      </div>
    );
  }

  const { overview, sections } = portfolioData;

  return (
    <div className="public-portfolio">
      {/* Header Section */}
      <header className="portfolio-header">
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
          <div className="hero-actions">
            <a href={`tel:${overview.companyPhone}`} className="cta-button primary">
              Call Now
            </a>
            <a href={`mailto:${overview.companyEmail}`} className="cta-button secondary">
              Get Quote
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      {sections && sections.length > 0 && (
        <section className="services">
          <div className="services-container">
            <h2 className="services-title">Our Services</h2>
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
                    
                    {section.buttonText && (
                      <button className="service-button" onClick={(e) => e.stopPropagation()}>
                        {section.buttonText}
                      </button>
                    )}

                    {expandedCard === index && section.WebsiteProfileSectionItems && section.WebsiteProfileSectionItems.length > 0 && (
                      <div className="service-details">
                        <h4>What's Included:</h4>
                        <ul className="service-items">
                          {section.WebsiteProfileSectionItems.map((item, itemIndex) => (
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
                  {section.WebsiteProfileSectionItems && section.WebsiteProfileSectionItems.length > 0 && (
                    <div className="expand-indicator">
                      {expandedCard === index ? '−' : '+'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="contact">
        <div className="contact-container">
          <h2>Get In Touch</h2>
          <p>Ready to get started? Contact us today for a free consultation.</p>
          <div className="contact-methods">
            <a href={`tel:${overview.companyPhone}`} className="contact-method">
              <div className="contact-icon">📞</div>
              <div className="contact-details">
                <h3>Call Us</h3>
                <p>{overview.companyPhone}</p>
              </div>
            </a>
            <a href={`mailto:${overview.companyEmail}`} className="contact-method">
              <div className="contact-icon">✉️</div>
              <div className="contact-details">
                <h3>Email Us</h3>
                <p>{overview.companyEmail}</p>
              </div>
            </a>
            <div className="contact-method">
              <div className="contact-icon">📍</div>
              <div className="contact-details">
                <h3>Visit Us</h3>
                <p>{overview.companyAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="portfolio-footer">
        <div className="footer-content">
          <div className="footer-info">
            <h3>{overview.companyName}</h3>
            <p>{overview.companyAddress}</p>
            <p>{overview.companyPhone} | {overview.companyEmail}</p>
          </div>
          <div className="footer-rating">
            <div className="stars">
              {renderStars(overview.companyRating)}
            </div>
            <p>Google Rating: {overview.companyRating}/5</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 {overview.companyName}. All rights reserved.</p>
          <p className="powered-by">
            Powered by <a href={getMainAppUrl()}>Multi-Tenant Portfolio</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicPortfolio;
