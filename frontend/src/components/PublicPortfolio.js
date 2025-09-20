import React, { useState, useEffect } from 'react';
import './PublicPortfolio.css';
import { getApiBaseUrl, getMainAppUrl } from '../utils/domain';
import { publicApiClient } from '../services/apiClient';
import QuoteModal from './QuoteModal';

const PublicPortfolio = ({ subdomain }) => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const handleQuoteRequest = (serviceName) => {
    setSelectedService(serviceName);
    setIsQuoteModalOpen(true);
  };

  const handleCloseQuoteModal = () => {
    setIsQuoteModalOpen(false);
    setSelectedService('');
  };

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        const data = await publicApiClient.portfolio.getBySubdomain(subdomain);

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

  // Separate sections by category for better organization
  const servicesSections = sections?.filter(section =>
    !['Service Areas', 'Customer Reviews', 'Licenses & Certifications'].includes(section.title)
  ) || [];

  const serviceAreasSection = sections?.find(section => section.title === 'Service Areas');
  const testimonialsSection = sections?.find(section => section.title === 'Customer Reviews');
  const licensesSection = sections?.find(section => section.title === 'Licenses & Certifications');

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
      <section className="hero" id="home">
        <div className="hero-content">
          <h1 className="hero-title">{overview.companyTitle}</h1>
          <p className="hero-description">{overview.companyDescription}</p>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">{overview.companyRating}</div>
              <div className="stat-label">Google Rating</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>
          <div className="hero-actions">
            <a href={`tel:${overview.companyPhone}`} className="cta-button primary">
              📞 Call Now
            </a>
            <a href={`mailto:${overview.companyEmail}`} className="cta-button secondary">
              ✉️ Get Quote
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      {servicesSections && servicesSections.length > 0 && (
        <section className="services" id="services">
          <div className="services-container">
            <h2 className="services-title">Our Services</h2>
            <div className="services-grid">
              {servicesSections.map((section, index) => (
                <div
                  key={index}
                  className={`service-card ${expandedCard === index ? 'expanded' : ''}`}
                  onClick={() => { }}
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
                      <button className="service-button" onClick={(e) => {
                        e.stopPropagation()
                        handleQuoteRequest(section.title);
                      }
                      }>
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
                        <button
                          className="get-quote-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuoteRequest(section.title);
                          }}
                        >
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

      {/* Service Areas Section */}
      {serviceAreasSection && serviceAreasSection.WebsiteProfileSectionItems && serviceAreasSection.WebsiteProfileSectionItems.length > 0 && (
        <section className="service-areas" id="service-areas">
          <div className="service-areas-container">
            <h2 className="section-title">{serviceAreasSection.title}</h2>
            <p className="section-description">{serviceAreasSection.description}</p>
            <div className="service-areas-grid">
              {serviceAreasSection.WebsiteProfileSectionItems.map((area, index) => (
                <div key={index} className="service-area-card">
                  <div className="area-icon">📍</div>
                  <h4 className="area-name">{area.itemTitle}</h4>
                  <p className="area-details">{area.itemDescription}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonialsSection && testimonialsSection.WebsiteProfileSectionItems && testimonialsSection.WebsiteProfileSectionItems.length > 0 && (
        <section className="testimonials" id="testimonials">
          <div className="testimonials-container">
            <h2 className="section-title">{testimonialsSection.title}</h2>
            <p className="section-description">{testimonialsSection.description}</p>
            <div className="testimonials-grid">
              {testimonialsSection.WebsiteProfileSectionItems.map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <div className="testimonial-quote">
                    <div className="quote-icon">"</div>
                    <p className="quote-text">{testimonial.itemDescription}</p>
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      {testimonial.logoUrl ? (
                        <img src={testimonial.logoUrl} alt={testimonial.itemTitle} className="author-logo" />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div className="author-info">
                      <h4 className="author-name">{testimonial.itemTitle}</h4>
                      <div className="author-rating">
                        {renderStars(5)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Licenses Section */}
      {licensesSection && licensesSection.WebsiteProfileSectionItems && licensesSection.WebsiteProfileSectionItems.length > 0 && (
        <section className="licenses" id="licenses">
          <div className="licenses-container">
            <h2 className="section-title">{licensesSection.title}</h2>
            <p className="section-description">{licensesSection.description}</p>
            <div className="licenses-grid">
              {licensesSection.WebsiteProfileSectionItems.map((license, index) => (
                <div key={index} className="license-card">
                  <div className="license-icon">🏆</div>
                  <div className="license-content">
                    <h4 className="license-title">{license.itemTitle}</h4>
                    <p className="license-details">{license.itemDescription}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="contact" id="contact">
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

      {/* Quote Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={handleCloseQuoteModal}
        serviceName={selectedService}
      />
    </div>
  );
};

export default PublicPortfolio;
