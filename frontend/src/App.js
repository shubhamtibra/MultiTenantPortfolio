import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PortfolioBuilder from './components/PortfolioBuilder';
import PortfolioPreview from './components/PortfolioPreview';
import PublicPortfolio from './components/PublicPortfolio';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { getCurrentDomain, getBaseDomain, getApiBaseUrl, getPortfolioUrl } from './utils/domain';

// Landing page component
const LandingPage = () => {
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

          <div className="flex space-x-4">
            <a
              href="/login"
              className="text-white/80 hover:text-white transition-colors"
            >
              Sign In
            </a>
            <a
              href="/signup"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign Up
            </a>
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
              <a
                href="/signup"
                className="bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-center"
              >
                Get Started Free
              </a>
              <a
                href="/login"
                className="border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-white/10 text-center"
              >
                Sign In
              </a>
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


        </div>
      </div>



      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-lg border-t border-white/10 py-12 px-6">
        <div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-white/60">
              © 2024 PortfolioBuilder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Main App component with routing
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirect authenticated users away from login/signup */}
          <Route
            path="/login"
            element={
              <AuthenticatedRedirect>
                <Login />
              </AuthenticatedRedirect>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthenticatedRedirect>
                <Signup />
              </AuthenticatedRedirect>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Component to redirect authenticated users away from login/signup pages
const AuthenticatedRedirect = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default App;