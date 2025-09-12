# Multi-Tenant Portfolio Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/multitenant_portfolio
   PORT=5000
   NODE_ENV=development
   ```
   Replace `username`, `password`, and database name with your PostgreSQL credentials.

4. Create the database tables (you'll need to run migrations or create tables manually based on your models).

5. Start the backend server:
   ```bash
   npm run dev
   ```

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

## Testing the Integration

1. Make sure both backend (port 5000) and frontend (port 3000) servers are running.
2. Open your browser and go to `http://localhost:3000`
3. Fill in the registration form with:
   - A valid email address
   - A unique domain name
4. Click "Get Started" to test the API integration.

## API Endpoint

The backend provides the following endpoint:

### POST /api/register
Creates a new user and website profile.

**Request Body:**
```json
{
  "email": "user@example.com",
  "domain": "myportfolio.com"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User and website profile created successfully",
  "data": {
    "user": {
      "pk": "uuid-here",
      "email": "user@example.com"
    },
    "websiteProfile": {
      "pk": "uuid-here",
      "domain": "myportfolio.com"
    }
  }
}
```

**Error Responses:**
- 400: Validation error or missing fields
- 409: Email or domain already exists
- 500: Internal server error
