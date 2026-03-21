# GST Invoice System

A full-stack web application designed for creating, managing, and generating GST-compliant tax invoices. This application features a modern UI with light and dark mode support, user authentication, company management, and professional PDF invoice generation.

## Features

- **User Authentication**: Secure signup and login with JWT and bcrypt.
- **Company Management**: Users can manage multiple billing companies. Companies are strictly scoped to the logged-in user.
- **Invoice Generation**: Create detailed tax invoices with dynamic item calculations (subtotal, CGST, SGST, grand total).
- **PDF Export**: Generate ready-to-print, professional PDF invoices directly from the dashboard matching a high-quality reference format.
- **Dashboard**: View recent invoices and manage your businesses from a centralized dashboard.
- **Responsive UI**: A modern, sleek, and fully responsive user interface built with React and Tailwind CSS.

## Technology Stack

- **Frontend**:
    - React (Vite)
    - React Router DOM
    - Axios (for API requests)
    - Tailwind CSS (for styling)
    - React Icons
- **Backend**:
    - Node.js & Express.js
    - MongoDB & Mongoose (Database & ODM)
    - JSON Web Tokens (JWT) for authentication
    - PDFKit for generating PDF documents
- **Other Tools**:
    - Concurrently (for running client and server together)

## Prerequisites

Before running this project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd gst-invoice-system
   ```

2. **Install Server Dependencies**:
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies**:
   ```bash
   cd ../client
   npm install
   ```

## Configuration

1. **Backend Environment Variables**:
   In the `server` directory, create a `.env` file with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/gst-invoice
   JWT_SECRET=your_jwt_secret_key
   ```
   *(Update `MONGO_URI` if you are using a cloud database like MongoDB Atlas).*

2. **Frontend Environment Variables** (Optional, if overriding defaults):
   In the `client` directory, create a `.env` file (if necessary, though the proxy handles most local connections).

## Seeding the Database

To quickly populate the application with a default admin user and sample companies:

```bash
cd server
node seed.js
```

This script generates:
- **Email**: `admin@seed.com`
- **Password**: `password123`
- 4 Sample Companies tied to this default user.

## Running the Application

This project is set up to run both the frontend and backend concurrently from the root (or independently from their respective folders).

**To run both servers independently:**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

By default:
- Backend runs on: `http://localhost:5000`
- Frontend runs on: `http://localhost:5173`

## Directory Structure

```plaintext
gst-invoice-system/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Full page views (Dashboard, Login, Invoice Form)
│   │   ├── index.css       # Global styles & Tailwind
│   │   └── api.js          # Axios configuration and interceptors
│   └── package.json
└── server/                 # Node.js/Express Backend
    ├── config/             # Database connection setup
    ├── middleware/         # Auth & error middlewares
    ├── models/             # Mongoose schemas (User, Company, Invoice)
    ├── routes/             # Express API routes
    ├── seed.js             # Database seeder script
    └── package.json
```

## API Endpoints (Backend)

- **Auth Routes (`/api/auth`)**:
    - `POST /register`: Register a new user
    - `POST /login`: Login and receive JWT
    - `GET /me`: Get current logged-in user profile
- **Company Routes (`/api/companies`)**: *(Requires Auth)*
    - `GET /`: Get all companies for the logged-in user
    - `POST /`: Create a new company
    - `GET /:id`: Get a specific company
    - `PUT /:id`: Update a company
    - `DELETE /:id`: Delete a company
- **Invoice Routes (`/api/invoices`)**: *(Requires Auth)*
    - `GET /`: Get all invoices for logged-in user
    - `POST /`: Create a new invoice
    - `GET /:id`: Get specific invoice details
    - `PUT /:id`: Update an invoice
    - `DELETE /:id`: Delete an invoice
    - `GET /:id/pdf`: Generate and download the PDF for an invoice
    - `GET /next-number/generate`: Helper endpoint to generate sequence invoice numbers

## License

This project is open-source and free to use.
