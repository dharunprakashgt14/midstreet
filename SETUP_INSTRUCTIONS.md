# Complete Setup Instructions

## 🎯 Overview

This guide will help you set up the complete backend for Mid Street Smart Cafe, including MongoDB Atlas configuration and frontend integration.

---

## 📋 Prerequisites

- Node.js (v18 or higher) installed
- npm or yarn package manager
- A web browser
- Internet connection

---

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Click **"Try Free"** or **"Sign Up"**
3. Fill in your details:
   - Email address
   - Password (save this!)
   - First and last name
4. Click **"Create your Atlas account"**
5. Verify your email address (check your inbox)

### 1.2 Create a Free Cluster

1. After logging in, you'll see the Atlas dashboard
2. Click **"Build a Database"** button
3. Choose **"M0 FREE"** tier (this is free forever)
4. Select a cloud provider:
   - **AWS** (recommended)
   - Google Cloud
   - Azure
5. Choose a region closest to you (e.g., `Mumbai (ap-south-1)` for India)
6. Click **"Create"** button
7. Wait 3-5 minutes for cluster creation

### 1.3 Create Database User

1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"** button
3. Choose **"Password"** authentication method
4. Enter:
   - **Username**: `midstreet-admin` (or any username you prefer)
   - **Password**: Create a strong password (save this!)
5. Under **"Database User Privileges"**, select:
   - **"Atlas admin"** (or **"Read and write to any database"**)
6. Click **"Add User"** button

### 1.4 Whitelist Your IP Address

1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"** button
3. For development, click **"Allow Access from Anywhere"**
   - This adds `0.0.0.0/0` (allows all IPs)
   - ⚠️ For production, add only your specific IP address
4. Click **"Confirm"** button

### 1.5 Get Connection String

1. In the left sidebar, click **"Database"**
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** as driver and **"4.1 or later"** as version
5. Copy the connection string (looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Important**: Replace the placeholders:
   - Replace `<username>` with your database username (e.g., `midstreet-admin`)
   - Replace `<password>` with your database password
   - Add `/midstreet` before the `?` to specify database name
   
   **Final format should be:**
   ```
   mongodb+srv://midstreet-admin:YourPassword123@cluster0.xxxxx.mongodb.net/midstreet?retryWrites=true&w=majority
   ```

---

## 🔧 Step 2: Backend Setup

### 2.1 Install Backend Dependencies

1. Open terminal/command prompt
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### 2.2 Configure Environment Variables

1. In the `backend` folder, copy `.env.example` to `.env`:
   ```bash
   # On Windows (PowerShell)
   Copy-Item .env.example .env
   
   # On Mac/Linux
   cp .env.example .env
   ```

2. Open `backend/.env` file in a text editor

3. Update the values:
   ```env
   MONGODB_URI=mongodb+srv://midstreet-admin:YourPassword123@cluster0.xxxxx.mongodb.net/midstreet?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

   **Replace:**
   - `MONGODB_URI` with your actual connection string from Step 1.5
   - `JWT_SECRET` with a random string (e.g., use a password generator)
   - Keep `PORT=5000` unless you want to change it
   - Keep `FRONTEND_URL=http://localhost:5173` (Vite default port)

### 2.3 Seed the Database

1. Run the seed script to populate menu items and create admin user:
   ```bash
   node backend/scripts/seed.js
   ```

2. You should see:
   ```
   ✅ MongoDB Atlas Connected: ...
   ✅ Inserted X menu items
   ✅ Created admin user: admin
   ```

3. **Default admin credentials:**
   - Username: `admin`
   - Password: `midstreet123`
   - ⚠️ Change this password after first login!

### 2.4 Start Backend Server

1. In the `backend` folder, start the server:
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

2. You should see:
   ```
   ✅ MongoDB Atlas Connected: ...
   🚀 Server Started Successfully!
   📍 Server running on: http://localhost:5000
   ```

3. **Keep this terminal window open** - the server needs to keep running!

---

## 🎨 Step 3: Frontend Setup

### 3.1 Install Frontend Dependencies (if not already done)

1. Open a **new** terminal window
2. Navigate to the project root (not backend folder):
   ```bash
   cd "D:\3rd yr\Mid Street"
   ```

3. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

### 3.2 Configure Frontend API URL (Optional)

1. Create a `.env` file in the project root (same level as `package.json`)
2. Add:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   
   If you don't create this file, it will default to `http://localhost:5000/api`

### 3.3 Start Frontend Development Server

1. In the project root, run:
   ```bash
   npm run dev
   ```

2. The frontend should open automatically at `http://localhost:5173`

---

## ✅ Step 4: Verify Everything Works

### 4.1 Test Backend

1. Open browser and go to: `http://localhost:5000/api/health`
2. You should see:
   ```json
   {
     "success": true,
     "message": "Server is running!",
     "timestamp": "..."
   }
   ```

### 4.2 Test Menu API

1. Go to: `http://localhost:5000/api/menu`
2. You should see a JSON array of menu items

### 4.3 Test Frontend

1. Go to: `http://localhost:5173`
2. You should see the menu loading from the backend
3. Try adding items to cart and placing an order

### 4.4 Test Admin Login

1. Go to: `http://localhost:5173/admin/login`
2. Login with:
   - Username: `admin`
   - Password: `midstreet123`
3. You should be redirected to the admin dashboard
4. You should see orders (if any exist)

---

## 🐛 Troubleshooting

### Backend won't start

**Error: "MONGODB_URI is not defined"**
- Make sure `.env` file exists in `backend` folder
- Check that `MONGODB_URI` is set correctly

**Error: "MongoDB Connection Error"**
- Verify your connection string is correct
- Check that your IP is whitelisted in MongoDB Atlas
- Verify username and password are correct
- Make sure your internet connection is working

**Error: "Port 5000 already in use"**
- Change `PORT` in `.env` to a different number (e.g., `5001`)
- Or stop the process using port 5000

### Frontend can't connect to backend

**Error: "Failed to fetch"**
- Make sure backend server is running (`http://localhost:5000`)
- Check browser console for CORS errors
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL

### Menu not loading

- Check browser console for errors
- Verify backend is running and accessible at `http://localhost:5000/api/menu`
- Check network tab in browser dev tools

### Admin login fails

- Verify admin user was created (run seed script again)
- Check backend logs for errors
- Make sure JWT_SECRET is set in `.env`

---

## 📝 Next Steps

1. **Change Admin Password**: After first login, consider changing the admin password
2. **Add More Menu Items**: Use MongoDB Atlas web interface or update seed script
3. **Deploy**: When ready, deploy backend to services like Heroku, Railway, or Render
4. **Production Setup**: 
   - Change JWT_SECRET to a strong random string
   - Whitelist only your production IP in MongoDB Atlas
   - Use environment variables for all sensitive data

---

## 🆘 Need Help?

If you encounter issues:
1. Check the console logs (both backend and browser)
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas cluster is running
4. Check that both servers (backend and frontend) are running

---

## 📚 File Structure

```
Mid Street/
├── backend/
│   ├── config/
│   │   └── db.js          # Database connection
│   ├── controllers/       # API logic
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── scripts/
│   │   └── seed.js        # Database seeding
│   ├── server.js          # Main server file
│   ├── package.json
│   └── .env               # Environment variables
│
├── src/
│   ├── utils/
│   │   └── api.ts         # Frontend API calls
│   ├── context/           # React context
│   └── pages/             # Frontend pages
│
└── package.json           # Frontend dependencies
```

---

**🎉 Congratulations! Your backend is now fully integrated!**






