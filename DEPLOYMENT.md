# Deployment Checklist

## Pre-Deployment

### 1. Environment Variables Setup

**Backend (.env):**
```bash
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your-super-secret-jwt-key-change-this
ANTHROPIC_API_KEY=sk-ant-... # Optional, for AI features
REDIS_URL=redis://... # Optional, for caching
S3_REGION=us-east-1 # Optional, for uploads
S3_ACCESS_KEY_ID=... # Optional
S3_SECRET_ACCESS_KEY=... # Optional
S3_BUCKET_NAME=findmyai-uploads # Optional
```

**Frontend (.env.production):**
```bash
VITE_API_URL=https://your-backend-url.railway.app
```

### 2. Database Migration
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 3. Create Demo Admin User (if needed)
```bash
cd backend
npx ts-node scripts/create-demo-user.ts
```

## Deployment Options

### Option 1: Quick Deploy (Recommended)

#### Backend → Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize and deploy
cd backend
railway init
railway up

# Set environment variables in Railway dashboard
# Add all variables from .env
```

#### Frontend → Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd frontend
netlify deploy --prod
# When prompted:
# - Build command: npm run build
# - Publish directory: dist
```

### Option 2: GitHub Actions (Automated)

1. **Push to GitHub:**
```bash
git add .
git commit -m "feat: Complete FindMyAI platform"
git push origin main
```

2. **Configure GitHub Secrets:**
- Go to repo → Settings → Secrets and variables → Actions
- Add secrets:
  - `NETLIFY_AUTH_TOKEN`
  - `NETLIFY_SITE_ID`
  - `RAILWAY_TOKEN` (optional)

3. **Automatic Deployment:**
- GitHub Actions will automatically deploy on push to main
- Frontend → Netlify
- Backend → Railway (if configured)

### Option 3: Manual Build & Deploy

#### Frontend
```bash
cd frontend
npm run build

# Upload dist/ folder to:
# - Netlify drag-and-drop
# - Vercel CLI
# - AWS S3 + CloudFront
```

#### Backend
```bash
cd backend
npm run build

# Deploy dist/ to:
# - Railway
# - Render
# - AWS EC2/ECS
# - DigitalOcean App Platform
```

## Post-Deployment

### 1. Verify Deployment
```bash
# Check backend health
curl https://your-backend-url/health

# Check frontend
open https://your-frontend-url
```

### 2. Test Critical Flows
- [ ] Homepage loads
- [ ] Search works
- [ ] Tool details display
- [ ] Login works
- [ ] Admin dashboard accessible

### 3. Configure Custom Domain (Optional)

**Netlify:**
```bash
netlify domains:add yourdomain.com
```

**Railway:**
- Dashboard → Settings → Domains → Add custom domain

### 4. Setup Monitoring
- Enable Netlify Analytics
- Add Sentry for error tracking
- Configure uptime monitoring (UptimeRobot, Pingdom)

### 5. Schedule Trending Calculation

**Using Railway Cron:**
- Add to `railway.toml`:
```toml
[cron]
trending = "0 2 * * * cd backend && npx ts-node scripts/calculate-trending.ts"
```

**Using GitHub Actions:**
- Already configured in `.github/workflows/ci-cd.yml`
- Can add scheduled workflow

## Deployment Commands Reference

### Railway
```bash
railway status        # Check deployment status
railway logs          # View logs
railway variables     # List environment variables
railway open          # Open in browser
```

### Netlify
```bash
netlify status        # Check site status
netlify open          # Open in browser
netlify open:admin    # Open dashboard
netlify env:list      # List env vars
```

## Rollback

### Netlify
```bash
netlify rollback      # Rollback to previous deploy
```

### Railway
- Dashboard → Deployments → Select previous → Redeploy

## Troubleshooting

### Build Fails
- Check Node version (requires 18+)
- Clear build cache
- Verify all dependencies are in package.json

### API Not Connecting
- Verify VITE_API_URL in frontend
- Check CORS settings in backend
- Ensure backend is deployed and healthy

### Database Connection Fails
- Verify DATABASE_URL is correct
- Check database is accessible (not behind firewall)
- Run migrations: `npx prisma migrate deploy`

## URLs After Deployment

After deployment, your URLs will be:
- **Frontend:** https://findmyai.netlify.app (or custom domain)
- **Backend:** https://findmyai.railway.app (or custom domain)
- **Admin:** https://findmyai.netlify.app/admin

## Next Steps

1. Configure CDN for static assets
2. Set up automated backups for database
3. Configure SSL certificates (auto on Netlify/Railway)
4. Add analytics (Google Analytics, Plausible)
5. Set up error tracking (Sentry)
6. Configure CI/CD for staging environment
