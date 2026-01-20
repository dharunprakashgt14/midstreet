# Mid Street Backend API

Complete backend implementation for Mid Street Smart Cafe food ordering system.

## 📋 Table of Contents

1. [MongoDB Atlas Setup](#mongodb-atlas-setup)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Server](#running-the-server)
5. [API Endpoints](#api-endpoints)
6. [Database Seeding](#database-seeding)

---

## 🗄️ MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Click **"Try Free"** or **"Sign Up"**
3. Fill in your details and create an account
4. Verify your email address

### Step 2: Create a Cluster

1. After logging in, click **"Build a Database"**
2. Choose **"M0 FREE"** tier (free forever)
3. Select a cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region closest to you
5. Click **"Create"** (cluster creation takes 3-5 minutes)

### Step 3: Create Database User

1. In the **"Database Access"** section (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username (e.g., `midstreet-admin`)
5. Enter a strong password (save this!)
6. Set privileges to **"Atlas admin"** or **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Whitelist Your IP Address

1. In the **"Network Access"** section (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - Or add your specific IP address for production
4. Click **"Confirm"**

### Step 5: Get Connection String

1. Go to **"Database"** section (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` with your database username
6. Replace `<password>` with your database password
7. Add database name at the end: `/midstreet?retryWrites=true&w=majority`

**Example:**
```
mongodb+srv://midstreet-admin:MyPassword123@cluster0.xxxxx.mongodb.net/midstreet?retryWrites=true&w=majority
```

---

## 📦 Installation

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## ⚙️ Configuration

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your values:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/midstreet?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

   **Important:**
   - Replace `your-username` and `your-password` with your MongoDB Atlas credentials
   - Change `JWT_SECRET` to a random string (for production)
   - Keep `PORT=5000` unless you want to change it
   - Update `FRONTEND_URL` if your frontend runs on a different port

---

## 🚀 Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

You should see:
```
✅ MongoDB Atlas Connected: ...
🚀 Server Started Successfully!
📍 Server running on: http://localhost:5000
```

---

## 📡 API Endpoints

### Menu
- **GET** `/api/menu` - Get all menu items

### Orders
- **POST** `/api/orders` - Create a new order
- **GET** `/api/orders/:id` - Get order by ID
- **PATCH** `/api/orders/:id/add-item` - Add items to existing order
- **PATCH** `/api/orders/:id/status` - Update order status

### Admin (Protected - requires JWT token)
- **POST** `/api/admin/login` - Admin login (returns JWT token)
- **GET** `/api/admin/orders` - Get all orders
- **GET** `/api/admin/summary` - Get daily summary

### Health Check
- **GET** `/api/health` - Check if server is running

---

## 🌱 Database Seeding

After setting up MongoDB Atlas, seed the database with initial data:

```bash
node backend/scripts/seed.js
```

This will:
- Clear existing menu items and admin users
- Insert all menu items from the frontend
- Create default admin user:
  - Username: `admin`
  - Password: `midstreet123`

**⚠️ Important:** Change the admin password after first login in production!

---

## 🔧 Troubleshooting

### Connection Error: "MongoDB Atlas Connected"
- Check your `MONGODB_URI` in `.env` file
- Verify username and password are correct
- Make sure your IP is whitelisted in MongoDB Atlas
- Check your internet connection

### Port Already in Use
- Change `PORT` in `.env` file
- Or stop the process using port 5000

### JWT Secret Error
- Make sure `JWT_SECRET` is set in `.env` file

---

## 📝 Notes

- The backend runs on port 5000 by default
- Frontend should run on port 5173 (Vite default)
- CORS is enabled for `http://localhost:5173`
- All admin routes require JWT authentication
- Orders lock prices at order time
- Menu items can be updated via MongoDB directly or through API

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the console logs for error messages
2. Verify your `.env` file is configured correctly
3. Ensure MongoDB Atlas cluster is running
4. Check that your IP is whitelisted in MongoDB Atlas






