import React, { useState, useEffect } from 'react';
import './App.css';
import PortfolioBuilder from './components/PortfolioBuilder';
import PortfolioPreview from './components/PortfolioPreview';
import PublicPortfolio from './components/PublicPortfolio';
import { getCurrentDomain, getBaseDomain, getApiBaseUrl, getPortfolioUrl } from './utils/domain';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'builder', 'preview', 'public'
  const [websiteProfileData, setWebsiteProfileData] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [subdomainDomain, setSubdomainDomain] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    subdomain: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Check for subdomain on component mount
  useEffect(() => {
    const detectSubdomain = () => {
      const hostname = getCurrentDomain();
      const baseDomain = getBaseDomain();

      // Check if we're on a subdomain (not the base domain or www)
      if (hostname !== baseDomain && hostname !== `www.${baseDomain}` && !hostname.startsWith('www.') && hostname !== process.env.REACT_APP_HOST) {
        // Extract the subdomain part (everything before the base domain)
        const parts = hostname.split('.');
        if (parts.length > 1 && hostname !== baseDomain) {
          const subdomain = parts[0];
          setSubdomainDomain(subdomain);
          setCurrentView('public');
          return;
        }
      }

      // Default to landing page for base domain
      setCurrentView('landing');
    };

    detectSubdomain();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setWebsiteProfileData(data.data);
        setFormData({ email: '', subdomain: '' });

        if (data.isExistingUser) {
          setMessage({
            text: data.message,
            type: 'success'
          });

          // For existing users, try to load their portfolio data
          loadExistingPortfolio(data.data.websiteProfile.pk);
        } else {
          setMessage({
            text: 'Registration successful! Now let\'s build your portfolio.',
            type: 'success'
          });

          // Move to builder after a short delay for new users
          setTimeout(() => {
            setCurrentView('builder');
          }, 2000);
        }
      } else {
        setMessage({
          text: data.error || 'Registration failed. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      setMessage({
        text: 'Network error. Please check if the backend server is running.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExistingPortfolio = async (websiteProfilePk) => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/portfolio/${websiteProfilePk}`);
      const data = await response.json();

      if (data.success && data.data.overview) {
        // User has existing portfolio data - go to preview
        setPortfolioData({
          websiteProfile: data.data.websiteProfile,
          overview: data.data.overview,
          sections: data.data.sections || []
        });

        setTimeout(() => {
          setCurrentView('preview');
          setMessage({
            text: 'Welcome back! Here\'s your portfolio. You can edit or publish it.',
            type: 'success'
          });
        }, 2000);
      } else {
        // User exists but no portfolio data - go to builder
        setTimeout(() => {
          setCurrentView('builder');
          setMessage({
            text: 'Welcome back! Let\'s complete your portfolio setup.',
            type: 'success'
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error loading existing portfolio:', error);
      // Default to builder if there's an error
      setTimeout(() => {
        setCurrentView('builder');
        setMessage({
          text: 'Welcome back! Let\'s set up your portfolio.',
          type: 'success'
        });
      }, 2000);
    }
  };

  const handlePortfolioComplete = (data) => {
    setPortfolioData(data);
    setCurrentView('preview');
  };

  const handleEditPortfolio = () => {
    setCurrentView('builder');
  };

  const handlePublish = () => {
    const portfolioUrl = getPortfolioUrl(websiteProfileData.websiteProfile.subdomain);
    alert(`🎉 Congratulations! Your portfolio is now live at ${portfolioUrl}`);
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setWebsiteProfileData(null);
    setPortfolioData(null);
    setMessage({ text: '', type: '' });
  };

  // Show public portfolio for subdomain access
  if (currentView === 'public' && subdomainDomain) {
    return <PublicPortfolio subdomain={subdomainDomain} />;
  }

  if (currentView === 'builder' && websiteProfileData) {
    return (
      <div className="App">
        <button className="back-button" onClick={handleBackToLanding}>
          ← Back to Landing
        </button>
        <PortfolioBuilder
          websiteProfileData={websiteProfileData}
          onComplete={handlePortfolioComplete}
        />
      </div>
    );
  }

  if (currentView === 'preview' && portfolioData) {
    return (
      <div className="App">
        <button className="back-button" onClick={handleBackToLanding}>
          ← Back to Landing
        </button>
        <PortfolioPreview
          portfolioData={portfolioData}
          onEdit={handleEditPortfolio}
          onPublish={handlePublish}
        />
      </div>
    );
  }

  return (
    <div className="App">
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Create Your Professional Portfolio
            </h1>
            <p className="hero-subtitle">
              Build a stunning multi-tenant portfolio website in minutes.
              Perfect for professionals, freelancers, and agencies.
            </p>
            <p className="login-note">
              Already have an account? Just enter your email and domain to continue.
            </p>

            <div className="registration-form-container">
              <form onSubmit={handleSubmit} className="registration-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subdomain">Subdomain</label>
                  <input
                    type="text"
                    id="subdomain"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleInputChange}
                    placeholder="yourportfolio"
                    required
                  />
                  <small className="field-help">Your portfolio will be available at: <strong>{getPortfolioUrl(formData.subdomain || 'yourportfolio')}</strong></small>
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Get Started / Login'}
                </button>
              </form>

              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>

          <div className="features">
            <div className="feature">
              <div className="feature-icon">🚀</div>
              <h3>Quick Setup</h3>
              <p>Get your portfolio online in minutes with our streamlined process</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🎨</div>
              <h3>Beautiful Design</h3>
              <p>Modern, responsive templates that look great on all devices</p>
            </div>
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <h3>High Performance</h3>
              <p>Fast loading times and optimized for search engines</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
