import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PublicPortfolio from './components/PublicPortfolio';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { getCurrentDomain, getBaseDomain, getApiBaseUrl, getPortfolioUrl } from './utils/domain';

// Landing page component
const LandingPage = () => {

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
              className="bg-white/20 hover:bg-white/30 text-white px-4 rounded-lg transition-colors"
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

// Component to check if we're on a subdomain and redirect accordingly
// This component wraps all routes and intercepts subdomain visits
// When on a subdomain (e.g., mikesplumbing.localhost:3000), it bypasses all React routes
// and directly shows the PublicPortfolio component for that subdomain
const SubdomainHandler = ({ children }) => {
  const [isSubdomain, setIsSubdomain] = useState(false);
  const [subdomain, setSubdomain] = useState(null);

  useEffect(() => {
    const detectSubdomain = () => {
      const hostname = getCurrentDomain();
      const baseDomain = getBaseDomain();

      console.log('SubdomainHandler: Detecting subdomain', { hostname, baseDomain });

      // Check if we're on a subdomain (not the base domain or www)
      if (hostname !== baseDomain && hostname !== `www.${baseDomain}` && !hostname.startsWith('www.') && hostname !== process.env.REACT_APP_HOST) {
        // Extract the subdomain part (everything before the base domain)
        const parts = hostname.split('.');
        if (parts.length > 1 && hostname !== baseDomain) {
          const subdomainPart = parts[0];
          console.log('SubdomainHandler: Subdomain detected', subdomainPart);
          setSubdomain(subdomainPart);
          setIsSubdomain(true);
          return;
        }
      }

      // Default to not a subdomain
      console.log('SubdomainHandler: No subdomain detected, using normal routing');
      setIsSubdomain(false);
      setSubdomain(null);
    };

    detectSubdomain();
  }, []);

  // If we're on a subdomain, always show the PublicPortfolio component
  if (isSubdomain && subdomain) {
    return <PublicPortfolio subdomain={subdomain} />;
  }

  // Otherwise, render the normal routing
  return children;
};

// Main App component with routing
function App() {
  return (
    <AuthProvider>
      <Router>
        <SubdomainHandler>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />

            {/* Authentication routes with redirect logic */}
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

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SubdomainHandler>
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