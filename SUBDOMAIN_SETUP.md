# Subdomain Portfolio Setup Guide

## How Subdomain Access Works

When someone visits a subdomain (like `mikesplumbing.localhost`), they will see the public portfolio for that domain automatically.

## Testing Subdomain Functionality

### Step 1: Set up your hosts file (for local development)

Add entries to your `/etc/hosts` file to test subdomains locally:

```bash
sudo nano /etc/hosts
```

Add these lines:
```
127.0.0.1 mikesplumbing.localhost
127.0.0.1 example.localhost
127.0.0.1 testcompany.localhost
```

### Step 2: Start both servers

1. **Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend Server (in a new terminal):**
   ```bash
   cd frontend
   npm start
   ```

### Step 3: Create a test portfolio

1. Go to `http://localhost:3000`
2. Register with:
   - Email: `test@example.com`
   - Domain: `mikesplumbing.localhost`
3. Complete the portfolio builder with sample data
4. Save and preview

### Step 4: Test subdomain access

1. Open a new browser tab
2. Visit `http://mikesplumbing.localhost:3000`
3. You should see the public portfolio automatically!

## How It Works

### Backend API
- New endpoint: `GET /api/portfolio/domain/:domain`
- Fetches complete portfolio data by domain name
- Returns overview, sections, and section items

### Frontend Detection
- Automatically detects if user is on a subdomain
- Shows `PublicPortfolio` component instead of landing page
- Fetches and displays portfolio data for that domain

### Domain Mapping
- `mikesplumbing.localhost` → looks up domain `mikesplumbing.localhost` in database
- Shows the complete portfolio with professional design
- Mobile responsive and SEO friendly

## Features of Public Portfolio

- **Professional Header** with company logo, name, and contact info
- **Google Rating Display** with star ratings
- **Hero Section** with company title and description
- **Services Grid** with expandable "What's Included" sections
- **Contact Section** with clickable phone/email links
- **Professional Footer** with company details
- **Fully Responsive** design for all devices

## Production Deployment

For production, you would:

1. Set up wildcard DNS: `*.yourdomain.com`
2. Configure your web server (nginx/Apache) to handle subdomains
3. Update CORS settings for your production domain
4. Deploy frontend and backend to your server

## Example URLs

- Main app: `http://localhost:3000`
- Mike's Plumbing: `http://mikesplumbing.localhost:3000`
- Test Company: `http://testcompany.localhost:3000`
- Any domain: `http://[domain].localhost:3000`

## Error Handling

- **Portfolio Not Found**: Shows friendly error with link to create portfolio
- **Incomplete Portfolio**: Shows message if portfolio data is missing
- **Loading States**: Smooth loading experience while fetching data
