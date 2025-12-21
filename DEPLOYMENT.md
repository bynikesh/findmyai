# Deployment Guide - Railway

## Pre-Deployment

### 1. Environment Variables

**Backend:**
```bash
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
PORT=3000

# Optional
ANTHROPIC_API_KEY=sk-ant-...      # For AI features
REDIS_URL=redis://...              # For caching
S3_REGION=us-east-1               # For uploads
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=findmyai-uploads
```

**Frontend:**
```bash
VITE_API_URL=https://your-backend.railway.app
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add **Authorized JavaScript origins**:
   - `http://localhost:5173` (local development)
   - `https://findmyai.xyz` (production domain)
7. Copy the **Client ID** and add to Railway as `VITE_GOOGLE_CLIENT_ID`

---

## Deploy to Railway

### Option 1: Railway Dashboard (Recommended)

1. Go to [Railway](https://railway.app/)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Railway will auto-detect the monorepo structure

**Create two services:**

**Backend Service:**
- Root Directory: `backend`
- Build Command: `npm install && npx prisma generate && npm run build`
- Start Command: `npm start`
- Add environment variables (see above)

**Frontend Service:**
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Start Command: `npx serve dist -s`
- Add environment variables (see above)

**Database:**
- Click **+ New** → **Database** → **PostgreSQL**
- Copy connection string to backend's `DATABASE_URL`

### Option 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy backend
cd backend
railway up

# Deploy frontend
cd ../frontend
railway up
```

---

## Post-Deployment

### 1. Verify Deployment
```bash
# Check backend health
curl https://your-backend.railway.app/health

# Visit frontend
open https://your-frontend.railway.app
```

### 2. Test Critical Flows
- [ ] Homepage loads
- [ ] Search works
- [ ] Tool details display
- [ ] Google login works
- [ ] Favorites work (add/remove)
- [ ] Admin dashboard accessible

### 3. Configure Custom Domain

In Railway Dashboard:
1. Select your service
2. Go to **Settings** → **Domains**
3. Click **Add Custom Domain**
4. Add DNS records as instructed

---

## Railway Commands Reference

```bash
railway status        # Check deployment status
railway logs          # View logs
railway variables     # List environment variables
railway open          # Open in browser
railway up            # Deploy current directory
```

---

## Troubleshooting

### Build Fails
- Check Node version (requires 18+)
- Verify all dependencies are in package.json
- Run `npx prisma generate` before build

### API Not Connecting
- Verify `VITE_API_URL` in frontend points to backend
- Check CORS settings in backend
- Ensure backend is deployed and healthy

### Database Connection Fails
- Verify `DATABASE_URL` is correct
- Run migrations: `npx prisma migrate deploy`
- Check database is accessible

### Google Login Not Working
- Verify `VITE_GOOGLE_CLIENT_ID` is set correctly
- Check authorized origins in Google Cloud Console
- Ensure production domain is added

---

## URLs After Deployment

- **Frontend:** `https://findmyai.xyz` (or Railway URL)
- **Backend API:** `https://api.findmyai.xyz` (or Railway URL)
- **Admin:** `https://findmyai.xyz/admin`
