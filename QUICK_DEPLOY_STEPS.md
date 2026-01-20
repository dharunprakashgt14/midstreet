# ⚡ Quick Deployment Steps - Vercel

## 🎯 Overview
Deploy **Frontend** and **Backend** separately on Vercel.

---

## 📦 Step 1: Deploy Frontend

### Via Vercel Dashboard:

1. **Go to [vercel.com](https://vercel.com)** → Sign in → **"Add New Project"**

2. **Import your Git repository**

3. **Configure Project:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variable:**
   ```
   Name: VITE_API_BASE_URL
   Value: https://YOUR-BACKEND-URL.vercel.app/api
   ```
   ⚠️ **Note**: You'll update this after deploying backend!

5. **Click "Deploy"**

6. **Copy your Frontend URL** (e.g., `https://mid-street-frontend.vercel.app`)

---

## ⚙️ Step 2: Deploy Backend

### Via Vercel Dashboard:

1. **Go to [vercel.com](https://vercel.com)** → **"Add New Project"** (create NEW project)

2. **Import the SAME Git repository**

3. **Configure Project:**
   ```
   Framework Preset: Other
   Root Directory: backend
   Build Command: (leave empty)
   Output Directory: (leave empty)
   Install Command: npm install
   ```

4. **Add Environment Variables:**
   ```
   MONGODB_URI = your-mongodb-atlas-connection-string
   JWT_SECRET = your-random-secret-key-min-32-chars
   PORT = 5000
   FRONTEND_URL = https://YOUR-FRONTEND-URL.vercel.app
   NODE_ENV = production
   ```

5. **Click "Deploy"**

6. **Copy your Backend URL** (e.g., `https://mid-street-backend.vercel.app`)

---

## 🔄 Step 3: Connect Frontend to Backend

1. **Go to Frontend project** → **Settings** → **Environment Variables**

2. **Update `VITE_API_BASE_URL`:**
   ```
   Value: https://YOUR-BACKEND-URL.vercel.app/api
   ```

3. **Redeploy Frontend:**
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

---

## ✅ Step 4: Test

1. **Test Backend:** Visit `https://YOUR-BACKEND-URL.vercel.app/api/health`
   - Should return: `{"success": true, "message": "Server is running!"}`

2. **Test Frontend:** Visit `https://YOUR-FRONTEND-URL.vercel.app`
   - Should load your app
   - Check browser console for errors

---

## ⚠️ Important Notes

### Socket.IO Limitation:
- **Vercel serverless functions don't support Socket.IO persistent connections**
- Real-time features (order status updates) may not work
- **Solution**: Deploy backend on **Railway** or **Render** for full Socket.IO support

### MongoDB Atlas:
- Make sure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` (allows all IPs)
- Or add Vercel's IP ranges (check Vercel docs)

### Environment Variables:
- **Never commit** `.env` files to Git
- Always set environment variables in Vercel dashboard
- Redeploy after changing environment variables

---

## 🚀 Alternative: Backend on Railway (Recommended for Socket.IO)

If you need Socket.IO to work fully:

1. **Sign up at [railway.app](https://railway.app)**
2. **New Project** → **Deploy from GitHub**
3. **Root Directory**: `backend`
4. **Start Command**: `npm start`
5. **Add same environment variables** as above
6. **Deploy** → Copy Railway URL
7. **Update Frontend** `VITE_API_BASE_URL` to Railway URL

---

## 📝 Checklist

- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Vercel (or Railway)
- [ ] Environment variables set correctly
- [ ] Frontend `VITE_API_BASE_URL` points to backend
- [ ] Backend `FRONTEND_URL` points to frontend
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Test `/api/health` endpoint works
- [ ] Test frontend loads correctly
- [ ] Test API calls from frontend work

---

## 🆘 Troubleshooting

**Build Fails:**
- Check Vercel build logs
- Verify `package.json` scripts are correct
- Ensure all dependencies are in `package.json`

**API Not Connecting:**
- Verify `VITE_API_BASE_URL` includes `/api` suffix
- Check CORS settings in backend
- Verify environment variables are set correctly

**Database Connection Fails:**
- Check MongoDB Atlas connection string
- Verify IP whitelist includes `0.0.0.0/0`
- Check database credentials

---

## 🎉 Done!

Your app should now be live! 🚀
