import React, { useState, useEffect } from 'react';
import PortfolioBuilder from './components/PortfolioBuilder';
import PortfolioPreview from './components/PortfolioPreview';
import PublicPortfolio from './components/PublicPortfolio';
import { getCurrentDomain, getBaseDomain, getApiBaseUrl, getPortfolioUrl } from './utils/domain';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'signup', 'login', 'builder', 'preview', 'public'
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
    window.open(portfolioUrl, '_blank');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setWebsiteProfileData(null);
    setPortfolioData(null);
    setMessage({ text: '', type: '' });
    setFormData({ email: '', subdomain: '' });
  };

  // Show public portfolio for subdomain access
  if (currentView === 'public' && subdomainDomain) {
    return <PublicPortfolio subdomain={subdomainDomain} />;
  }

  if (currentView === 'builder' && websiteProfileData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <button
          className="fixed top-6 left-6 z-50 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-semibold shadow-lg border border-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          onClick={handleBackToLanding}
        >
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
      <div className="min-h-screen bg-gray-50">
        <button
          className="fixed top-6 left-6 z-50 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-semibold shadow-lg border border-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          onClick={handleBackToLanding}
        >
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
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-white text-2xl font-bold">
            Portfolio<span className="text-secondary-300">Builder</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Pricing</a>
            <a href="#contact" className="text-white/80 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Create Your
              <span className="block bg-gradient-to-r from-secondary-300 to-secondary-100 bg-clip-text text-transparent">
                Professional Portfolio
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-2xl">
              Build a stunning multi-tenant portfolio website in minutes.
              Perfect for professionals, freelancers, and agencies.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => setCurrentView('signup')}
                className="bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                Get Started Free
              </button>
              <button
                onClick={() => setCurrentView('login')}
                className="border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-white/10"
              >
                Sign In
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-white/70">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>5-minute setup</span>
              </div>
            </div>
          </div>

          {/* Right Content - Auth Form */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {currentView === 'signup' ? 'Create Your Account' : 'Welcome Back'}
                </h2>
                <p className="text-white/70">
                  {currentView === 'signup'
                    ? 'Start building your professional portfolio today'
                    : 'Sign in to continue building your portfolio'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-white/20 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div>
                  <label htmlFor="subdomain" className="block text-sm font-medium text-white/90 mb-2">
                    Portfolio Subdomain
                  </label>
                  <input
                    type="text"
                    id="subdomain"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleInputChange}
                    placeholder="yourportfolio"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-white/20 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all duration-300"
                  />
                  <p className="mt-2 text-sm text-white/70">
                    Your portfolio will be at: <span className="font-semibold text-white">{getPortfolioUrl(formData.subdomain || 'yourportfolio')}</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    currentView === 'signup' ? 'Create Account' : 'Sign In'
                  )}
                </button>
              </form>

              {message.text && (
                <div className={`mt-4 p-4 rounded-xl text-center font-medium ${message.type === 'success'
                  ? 'bg-green-500/20 text-green-100 border border-green-500/30'
                  : 'bg-red-500/20 text-red-100 border border-red-500/30'
                  }`}>
                  {message.text}
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-white/70">
                  {currentView === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                  <button
                    onClick={() => setCurrentView(currentView === 'signup' ? 'login' : 'signup')}
                    className="ml-2 text-secondary-300 hover:text-secondary-200 font-semibold transition-colors"
                  >
                    {currentView === 'signup' ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose PortfolioBuilder?</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need to create a professional portfolio that stands out
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-4">Quick Setup</h3>
              <p className="text-white/70 leading-relaxed">
                Get your portfolio online in minutes with our streamlined process. No technical knowledge required.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold text-white mb-4">Beautiful Design</h3>
              <p className="text-white/70 leading-relaxed">
                Modern, responsive templates that look great on all devices. Customize colors, fonts, and layouts.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-white mb-4">High Performance</h3>
              <p className="text-white/70 leading-relaxed">
                Fast loading times and optimized for search engines. Your portfolio will rank higher and load faster.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-lg border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="text-white text-2xl font-bold mb-4">
                Portfolio<span className="text-secondary-300">Builder</span>
              </div>
              <p className="text-white/70 mb-4 max-w-md">
                The easiest way to create professional portfolios that showcase your work and attract clients.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Examples</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-white/60">
              © 2024 PortfolioBuilder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
