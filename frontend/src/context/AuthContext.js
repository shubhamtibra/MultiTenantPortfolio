import React, { createContext, useContext, useState, useEffect } from 'react';
import { publicApiClient, authenticatedApiClient } from '../services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            if (token && userData) {
                try {
                    // Verify token with backend
                    const response = await authenticatedApiClient.auth.verify();
                    if (response.success) {
                        setUser(JSON.parse(userData));
                    } else {
                        throw new Error('Token verification failed');
                    }
                } catch (error) {
                    // Token is invalid, clear localStorage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);

            const response = await publicApiClient.auth.login({
                email,
                password
            });

            if (response.success) {
                const { user: userData, token } = response.data;

                // Store in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));

                setUser(userData);
                return { success: true };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const signup = async (email, password, firstName, lastName) => {
        try {
            setError(null);
            setLoading(true);

            const response = await publicApiClient.auth.signup({
                email,
                password,
                firstName,
                lastName
            });

            if (response.success) {
                const { user: userData, token } = response.data;

                // Store in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));

                setUser(userData);
                return { success: true };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Signup failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setError(null);
    };

    const updateProfile = async (firstName, lastName) => {
        try {
            setError(null);

            const response = await authenticatedApiClient.auth.updateProfile({
                firstName,
                lastName
            });

            if (response.success) {
                const updatedUser = response.data.user;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                return { success: true };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Profile update failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            setError(null);

            const response = await authenticatedApiClient.auth.changePassword({
                currentPassword,
                newPassword
            });

            if (response.success) {
                return { success: true };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Password change failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
