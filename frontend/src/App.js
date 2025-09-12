import React, { useState } from 'react';
import './App.css';
import PortfolioBuilder from './components/PortfolioBuilder';
import PortfolioPreview from './components/PortfolioPreview';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'builder', 'preview'
  const [websiteProfileData, setWebsiteProfileData] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '',
    domain: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ 
          text: 'Registration successful! Now let\'s build your portfolio.', 
          type: 'success' 
        });
        setWebsiteProfileData(data.data);
        setFormData({ email: '', domain: '' });
        
        // Move to builder after a short delay
        setTimeout(() => {
          setCurrentView('builder');
        }, 2000);
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

  const handlePortfolioComplete = (data) => {
    setPortfolioData(data);
    setCurrentView('preview');
  };

  const handleEditPortfolio = () => {
    setCurrentView('builder');
  };

  const handlePublish = () => {
    alert(`🎉 Congratulations! Your portfolio is now live at https://${websiteProfileData.websiteProfile.domain}`);
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setWebsiteProfileData(null);
    setPortfolioData(null);
    setMessage({ text: '', type: '' });
  };

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
                  <label htmlFor="domain">Domain Name</label>
                  <input
                    type="text"
                    id="domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    placeholder="yourportfolio.com"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Creating Your Portfolio...' : 'Get Started'}
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
