# Render Deployment Checklist

## Before You Start
- [ ] GitHub repository pushed with latest code
- [ ] Firebase service account JSON file ready
- [ ] Neon PostgreSQL database URL ready
- [ ] Render account created (https://render.com)

## Deploy Backend (Web Service)

### 1. Create Web Service
- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository: `Jason3105/YugProperties`
- [ ] Configure service:
  - Name: `yug-properties-api`
  - Region: Singapore (closest to Mumbai)
  - Branch: `main`
  - Root Directory: `backend`
  - Runtime: `Node`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Instance: Free (or Starter for production)

### 2. Add Environment Variables
Click "Advanced" → Add these variables:

```
PORT=5000
NODE_ENV=production
BACKEND_URL=https://YOUR-BACKEND-URL.onrender.com
FRONTEND_URL=https://YOUR-FRONTEND-URL.onrender.com
DATABASE_URL=postgresql://neondb_owner:npg_RwBvl2rpDCY3@ep-weathered-sound-a1l48d09-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=YugProp$2024#SecureJWT!K3y@9x7mN5pQ8wR2vT4zL6hF3jD1aS0gB
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@yugproperties.co.in
ADMIN_PASSWORD=pArI123#
FIREBASE_SERVICE_ACCOUNT={"paste your entire firebase JSON here as single line"}
```

### 3. Firebase Service Account
- [ ] Open `backend/config/firebase-service-account.json`
- [ ] Copy entire JSON content
- [ ] Minify/compact it (remove newlines, make single line)
- [ ] Paste as value for `FIREBASE_SERVICE_ACCOUNT` environment variable

### 4. Deploy Backend
- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (5-10 minutes)
- [ ] Note your backend URL: `https://________.onrender.com`
- [ ] Test API: Visit `https://your-url.onrender.com/api/properties`

## Deploy Frontend (Static Site)

### 1. Update Environment URLs
- [ ] Copy your backend URL from previous step
- [ ] Open `frontend/.env.production` locally
- [ ] Update `REACT_APP_API_URL` with your backend URL
- [ ] Commit and push changes:
  ```bash
  git add frontend/.env.production
  git commit -m "Update production API URL"
  git push origin main
  ```

### 2. Create Static Site
- [ ] In Render, click "New +" → "Static Site"
- [ ] Select repository: `Jason3105/YugProperties`
- [ ] Configure:
  - Name: `yug-properties`
  - Branch: `main`
  - Root Directory: `frontend`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `build`

### 3. Add Frontend Environment Variables
Click "Advanced" → Add:
```
REACT_APP_API_URL=https://YOUR-BACKEND-URL.onrender.com
REACT_APP_SITE_URL=https://YOUR-FRONTEND-URL.onrender.com
NODE_VERSION=18
```

### 4. Deploy Frontend
- [ ] Click "Create Static Site"
- [ ] Wait for build (5-10 minutes)
- [ ] Note your frontend URL: `https://________.onrender.com`

## Post-Deployment

### 1. Update Backend CORS
- [ ] Go to backend service → "Environment"
- [ ] Update `FRONTEND_URL` with actual frontend URL
- [ ] Update `BACKEND_URL` with actual backend URL
- [ ] Save (auto-redeploys)

### 2. Test Everything
- [ ] Visit frontend URL
- [ ] Test signup/login
- [ ] Try viewing properties
- [ ] Test admin dashboard (if you're admin)
- [ ] Test file uploads (images/brochures)

### 3. Initialize Database (if needed)
If tables don't exist:
- [ ] Go to backend service → "Shell" tab
- [ ] Run: `node config/initDb.js`
- [ ] Run: `node migrations/createStorageHistoryTable.js`

### 4. Final Updates
- [ ] Update `frontend/public/index.html` meta tags with production URLs
- [ ] Update sitemap URLs
- [ ] Test all functionality end-to-end

## Optional: Custom Domain

### If you have a domain:
- [ ] Backend: Add `api.yugproperties.co.in`
- [ ] Frontend: Add `yugproperties.co.in`
- [ ] Configure DNS records as per Render instructions
- [ ] Update environment variables with custom domains

## Monitoring

- [ ] Check Render dashboard for any errors
- [ ] Monitor logs for both services
- [ ] Set up email notifications for downtime
- [ ] Test from mobile device

## Important Notes

⚠️ **Free Tier Limitations:**
- Services spin down after 15 min inactivity
- First request takes 30-60 seconds to wake up
- 750 hours/month free

💡 **For Production:**
- Consider upgrading to Starter plan ($7/month per service)
- No spin-down, better performance
- Custom domains included

## Quick Commands

```bash
# Commit and push changes
git add .
git commit -m "Update deployment configuration"
git push origin main

# Render will auto-deploy on push
```

## Troubleshooting

**Build fails?**
- Check logs in Render dashboard
- Verify all dependencies in package.json
- Check Node version compatibility

**Database connection error?**
- Verify DATABASE_URL is correct
- Check Neon DB is accessible
- Ensure SSL mode enabled

**Firebase error?**
- Verify FIREBASE_SERVICE_ACCOUNT is valid JSON
- Check Firebase Storage rules
- Test credentials locally first

**CORS error?**
- Update FRONTEND_URL in backend
- Check CORS settings in server.js
- Clear browser cache

---

## 🎉 Done!

Once everything is working:
1. Share the URLs with your team
2. Test thoroughly before going live
3. Consider upgrading to paid plan
4. Set up monitoring and analytics

**Frontend:** https://________.onrender.com
**Backend:** https://________.onrender.com

**Developed by:** The xDEVS Co
**Contact:** subhash@yugproperties.co.in
