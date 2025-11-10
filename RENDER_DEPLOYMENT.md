# Render Deployment Guide - Yug Properties

Complete step-by-step guide to deploy the Yug Properties platform on Render.

## 🚀 Overview

We'll deploy two services on Render:
1. **Backend (Web Service)** - Node.js API
2. **Frontend (Static Site)** - React application

## 📋 Prerequisites

- GitHub repository pushed (✅ Done)
- Render account (Sign up at https://render.com)
- PostgreSQL database on Neon (✅ Already configured)
- Firebase project with Storage enabled (✅ Already configured)

---

## Part 1: Deploy Backend (Web Service)

### Step 1: Create New Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select repository: `Jason3105/YugProperties`
5. Click **"Connect"**

### Step 2: Configure Web Service

**Basic Settings:**
- **Name:** `yug-properties-api` (or any name you prefer)
- **Region:** Choose closest to Mumbai (e.g., Singapore)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Select **Free** (for testing) or **Starter** ($7/month for production)

### Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add these:

```env
# Server Configuration
PORT=5000
NODE_ENV=production
BACKEND_URL=https://yug-properties-api.onrender.com
FRONTEND_URL=https://yug-properties.onrender.com

# Database Configuration (Your existing Neon DB)
DATABASE_URL=postgresql://neondb_owner:npg_RwBvl2rpDCY3@ep-weathered-sound-a1l48d09-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# JWT Secret (Keep your existing one)
JWT_SECRET=YugProp$2024#SecureJWT!K3y@9x7mN5pQ8wR2vT4zL6hF3jD1aS0gB
JWT_EXPIRE=7d

# Admin Credentials
ADMIN_EMAIL=admin@yugproperties.co.in
ADMIN_PASSWORD=pArI123#
```

**Important:** Replace `yug-properties-api.onrender.com` with your actual Render backend URL after deployment.

### Step 4: Add Firebase Service Account

**Option A: Environment Variable (Recommended)**
1. Open your `firebase-service-account.json` file locally
2. Copy the entire JSON content
3. In Render, add environment variable:
   - **Key:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** Paste the entire JSON (as a single line string)

**Option B: Secret File**
1. In Render dashboard, go to your service
2. Click **"Environment"** → **"Secret Files"**
3. Click **"Add Secret File"**
   - **Filename:** `firebase-service-account.json`
   - **Contents:** Paste your Firebase JSON

Then update `backend/services/firebaseStorage.js` to read from environment:
```javascript
// If using Option A
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require('../firebase-service-account.json');
```

### Step 5: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for the build to complete (5-10 minutes)
3. Once deployed, note your backend URL: `https://yug-properties-api.onrender.com`
4. Test the API: Visit `https://yug-properties-api.onrender.com/api/properties`

---

## Part 2: Deploy Frontend (Static Site)

### Step 1: Update Frontend Environment Variables

Before deploying frontend, update the API URL:

**Create `.env.production` in frontend folder:**
```env
REACT_APP_API_URL=https://yug-properties-api.onrender.com
REACT_APP_SITE_URL=https://yug-properties.onrender.com
```

Commit and push this change:
```bash
cd frontend
# Create .env.production with above content
cd ..
git add .
git commit -m "Add production environment configuration"
git push origin main
```

### Step 2: Create Static Site on Render

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Select repository: `Jason3105/YugProperties`
3. Click **"Connect"**

### Step 3: Configure Static Site

**Basic Settings:**
- **Name:** `yug-properties` (or any name)
- **Branch:** `main`
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `build`

**Environment Variables:**
- Click **"Advanced"** → **"Add Environment Variable"**

```env
REACT_APP_API_URL=https://yug-properties-api.onrender.com
REACT_APP_SITE_URL=https://yug-properties.onrender.com
NODE_VERSION=18
```

### Step 4: Deploy Frontend

1. Click **"Create Static Site"**
2. Wait for build to complete (5-10 minutes)
3. Once deployed, your site will be live at: `https://yug-properties.onrender.com`

---

## Part 3: Post-Deployment Configuration

### 1. Update Backend CORS

After getting your frontend URL, update the backend environment variable:
- Go to backend service → **"Environment"**
- Update `FRONTEND_URL` to your actual frontend URL
- Click **"Save Changes"** (service will auto-redeploy)

### 2. Test Database Connection

Visit your backend URL and check:
- `https://yug-properties-api.onrender.com/api/properties` - Should show properties
- Login functionality should work

### 3. Run Database Migrations (if needed)

If this is first deployment and tables don't exist:

**Option A: Using Render Shell**
1. Go to backend service → **"Shell"** tab
2. Run:
```bash
node config/initDb.js
node migrations/createStorageHistoryTable.js
```

**Option B: Connect via local terminal**
Use the Neon database URL from your .env file to run migrations locally.

### 4. Update SEO & Meta Tags

Update `frontend/public/index.html` with production URLs:
- Change all `https://yugproperties.co.in` references to your Render URL
- Or set up custom domain (see below)

---

## Part 4: Custom Domain Setup (Optional)

### For Backend API:
1. In backend service, go to **"Settings"** → **"Custom Domain"**
2. Add your domain: `api.yugproperties.co.in`
3. Follow DNS configuration instructions
4. Update environment variables with new domain

### For Frontend:
1. In static site, go to **"Settings"** → **"Custom Domain"**
2. Add your domain: `yugproperties.co.in`
3. Configure DNS:
   - Type: `CNAME`
   - Name: `@` or `www`
   - Value: Your Render URL

---

## 🔍 Troubleshooting

### Backend Issues:

**Build Fails:**
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

**Database Connection Error:**
- Verify `DATABASE_URL` is correct
- Check Neon database is accessible
- Ensure SSL mode is enabled

**Firebase Storage Error:**
- Verify Firebase service account is added correctly
- Check Firebase Storage rules allow read/write
- Test Firebase connection in logs

### Frontend Issues:

**Build Fails:**
- Check for TypeScript errors
- Ensure all dependencies are installed
- Verify `REACT_APP_API_URL` is set

**API Requests Fail:**
- Check CORS settings in backend
- Verify API URL is correct
- Check browser console for errors

**Images Not Loading:**
- Verify Firebase Storage URLs are accessible
- Check CORS configuration in Firebase

---

## 📊 Monitoring & Maintenance

### Free Tier Limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free (shared across services)

### Upgrade to Paid Plan ($7/month per service):
- No spin-down
- Better performance
- Custom domains included
- More memory/CPU

### Health Checks:
Render automatically monitors your services. Set up:
1. Health check endpoint: `/api/health` or `/api/properties`
2. Notification emails for downtime

---

## 🎉 Deployment Complete!

Your application should now be live at:
- **Frontend:** https://yug-properties.onrender.com
- **Backend API:** https://yug-properties-api.onrender.com

### Next Steps:
1. Test all functionality (login, property CRUD, file uploads)
2. Submit sitemap to Google Search Console
3. Set up analytics (Google Analytics)
4. Monitor performance and errors
5. Consider upgrading to paid plan for production use

---

## 📞 Support

If you encounter issues:
- Check Render documentation: https://render.com/docs
- View service logs in Render dashboard
- Contact Render support (very responsive!)

**Developed by:** The xDEVS Co
**Contact:** subhash@yugproperties.co.in
