# Environment Configuration Guide

## Frontend Environment Variables

The frontend uses environment variables to configure the backend API URL and other settings.

### Setup Instructions

1. **Create Environment File**
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Configure Variables**
   Edit the `.env` file with your settings:
   ```env
   # Backend API Configuration
   REACT_APP_API_BASE_URL=http://localhost:5000
   
   # Environment
   REACT_APP_ENV=development
   ```

### Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `REACT_APP_API_BASE_URL` | Backend API base URL | `http://localhost:5000` | `https://api.yourapp.com` |
| `REACT_APP_ENV` | Environment name | `development` | `production` |

### Environment-Specific Configurations

#### Development
```env
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_ENV=development
```

#### Staging
```env
REACT_APP_API_BASE_URL=https://api-staging.yourapp.com
REACT_APP_ENV=staging
```

#### Production
```env
REACT_APP_API_BASE_URL=https://api.yourapp.com
REACT_APP_ENV=production
```

### How It Works

The frontend automatically uses the `REACT_APP_API_BASE_URL` environment variable for all API calls. If the variable is not set, it falls back to dynamic detection based on the current domain.

#### API URL Resolution Priority:
1. **Environment Variable**: Uses `REACT_APP_API_BASE_URL` if set
2. **Dynamic Detection**: Falls back to automatic domain detection
3. **Localhost Fallback**: Uses `localhost:5000` for development

### Testing Different Environments

#### Test with Local Backend:
```bash
REACT_APP_API_BASE_URL=http://localhost:5000 npm start
```

#### Test with Remote Backend:
```bash
REACT_APP_API_BASE_URL=https://your-backend-url.com npm start
```

### Deployment Notes

- **Docker**: Pass environment variables through docker-compose or Dockerfile
- **Vercel/Netlify**: Set environment variables in deployment settings
- **AWS/Azure**: Configure through environment variable settings

### Troubleshooting

#### Common Issues:

1. **CORS Errors**: Make sure backend CORS is configured for your frontend domain
2. **API Not Found**: Verify `REACT_APP_API_BASE_URL` is correct
3. **Environment Variables Not Loading**: Ensure variables start with `REACT_APP_`

#### Debug API URL:
Add this to any component to see which API URL is being used:
```javascript
import { getApiBaseUrl } from '../utils/domain';
console.log('API Base URL:', getApiBaseUrl());
```
