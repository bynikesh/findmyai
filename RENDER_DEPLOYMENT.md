# Render Deployment Guide

## Prerequisites

1. ✅ Code committed to Git
2. ✅ GitHub repository created and pushed
3. [ ] Render account: https://render.com (sign up with GitHub)

## Deployment Steps

### Step 1: Push to GitHub

If you haven't already:

```bash
# From project root
git remote add origin https://github.com/yourusername/findmyai.git
git push -u origin main
```

### Step 2: Deploy Backend to Render

1. **Go to Render Dashboard:** https://dashboard.render.com

2. **Click "New +" → "Web Service"**

3. **Connect Repository:**
   - Click "Connect account" to link GitHub
   - Select your `findmyai` repository
   - Click "Connect"

4. **Configure Backend Service:**
   ```
   Name: findmyai-backend
   Region: Oregon (US West) or nearest to you
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npx prisma generate && npm run build
   Start Command: npm start
   Instance Type: Free (or Starter $7/month for better performance)
   ```

5. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   **Required:**
   ```
   DATABASE_URL     → (Render will provide this after creating PostgreSQL)
   JWT_SECRET       → your-super-secret-jwt-key-change-this-to-something-random
   NODE_ENV         → production
   ```
   
   **Optional (for full features):**
   ```
   ANTHROPIC_API_KEY       → sk-ant-... (for AI features)
   REDIS_URL               → (will add after creating Redis)
   S3_REGION               → us-east-1
   S3_ACCESS_KEY_ID        → your-aws-key
   S3_SECRET_ACCESS_KEY    → your-aws-secret
   S3_BUCKET_NAME          → findmyai-uploads
   ```

6. **Create Database:**
   - Before clicking "Create Web Service", scroll down
   - Click "New PostgreSQL" (or create separately)
   - Name: `findmyai-db`
   - Database: `findmyai`
   - User: `findmyai_user`
   - Region: Same as web service
   - Plan: Free (or paid for production)
   - Click "Create Database"

7. **Link Database to Web Service:**
   - Copy the "Internal Database URL" from PostgreSQL dashboard
   - Paste it as `DATABASE_URL` environment variable
   - OR: Render will automatically link if created together

8. **Create Redis (Optional for caching):**
   - Dashboard → "New +" → "Redis"
   - Name: `findmyai-redis`
   - Plan: Free
   - Copy "Internal Redis URL"
   - Add as `REDIS_URL` environment variable

9. **Click "Create Web Service"**
   - Render will build and deploy (takes 5-10 minutes)
   - Wait for status to show "Live"

10. **Run Database Migrations:**
    - Go to your backend service
    - Click "Shell" tab
    - Run:
    ```bash
    npx prisma migrate deploy
    npx ts-node scripts/create-demo-user.ts
    ```

11. **Your Backend URL:**
    ```
    https://findmyai-backend.onrender.com
    ```

### Step 3: Deploy Frontend to Render

1. **Click "New +" → "Static Site"**

2. **Connect Same Repository:**
   - Select `findmyai` repository

3. **Configure Frontend:**
   ```
   Name: findmyai-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. **Add Environment Variables:**
   ```
   VITE_API_URL → https://findmyai-backend.onrender.com
   ```

5. **Click "Create Static Site"**
   - Build takes 3-5 minutes
   - Wait for "Live" status

6. **Your Frontend URL:**
   ```
   https://findmyai-frontend.onrender.com
   ```

### Step 4: Configure CORS (Important!)

After both services are deployed:

1. **Update Backend CORS:**
   - Go to backend service → Environment
   - Add environment variable:
   ```
   ALLOWED_ORIGINS → https://findmyai-frontend.onrender.com
   ```

2. **Update `backend/src/app.ts`** to use environment variable:
   ```typescript
   app.register(cors, {
       origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
   });
   ```

3. **Redeploy backend:**
   - Go to backend service
   - Click "Manual Deploy" → "Clear build cache & deploy"

## Post-Deployment Checklist

### ✅ Verify Deployment

1. **Test Backend:**
   ```bash
   curl https://findmyai-backend.onrender.com/health
   # Should return: {"status":"ok"}
   ```

2. **Test Frontend:**
   - Visit: https://findmyai-frontend.onrender.com
   - Homepage should load
   - Search should work
   - Login with `admin@findmyai.com` / `admin123`

3. **Test API Connection:**
   - On frontend, try searching tools
   - Check browser console for errors
   - Should see API calls to backend URL

### ⚙️ Configure Custom Domains (Optional)

**Frontend:**
1. Go to Static Site → Settings → Custom Domains
2. Click "Add Custom Domain"
3. Enter: `findmyai.com`
4. Add CNAME record in your DNS:
   ```
   CNAME   @   findmyai-frontend.onrender.com
   ```

**Backend:**
1. Go to Web Service → Settings → Custom Domains
2. Click "Add Custom Domain"
3. Enter: `api.findmyai.com`
4. Add CNAME record:
   ```
   CNAME   api   findmyai-backend.onrender.com
   ```

### 🔄 Setup Auto-Deploy

Render automatically deploys on git push to main!

**To trigger manual deploy:**
- Dashboard → Service → "Manual Deploy"

**To disable auto-deploy:**
- Settings → "Auto-Deploy" → Toggle off

### 📊 Monitoring

**View Logs:**
- Dashboard → Service → "Logs" tab
- Real-time logs for debugging

**Metrics:**
- Dashboard → Service → "Metrics" tab
- CPU, Memory, Bandwidth usage

**Alerts:**
- Settings → "Notifications"
- Email alerts for failures

## Render Plans & Pricing

### Free Tier (Perfect for Testing)
- **Web Services:** Sleep after 15 min inactivity, resumes on request (~30s)
- **Static Sites:** Always on
- **PostgreSQL:** 90 days, then expires (upgrade to paid)
- **Redis:** 90 days

### Starter Tier ($7-21/month)
- **Web Services:** Always on, faster builds
- **PostgreSQL:** $7/month (1GB storage)
- **Redis:** $10/month (25MB)

## Troubleshooting

### Build Fails

**Check Node Version:**
Add to `backend/.node-version` or `render.yaml`:
```
18.x
```

**Clear Build Cache:**
- Service → Manual Deploy → "Clear build cache & deploy"

### Database Connection Issues

**Verify DATABASE_URL:**
- Should be Internal URL (not External)
- Format: `postgresql://user:pass@host/db`

**Run Migrations:**
```bash
# In Shell tab
npx prisma migrate deploy
npx prisma generate
```

### Frontend Shows 404 for Routes

**Add Rewrite Rule:**
In Render static site settings → Redirects/Rewrites:
```
Source: /*
Destination: /index.html
Action: Rewrite
```

### API Returns CORS Error

**Update CORS in backend:**
```typescript
app.register(cors, {
    origin: ['https://findmyai-frontend.onrender.com', 'http://localhost:5173'],
    credentials: true,
});
```

### Free Tier Sleep Issues

**Solutions:**
1. Upgrade to Starter plan ($7/month)
2. Use uptime monitor (UptimeRobot) to ping every 5 min
3. Accept 30s cold start on first request

## Advanced: render.yaml Configuration

Create `render.yaml` in project root for infrastructure-as-code:

```yaml
services:
  # Backend
  - type: web
    name: findmyai-backend
    env: node
    region: oregon
    plan: free
    buildCommand: cd backend && npm install && npx prisma generate && npm run build
    startCommand: cd backend && npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: findmyai-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: NODE_ENV
        value: production

  # Frontend
  - type: web
    name: findmyai-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/dist
    envVars:
      - key: VITE_API_URL
        value: https://findmyai-backend.onrender.com

databases:
  - name: findmyai-db
    databaseName: findmyai
    user: findmyai_user
    plan: free
```

## Scheduled Jobs (Trending Calculation)

**Option 1: Render Cron Jobs (Paid)**
- Dashboard → "New +" → "Cron Job"
- Schedule: `0 2 * * *` (daily at 2 AM)
- Command: `cd backend && npx ts-node scripts/calculate-trending.ts`

**Option 2: GitHub Actions**
Already configured in `.github/workflows/ci-cd.yml`!

**Option 3: External CRON Service**
- Use cron-job.org
- Hit endpoint: `https://findmyai-backend.onrender.com/api/admin/calculate-trending`
- Create this endpoint that requires admin auth

## Environment Variables Reference

### Backend (Web Service)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | ✅ | postgresql://... | From Render PostgreSQL |
| JWT_SECRET | ✅ | random-secret-key | For JWT auth |
| NODE_ENV | ✅ | production | Environment |
| ANTHROPIC_API_KEY | ⚪ | sk-ant-... | For AI features |
| REDIS_URL | ⚪ | redis://... | For caching |
| S3_REGION | ⚪ | us-east-1 | For uploads |
| S3_ACCESS_KEY_ID | ⚪ | AKIA... | AWS access key |
| S3_SECRET_ACCESS_KEY | ⚪ | secret | AWS secret |
| S3_BUCKET_NAME | ⚪ | findmyai | S3 bucket |
| ALLOWED_ORIGINS | ⚪ | https://... | CORS origins |

### Frontend (Static Site)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| VITE_API_URL | ✅ | https://findmyai-backend.onrender.com | Backend URL |

## Success! 🎉

Your URLs:
- **Frontend:** https://findmyai-frontend.onrender.com
- **Backend:** https://findmyai-backend.onrender.com/health
- **Admin:** https://findmyai-frontend.onrender.com/admin

Login with: `admin@findmyai.com` / `admin123`

## Next Steps

1. ✅ Test all features work
2. ✅ Add custom domain
3. ✅ Configure monitoring
4. ✅ Set up backups for database
5. ✅ Upgrade from free tier if needed
6. ✅ Add analytics (Google Analytics, Plausible)
7. ✅ Set up error tracking (Sentry)
