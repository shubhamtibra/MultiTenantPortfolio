import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="mt-8 space-x-4">
                                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium">
                                    Create Portfolio
                                </button>
                                <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium">
                                    View Portfolios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
