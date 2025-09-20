import axios from 'axios';

// API Base URL configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Create axios instance for public API calls (no authentication required)
 */
const publicAPI = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

/**
 * Create axios instance for authenticated API calls
 */
const authenticatedAPI = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor to include auth token for authenticated API
authenticatedAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token expiration for authenticated API
authenticatedAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

/**
 * PUBLIC API METHODS - No authentication required
 */
export const publicApiClient = {
    // Authentication
    auth: {
        signup: async (userData) => {
            const response = await publicAPI.post('/auth/signup', userData);
            return response.data;
        },
        login: async (credentials) => {
            const response = await publicAPI.post('/auth/login', credentials);
            return response.data;
        }
    },

    // Portfolio - Public access
    portfolio: {
        getServices: async () => {
            const response = await publicAPI.get('/portfolio/services');
            return response.data;
        },
        getBySubdomain: async (subdomain) => {
            const response = await publicAPI.get(`/portfolio/subdomain/${subdomain}`);
            return response.data;
        },
        getByBusinessId: async (businessId) => {
            const response = await publicAPI.get(`/portfolio/business/${businessId}`);
            return response.data;
        }
    },

    // Utility
    health: async () => {
        const response = await publicAPI.get('/health');
        return response.data;
    }
};

/**
 * AUTHENTICATED API METHODS - Require valid JWT token
 */
export const authenticatedApiClient = {
    // Authentication - Authenticated endpoints
    auth: {
        verify: async () => {
            const response = await authenticatedAPI.get('/auth/verify');
            return response.data;
        },
        getProfile: async () => {
            const response = await authenticatedAPI.get('/auth/profile');
            return response.data;
        },
        updateProfile: async (profileData) => {
            const response = await authenticatedAPI.put('/auth/profile', profileData);
            return response.data;
        },
        changePassword: async (passwordData) => {
            const response = await authenticatedAPI.put('/auth/change-password', passwordData);
            return response.data;
        }
    },

    // Portfolio - Authenticated endpoints
    portfolio: {
        create: async (portfolioData) => {
            const response = await authenticatedAPI.post('/portfolio/complete', portfolioData);
            return response.data;
        },
        getUserPortfolio: async (userId) => {
            const response = await authenticatedAPI.get(`/portfolio/user/${userId}`);
            return response.data;
        },
        getMyPortfolio: async () => {
            const response = await authenticatedAPI.get('/portfolio/my');
            return response.data;
        },
        // Step-by-step saving
        saveBusiness: async (businessData) => {
            const response = await authenticatedAPI.post('/portfolio/step/business', { business: businessData });
            return response.data;
        },
        saveServices: async (servicesData) => {
            const response = await authenticatedAPI.post('/portfolio/step/services', { services: servicesData });
            return response.data;
        },
        saveServiceAreas: async (serviceAreasData) => {
            const response = await authenticatedAPI.post('/portfolio/step/service-areas', { serviceAreas: serviceAreasData });
            return response.data;
        },
        saveTestimonials: async (testimonialsData) => {
            const response = await authenticatedAPI.post('/portfolio/step/testimonials', { testimonials: testimonialsData });
            return response.data;
        },
        saveLicenses: async (licensesData) => {
            const response = await authenticatedAPI.post('/portfolio/step/licenses', { licenses: licensesData });
            return response.data;
        }
    },

    // Admin endpoints
    admin: {
        getUsers: async () => {
            const response = await authenticatedAPI.get('/admin/users');
            return response.data;
        }
    }
};

/**
 * UPLOAD API METHODS - File upload functionality
 */
export const uploadApiClient = {
    uploadFile: async (file, onUploadProgress = null) => {
        const formData = new FormData();
        formData.append('logo', file);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };

        if (onUploadProgress) {
            config.onUploadProgress = onUploadProgress;
        }

        const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, config);
        return response.data;
    },

    deleteFile: async (filename) => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {}
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.delete(`${API_BASE_URL}/api/upload/${filename}`, config);
        return response.data;
    }
};

/**
 * COMBINED API CLIENT - Provides access to all API methods
 */
export const apiClient = {
    public: publicApiClient,
    auth: authenticatedApiClient,
    upload: uploadApiClient
};

// Export individual clients for specific use cases
export default apiClient;

// Export base URLs for components that need direct fetch calls
export { API_BASE_URL };
