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
│   │   ├── scripts/          # DB initialization scripts
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
├── render.yaml               # Render deployment configuration
├── package.json              # Root package.json for monorepo
└── README.md
```

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud)
- npm or yarn

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd employee-attendance-mart

# Install all dependencies (root, client, server)
npm run install:all
```

### 2. Configure Environment Variables

**Server (.env)**
```bash
cd server
cp .env.example .env
# Edit .env with your database credentials
```

```env
DATABASE_URL=postgresql://user:password@localhost:5432/attendance_db
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Client (.env)** (Optional for development)
```bash
cd client
cp .env.example .env
```

### 3. Initialize Database

```bash
# From the root directory
npm run db:setup

# Or from server directory
cd server
npm run db:setup
```

This will:
- Create all required tables
- Create a default admin user

**Default Admin Credentials:**
- Mobile: `9999999999`
- Employee ID: `ADMIN001`
- Password: `admin123`

⚠️ **Change these credentials after first login!**

### 4. Start Development Servers

```bash
# From root (runs both frontend and backend)
npm run dev

# Or separately:
npm run dev:server  # Backend on http://localhost:5000
npm run dev:client  # Frontend on http://localhost:5173
```

## Deployment on Render

### Option 1: Using Render Blueprint (Recommended)

1. Push your code to GitHub/GitLab
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New > Blueprint**
4. Connect your repository
5. Render will automatically detect `render.yaml` and create:
   - PostgreSQL Database
   - Backend Web Service
   - Frontend Static Site

6. After deployment, update environment variables:
   - Set `FRONTEND_URL` in backend to your frontend URL
   - Set `VITE_API_URL` in frontend to your backend URL

### Option 2: Manual Deployment

#### Step 1: Create PostgreSQL Database

1. Render Dashboard → **New > PostgreSQL**
2. Name: `attendance-db`
3. Database: `attendance_db`
4. User: `attendance_user`
5. Copy the **Internal Database URL**

#### Step 2: Deploy Backend

1. Render Dashboard → **New > Web Service**
2. Connect your repository
3. Configure:
   - **Name:** `employee-attendance-api`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add Environment Variables:
   - `DATABASE_URL` - Internal PostgreSQL URL
   - `JWT_SECRET` - Generate a strong random string
   - `FRONTEND_URL` - Your frontend URL (update after frontend deployment)
   - `NODE_ENV` - `production`

#### Step 3: Deploy Frontend

1. Render Dashboard → **New > Static Site**
2. Connect your repository
3. Configure:
   - **Name:** `employee-attendance-web`
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_URL` - Your backend URL (e.g., `https://your-backend.onrender.com`)
5. Add Rewrite Rule:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: Rewrite

#### Step 4: Update CORS

After both are deployed, update the backend's `FRONTEND_URL` environment variable to your frontend URL.

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

## Database Schema

The database is automatically created when the server starts. The schema includes:

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
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP NOT NULL,
  check_in_latitude DOUBLE PRECISION,
  check_in_longitude DOUBLE PRECISION,
  check_out_time TIMESTAMP,
  check_out_latitude DOUBLE PRECISION,
  check_out_longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Scripts Reference

### Root Directory
```bash
npm run install:all   # Install all dependencies
npm run dev           # Start both servers in development
npm run dev:server    # Start backend only
npm run dev:client    # Start frontend only
npm run build         # Build frontend for production
npm run db:setup      # Initialize database
```

### Server Directory
```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
npm run db:setup     # Full database setup with verification
npm run db:init      # Quick database initialization
```

### Client Directory
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Automatic Database Initialization

The server automatically:
1. **Creates tables** on startup if they don't exist
2. **Creates default admin** if no admin user exists

This means you don't need to run any separate database scripts for deployment - just start the server!

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- For Render: Use the **Internal** Database URL
- Check if PostgreSQL is running locally

### CORS Errors
- Ensure `FRONTEND_URL` is set correctly in backend
- For multiple origins, use comma-separated values

### Authentication Issues
- Check if `JWT_SECRET` is set
- Clear browser localStorage and try logging in again

### Build Failures
- Ensure Node.js version is 18+
- Delete `node_modules` and reinstall

## Security Recommendations

1. **Change Default Admin Password** immediately after deployment
2. **Use Strong JWT Secret** - Generate with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Enable HTTPS** - Render provides this automatically
4. **Regular Backups** - Enable automatic backups for your database

## License

MIT License - see [LICENSE](LICENSE) file

