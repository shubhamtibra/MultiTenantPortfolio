import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApiBaseUrl, getPortfolioUrl } from '../utils/domain';
import { authenticatedApiClient } from '../services/apiClient';
import ProgressivePortfolioBuilder from './ProgressivePortfolioBuilder';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showPortfolioBuilder, setShowPortfolioBuilder] = useState(false);
    const [portfolioData, setPortfolioData] = useState(null);
    const [hasPortfolio, setHasPortfolio] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCreatePortfolio = () => {
        setShowPortfolioBuilder(true);
    };

    const handlePortfolioComplete = (portfolioData) => {
        setShowPortfolioBuilder(false);
        // Refresh portfolio data to show the newly created portfolio
        refreshPortfolioData();
        console.log('Portfolio created:', portfolioData);
    };

    const handleCancelPortfolio = () => {
        setShowPortfolioBuilder(false);
    };

    // Fetch user's portfolio data
    useEffect(() => {
        const fetchPortfolioData = async () => {
            if (!user?.pk) return;

            try {
                setLoading(true);
                const data = await authenticatedApiClient.portfolio.getUserPortfolio(user.pk);

                if (data.success) {
                    setPortfolioData(data.data);
                    setHasPortfolio(true);
                } else {
                    setHasPortfolio(false);
                }
            } catch (error) {
                console.error('Error fetching portfolio:', error);
                setError('Failed to load portfolio data');
                setHasPortfolio(false);
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolioData();
    }, [user]);

    const handleViewPortfolio = () => {
        if (portfolioData && portfolioData.websiteProfile && portfolioData.websiteProfile.subdomain) {
            const portfolioUrl = getPortfolioUrl(portfolioData.websiteProfile.subdomain);
            window.open(portfolioUrl, '_blank');
        } else {
            alert('Portfolio not found. Please create a portfolio first.');
        }
    };

    const refreshPortfolioData = async () => {
        if (!user?.pk) return;

        try {
            const data = await authenticatedApiClient.portfolio.getUserPortfolio(user.pk);

            if (data.success) {
                setPortfolioData(data.data);
                setHasPortfolio(true);
            }
        } catch (error) {
            console.error('Error refreshing portfolio:', error);
        }
    };

    // Show progressive portfolio builder if user clicked create portfolio
    if (showPortfolioBuilder) {
        return (
            <ProgressivePortfolioBuilder
                onComplete={handlePortfolioComplete}
                onCancel={handleCancelPortfolio}
                existingData={hasPortfolio ? portfolioData : null}
                isEditing={hasPortfolio}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">
                                Portfolio Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">
                                Welcome, {user?.firstName} {user?.lastName}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Welcome to your Dashboard!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                You are successfully logged in. This is where you can manage your portfolio.
                            </p>

                            {/* User info card */}
                            <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Profile</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-500">Name:</span>
                                        <span className="text-gray-900">{user?.firstName} {user?.lastName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-500">Email:</span>
                                        <span className="text-gray-900">{user?.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-500">Role:</span>
                                        <span className="text-gray-900 capitalize">{user?.role}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-500">Portfolio Status:</span>
                                        <span className={`text-sm font-medium ${hasPortfolio ? 'text-green-600' : 'text-orange-600'}`}>
                                            {loading ? 'Loading...' : hasPortfolio ? 'Active' : 'Not Created'}
                                        </span>
                                    </div>
                                    {hasPortfolio && portfolioData?.websiteProfile?.subdomain && (
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-500">Subdomain:</span>
                                            <span className="text-blue-600 font-mono text-sm">
                                                {portfolioData.websiteProfile.subdomain}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="mt-8 space-x-4">
                                <button
                                    onClick={handleCreatePortfolio}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                                    disabled={loading}
                                >
                                    {hasPortfolio ? 'Edit Portfolio' : 'Create Portfolio'}
                                </button>
                                <button
                                    onClick={handleViewPortfolio}
                                    disabled={!hasPortfolio || loading}
                                    className={`px-6 py-2 rounded-md font-medium transition-colors ${hasPortfolio && !loading
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                        }`}
                                >
                                    View Portfolio
                                </button>
                            </div>

                            {error && (
                                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                                    {error}
                                </div>
                            )}

                            {hasPortfolio && portfolioData && (
                                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                                    <h4 className="font-medium mb-2">Portfolio Summary</h4>
                                    <div className="text-sm space-y-1">
                                        <p><span className="font-medium">Business:</span> {portfolioData.overview?.companyName || 'Not set'}</p>
                                        <p><span className="font-medium">Services:</span> {portfolioData.sections?.filter(s => !['Service Areas', 'Customer Reviews', 'Licenses & Certifications'].includes(s.title)).length || 0}</p>
                                        <p><span className="font-medium">Rating:</span> {portfolioData.overview?.companyRating || 'N/A'}/5</p>
                                        {portfolioData.websiteProfile?.subdomain && (
                                            <p>
                                                <span className="font-medium">Live at:</span> {' '}
                                                <a
                                                    href={getPortfolioUrl(portfolioData.websiteProfile.subdomain)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium underline hover:text-green-800"
                                                >
                                                    {getPortfolioUrl(portfolioData.websiteProfile.subdomain)}
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
