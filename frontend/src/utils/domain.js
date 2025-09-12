// Utility functions for domain handling
// 
// Environment Variables:
// - REACT_APP_API_BASE_URL: Backend API base URL (e.g., http://localhost:5000)
// - REACT_APP_ENV: Environment name (development, staging, production)

export const getCurrentDomain = () => {
  return window.location.hostname;
};

export const getBaseDomain = () => {
  const hostname = window.location.hostname;

  // If it's localhost, return localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'localhost';
  }

  // For subdomains, extract the base domain
  // e.g., subdomain.example.com -> example.com
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return parts.slice(-1).join('.');
  }

  return hostname;
};

export const getSubdomainUrl = (subdomain) => {
  const baseDomain = getBaseDomain();
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';

  return `${protocol}//${subdomain}.${baseDomain}${port}`;
};

export const getApiBaseUrl = () => {
  // Use environment variable if available
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  // Fallback to dynamic detection for backward compatibility
  const protocol = window.location.protocol;

  const baseDomain = getBaseDomain();
  const port = baseDomain === 'localhost' ? '5000' : (window.location.port ? `:${window.location.port}` : '');

  return `${protocol}//${baseDomain}:${port}`;
};

export const getMainAppUrl = () => {
  const protocol = window.location.protocol;
  const baseDomain = getBaseDomain();
  const port = window.location.port ? `:${window.location.port}` : '';

  return `${protocol}//${baseDomain}${port}`;
};

export const getPortfolioUrl = (subdomain) => {
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';
  const hostname = window.location.hostname;
  return `${protocol}//${subdomain}.${hostname}${port}`;
};
