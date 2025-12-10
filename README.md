# Employee Attendance System

A full-stack web application for tracking employee attendance with geolocation support. Built with Node.js/Express backend and React frontend.

## Features

### Employee Features
- **Check-in/Check-out** with automatic GPS location capture
- **View attendance history** with date filtering
- **Map view** of check-in/check-out locations

### Admin Features
- **Employee Management** - Add, view, activate/deactivate employees
- **Attendance Dashboard** - View all employee attendance records
- **Filtering** - Filter by employee and date range
- **Export Reports** - Download attendance data as Excel or PDF

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL (with pg driver)
- JWT Authentication
- bcrypt for password hashing
- ExcelJS for Excel exports
- PDFKit for PDF exports

### Frontend
- React 18 with Vite
- React Router for navigation
- Axios for API calls
- React-Leaflet for maps (OpenStreetMap)
- CSS with responsive design

## Project Structure

```
employee-attendance-mart/
├── server/                    # Backend API
│   ├── src/
│   │   ├── config/           # Database and environment config
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth and error handling
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── utils/            # Helper functions
│   │   ├── scripts/          # DB initialization script
│   │   ├── app.js            # Express app setup
│   │   └── server.js         # Server entry point
│   └── package.json
│
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── api/              # API service modules
│   │   ├── components/       # React components
│   │   ├── context/          # Auth context
│   │   ├── pages/            # Page components
│   │   ├── router/           # Route definitions
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── index.html
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or Render)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/attendance_db
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

4. Initialize database (creates tables and default admin):
   ```bash
   npm run db:init
   ```
   
   Default admin credentials:
   - Mobile: `9999999999`
   - Employee ID: `ADMIN001`
   - Password: `admin123`

5. Start the server:
   ```bash
   npm run dev    # Development with nodemon
   npm start      # Production
   ```

### Frontend Setup

1. Navigate to client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (for production):
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user profile |

### Attendance (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance/check-in` | Check in with location |
| POST | `/api/attendance/check-out` | Check out with location |
| GET | `/api/attendance/status` | Get current check-in status |
| GET | `/api/attendance/me` | Get own attendance records |

### Admin (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/employees` | List all employees |
| POST | `/api/admin/employees` | Create new employee |
| DELETE | `/api/admin/employees/:id` | Deactivate employee |
| PATCH | `/api/admin/employees/:id/activate` | Activate employee |
| GET | `/api/admin/attendance` | Get all attendance records |
| GET | `/api/admin/attendance/export/excel` | Export to Excel |
| GET | `/api/admin/attendance/export/pdf` | Export to PDF |

## Deployment on Render

### PostgreSQL Database
1. Create a new PostgreSQL database on Render
2. Copy the Internal Database URL

### Backend (Web Service)
1. Create new Web Service
2. Connect your GitHub repository
3. Set root directory: `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `DATABASE_URL` - Your Render PostgreSQL URL
   - `JWT_SECRET` - Strong random string
   - `FRONTEND_URL` - Your frontend URL
   - `NODE_ENV` - `production`

### Frontend (Static Site)
1. Create new Static Site
2. Connect your GitHub repository
3. Set root directory: `client`
4. Build command: `npm install && npm run build`
5. Publish directory: `dist`
6. Add environment variable:
   - `VITE_API_URL` - Your backend URL (e.g., `https://your-backend.onrender.com`)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE,
  name VARCHAR(100) NOT NULL,
  mobile_number VARCHAR(15) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'employee',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Attendance Records Table
```sql
CREATE TABLE attendance_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  check_in_time TIMESTAMP NOT NULL,
  check_in_latitude DOUBLE PRECISION,
  check_in_longitude DOUBLE PRECISION,
  check_out_time TIMESTAMP,
  check_out_latitude DOUBLE PRECISION,
  check_out_longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## License

ISC License

