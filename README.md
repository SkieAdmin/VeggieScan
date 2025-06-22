# VeggieScan System

Visual Diagnosis of Vegetable Freshness and Contamination

## Research Capstone Project
**St. Michael's College of Iligan (A.Y 2025-2026)**

### Development Team
* **Lead Developer:** Kerneil Rommel S. Gocotano
* **Research:** John Michael S. Abiol

## Project Overview

VeggieScan is a system that uses AI to analyze images of vegetables and determine their freshness and potential contamination. The system provides recommendations based on the analysis results.

## Architecture

- **Backend**: NodeJS (ES6 Module) with Express
- **Frontend**: ReactJS with Material-UI
- **Database**: MariaDB with Prisma ORM
- **AI Integration**: LM Studio API with fallback dataset
- **Authentication**: JWT-based authentication with role-based access control

## Project Structure

- `/backend` - NodeJS backend server
  - `/src` - Source code
    - `/controllers` - API route controllers
    - `/middleware` - Authentication and validation middleware
    - `/models` - Database models with Prisma
    - `/routes` - API route definitions
    - `/utils` - Utility functions
  - `/prisma` - Prisma schema and migrations
  - `/uploads` - Image upload directory

- `/frontend` - React frontend application
  - `/src` - Source code
    - `/components` - Reusable UI components
    - `/contexts` - React context providers (Auth, Theme)
    - `/layouts` - Page layout components
    - `/pages` - Application pages
      - `/auth` - Authentication pages (Login, Register)
      - `/user` - User pages (Dashboard, Scan Upload, History, etc.)
      - `/admin` - Admin pages (Dashboard, User Management, etc.)
    - `/services` - API service functions
    - `/utils` - Utility functions

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Configure environment variables in `.env`:
   ```
   DATABASE_URL="mysql://user:password@localhost:3306/veggiescan"
   JWT_SECRET="your-secret-key"
   PORT=3001
   ```
4. Run database migrations: `npx prisma migrate dev`
5. Start the server: `npm start` or `npm run dev` for development

### Frontend Setup

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Configure environment variables in `.env` if needed
4. Start the development server: `npm start`

### LM Studio Setup

1. Install LM Studio from [https://lmstudio.ai/](https://lmstudio.ai/)
2. Load the gemma-3-4b model
3. Start the local server on port 1234
4. Configure the API URL in the admin settings

## Features

### User Features

- **Authentication**: Secure login and registration
- **Dashboard**: Overview of scan statistics and recent activity
- **Scan Upload**: Upload vegetable images with drag-and-drop functionality
  - Real-time upload progress tracking
  - AI-powered analysis with LM Studio
  - Fallback to dataset when AI is unavailable
- **Scan History**: View past scans with search and filtering
- **Scan Details**: Detailed view of analysis results
- **User Settings**: Profile management, password changes, and notification preferences

### Admin Features

- **Admin Dashboard**: System-wide statistics and monitoring
- **User Management**: View, add, edit, and delete users
- **Scan Management**: View and manage all scans in the system
- **System Status**: Monitor LM Studio API, database, and system resources
- **Admin Settings**: Configure system-wide settings

### Technical Features

- Responsive design for all device sizes
- Dark/light theme toggle
- Role-based access control
- JWT authentication
- Real-time progress indicators
- Client-side form validation
- Error handling and user feedback
- Secure password storage
