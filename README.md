# Multi-Tenant Portfolio

A full-stack multi-tenant portfolio application built with React frontend and Express backend.

## Project Structure

```
MultiTenantPortfolio/
├── frontend/          # React application
├── backend/           # Express server
├── package.json       # Root package.json for project management
└── README.md          # This file
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository and install all dependencies:
   ```bash
   npm run install:all
   ```

### Development

1. Start both frontend and backend in development mode:
   ```bash
   npm run dev
   ```
   This will start:
   - React frontend on http://localhost:3000
   - Express backend on http://localhost:5000

2. Or start them individually:
   ```bash
   # Start only frontend
   npm run dev:frontend
   
   # Start only backend
   npm run dev:backend
   ```

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the React frontend
- `npm run dev:backend` - Start only the Express backend
- `npm run start:frontend` - Start frontend in production mode
- `npm run start:backend` - Start backend in production mode
- `npm run build` - Build the frontend for production
- `npm run install:all` - Install dependencies for root, frontend, and backend

### API Endpoints

The backend server provides the following endpoints:
- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint

## Technologies Used

### Frontend
- React
- Create React App

### Backend
- Express.js
- CORS middleware
- dotenv for environment variables
- nodemon for development

## Environment Variables

Backend environment variables (in `backend/.env`):
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)
