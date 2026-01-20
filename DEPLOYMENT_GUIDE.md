# 🚀 Vercel Deployment Guide

This guide will help you deploy both the **Frontend** and **Backend** to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Your code should be pushed to a repository
3. **MongoDB Atlas**: Your database should be set up and accessible

---

## 🎯 Deployment Strategy

Since your backend uses **Socket.IO** (which requires persistent connections), we have two deployment options:

### **Option 1: Frontend on Vercel + Backend on Vercel (Recommended)**
- ✅ Frontend: Deploy as static site on Vercel
- ✅ Backend: Deploy as serverless functions on Vercel
- ⚠️ **Note**: Socket.IO real-time features will be limited (serverless functions don't support persistent connections)

### **Option 2: Frontend on Vercel + Backend on Railway/Render (Best for Socket.IO)**
- ✅ Frontend: Deploy as static site on Vercel
- ✅ Backend: Deploy on Railway or Render (supports Socket.IO fully)
- ✅ **Recommended** if you need full Socket.IO functionality

---

## 🎨 Step 1: Deploy Frontend to Vercel

### 1.1 Prepare Frontend

1. **Navigate to your frontend folder:**
   ```bash
   cd frontend
   ```

2. **Ensure build works locally:**
   ```bash
   npm install
   npm run build
   ```
   This should create a `dist` folder.

### 1.2 Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (click "Edit" and set to `frontend`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 1.3 Set Environment Variables (Frontend)

In Vercel project settings → Environment Variables, add:

```
VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
```

**Important**: Replace `your-backend-url.vercel.app` with your actual backend URL (you'll get this after deploying the backend).

### 1.4 Deploy

Click **"Deploy"** and wait for the build to complete.

---

## ⚙️ Step 2: Deploy Backend to Vercel

### 2.1 Prepare Backend

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Verify server.js exists** and is the entry point

### 2.2 Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"** (create a separate project for backend)
3. Import the **same** Git repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend` (click "Edit" and set to `backend`)
   - **Build Command**: Leave empty (or `npm install`)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

### 2.3 Set Environment Variables (Backend)

In Vercel project settings → Environment Variables, add:

```
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
FRONTEND_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
```

**Important**: 
- Replace `your-mongodb-atlas-connection-string` with your MongoDB Atlas URI
- Replace `your-frontend-url.vercel.app` with your frontend Vercel URL
- Use a strong random string for `JWT_SECRET`

### 2.4 Update Backend CORS Configuration

The backend needs to allow your Vercel frontend URL. The current code should handle this via `FRONTEND_URL` environment variable.

### 2.5 Deploy

Click **"Deploy"** and wait for the build to complete.

**Note**: After deployment, copy your backend URL (e.g., `https://mid-street-backend.vercel.app`)

---

## 🔄 Step 3: Update Frontend API URL

After deploying the backend, you need to update the frontend's API URL:

1. Go to your **Frontend** project on Vercel
2. Go to **Settings** → **Environment Variables**
3. Update `VITE_API_BASE_URL`:
   ```
   VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
   ```
4. **Redeploy** the frontend (go to Deployments → click "..." → Redeploy)

---

## 🎯 Alternative: Deploy Backend on Railway (Better for Socket.IO)

If you need full Socket.IO functionality, deploy the backend on Railway instead:

### Railway Deployment Steps:

1. **Sign up** at [railway.app](https://railway.app)
2. **Create New Project** → **Deploy from GitHub**
3. **Select your repository**
4. **Configure**:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
5. **Add Environment Variables**:
   ```
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   FRONTEND_URL=https://your-frontend-url.vercel.app
   NODE_ENV=production
   ```
6. **Deploy** - Railway will automatically deploy
7. **Copy the Railway URL** (e.g., `https://mid-street-backend.up.railway.app`)
8. **Update Frontend** `VITE_API_BASE_URL` in Vercel to point to Railway URL

---

## ✅ Step 4: Verify Deployment

### Test Frontend:
1. Visit your frontend URL: `https://your-frontend.vercel.app`
2. Check if the app loads correctly

### Test Backend:
1. Visit: `https://your-backend-url.vercel.app/api/health`
2. You should see:
   ```json
   {
     "success": true,
     "message": "Server is running!",
     "timestamp": "..."
   }
   ```

### Test API Connection:
1. Open browser console on your frontend
2. Try to load menu items
3. Check for any CORS or connection errors

---

## 🔧 Troubleshooting

### Frontend Issues:

**Build Fails:**
- Check that `vite.config.ts` is in the `frontend` folder
- Verify `package.json` has correct build script
- Check Vercel build logs for errors

**API Connection Fails:**
- Verify `VITE_API_BASE_URL` is set correctly in Vercel environment variables
- Check that backend URL is correct (include `/api` suffix)
- Verify CORS settings in backend allow your frontend URL

### Backend Issues:

**Serverless Function Timeout:**
- Vercel serverless functions have a 10-second timeout for free tier
- Consider upgrading or using Railway/Render for backend

**Socket.IO Not Working:**
- Serverless functions don't support persistent connections
- Deploy backend on Railway or Render for full Socket.IO support

**Database Connection Fails:**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Vercel)
- Verify database credentials

**CORS Errors:**
- Ensure `FRONTEND_URL` in backend matches your frontend Vercel URL exactly
- Check that CORS configuration allows your frontend origin

---

## 📝 Quick Reference

### Frontend Vercel Settings:
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: `VITE_API_BASE_URL`

### Backend Vercel Settings:
- **Root Directory**: `backend`
- **Build Command**: (empty or `npm install`)
- **Output Directory**: (empty)
- **Environment Variables**: 
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `PORT`
  - `FRONTEND_URL`
  - `NODE_ENV=production`

---

## 🎉 Success!

Once deployed, your app should be live at:
- **Frontend**: `https://your-frontend.vercel.app`
- **Backend**: `https://your-backend-url.vercel.app`

Remember to update the frontend's `VITE_API_BASE_URL` after deploying the backend!

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
