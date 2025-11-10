# Yug Properties Backend

Backend API for Yug Properties Real Estate Platform built with Node.js, Express, and PostgreSQL (Neon DB).

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
The `.env` file is already configured with your Neon DB credentials.

### 3. Initialize Database
Run this command to create tables and default admin user:
```bash
npm run init-db
```

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## Default Admin Credentials

- **Email:** admin@yugproperties.com
- **Password:** Admin@123

⚠️ **Important:** Change these credentials in production!

## API Endpoints

### Authentication Routes

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

#### Login (User or Admin)
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "user"  // or "admin"
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "9876543210"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT authentication
- ✅ Role-based access control (User/Admin)
- ✅ Input validation with express-validator
- ✅ CORS enabled
- ✅ SSL connection to Neon DB

## Tech Stack

- **Framework:** Express.js
- **Database:** PostgreSQL (Neon DB)
- **Authentication:** JWT
- **Password Hashing:** bcryptjs
- **Validation:** express-validator
