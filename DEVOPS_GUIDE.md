# DevOps Setup Guide

## GitHub Actions CI/CD Pipeline

### Overview

Automated pipeline that runs on push to `main` and `develop` branches, plus all pull requests.

**Workflow File:** `.github/workflows/ci-cd.yml`

### Pipeline Stages

1. **Backend CI**
   - Install dependencies
   - Generate Prisma client
   - Lint code
   - Type check (TypeScript)
   - Build
   - Upload artifacts

2. **Frontend CI**
   - Install dependencies
   - Lint code
   - Type check (TypeScript)
   - Build
   - Upload artifacts

3. **E2E Tests (Cypress)**
   - Run after backend and frontend build
   - Start dev server
   - Execute Cypress tests in Chrome
   - Upload screenshots (on failure)
   - Upload videos (always)

4. **Deploy to Netlify** (main branch only)
   - Download frontend build artifacts
   - Deploy to Netlify
   - Comment deployment URL on commit

5. **Deploy Backend** (main branch only)
   - Auto-deploy via Railway/Render

## Required GitHub Secrets

Add these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Netlify Deployment
```
NETLIFY_AUTH_TOKEN=<your-netlify-auth-token>
NETLIFY_SITE_ID=<your-netlify-site-id>
```

Get these from:
1. Go to https://app.netlify.com
2. User Settings > Applications > Personal access tokens
3. Create new token for NETLIFY_AUTH_TOKEN
4. Site ID found in Site settings > General > Site details

### Backend Deployment (Optional)
```
RAILWAY_TOKEN=<your-railway-token>
RENDER_DEPLOY_HOOK=<your-render-deploy-hook-url>
```

### API Configuration (Optional)
```
VITE_API_URL=https://api.findmyai.com
TEST_DATABASE_URL=postgresql://...
CYPRESS_RECORD_KEY=<your-cypress-dashboard-key>
```

## Cypress E2E Tests

### Setup

Dependencies are installed via:
```bash
npm install --save-dev cypress @cypress/vite-dev-server
```

### Test Files

- **`cypress/e2e/tool-search-flow.cy.ts`** - Main test suite
  - Search and filter tools
  - View tool details
  - Submit reviews
  - Mobile responsiveness

- **`cypress/support/commands.ts`** - Custom commands
  - `cy.login(email, password)`
  - `cy.searchTools(query)`
  - `cy.selectCategory(name)`

### Running Tests Locally

**Headless mode (CI):**
```bash
cd frontend
npm run test:e2e
```

**Interactive mode (development):**
```bash
cd frontend
npm run test:e2e:headed
```

This opens the Cypress UI where you can:
- Select specific tests to run
- Watch tests execute in real-time
- Inspect DOM and network requests
- Debug test failures

### Test Data Requirements

For tests to pass, ensure:
1. Backend is running on `localhost:3000`
2. Frontend is running on `localhost:5173`
3. Database has at least 1 tool seeded
4. Demo admin user exists (`admin@findmyai.com` / `admin123`)

## Adding data-testid Attributes

To make tests reliable, add `data-testid` attributes to key elements:

**ToolCard component:**
```tsx
<div data-testid="tool-card">
  <h3 data-testid="tool-name">{tool.name}</h3>
  <p data-testid="tool-description">{tool.description}</p>
</div>
```

**ToolDetail page:**
```tsx
<div>
  <h1 data-testid="tool-title">{tool.name}</h1>
  <p data-testid="tool-description">{tool.description}</p>
  <a data-testid="tool-website" href={tool.website}>Visit</a>
  <span data-testid="tool-pricing">{tool.pricing}</span>
  
  <div data-testid="reviews-section">
    <span data-testid="average-rating">{tool.average_rating}</span>
    <span data-testid="review-count">{tool.review_count} reviews</span>
  </div>
  
  <div data-testid="screenshots-gallery">
    {tool.screenshots.map(src => (
      <img data-testid="screenshot-image" src={src} />
    ))}
  </div>
  
  <form data-testid="review-form">
    <div data-testid="star-rating">...</div>
  </form>
</div>
```

## Netlify Deployment

### Manual Setup

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Initialize site:**
   ```bash
   cd frontend
   netlify init
   ```

4. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: (leave empty)

5. **Set environment variables:**
   ```bash
   netlify env:set VITE_API_URL https://api.findmyai.com
   ```

### Automatic Deployment

Once GitHub secrets are configured, every push to `main` triggers:
1. Frontend build
2. Netlify deployment
3. Comment with deployment URL

### Preview Deployments

Pull requests automatically get preview deployments with unique URLs.

## Railway Backend Deployment

### Setup

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login:
   ```bash
   railway login
   ```

3. Initialize project:
   ```bash
   cd backend
   railway init
   ```

4. Set environment variables:
   ```bash
   railway variables set DATABASE_URL=postgresql://...
   railway variables set ANTHROPIC_API_KEY=sk-...
   railway variables set JWT_SECRET=your-secret
   railway variables set S3_ACCESS_KEY_ID=...
   railway variables set S3_SECRET_ACCESS_KEY=...
   railway variables set S3_BUCKET_NAME=findmyai-uploads
   ```

5. Deploy:
   ```bash
   railway up
   ```

Railway auto-deploys on every push to main branch.

## Render Backend Deployment

### Setup

1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Environment Variables: Add all from Railway list above

4. Get deploy hook:
   - Dashboard > Settings > Deploy Hooks
   - Copy URL and add to GitHub secrets as `RENDER_DEPLOY_HOOK`

## CI/CD Best Practices

### Branch Protection

Enable branch protection on `main`:
1. GitHub repo > Settings > Branches
2. Add rule for `main`
3. Enable:
   - Require pull request before merging
   - Require status checks to pass (select "Backend CI", "Frontend CI", "E2E Tests")
   - Require conversation resolution before merging

### Status Badges

Add status badge to README:

```markdown
![CI/CD](https://github.com/yourusername/findmyai/actions/workflows/ci-cd.yml/badge.svg)
```

### Scheduled Tests

Run tests daily even without code changes:

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
```

### Performance Budget

Add Lighthouse CI for performance monitoring:

```yaml
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      https://findmyai.netlify.app
    budgetPath: ./lighthouse-budget.json
```

## Monitoring

### Cypress Dashboard

Enable Cypress Dashboard for:
- Test recordings
- Failure analytics
- Parallel test runs

1. Sign up at https://dashboard.cypress.io
2. Get project ID and record key
3. Add `CYPRESS_RECORD_KEY` to GitHub secrets
4. Update workflow to enable recording

### Netlify Analytics

Enable analytics in Netlify dashboard to track:
- Page views
- Unique visitors
- Top pages
- Traffic sources

## Troubleshooting

### Tests Fail Locally But Pass in CI

- Clear Cypress cache: `npx cypress cache clear`
- Ensure same Node version: Check `.nvmrc` or specify in package.json
- Check for environment-specific code

### Deployment Fails

- Verify all secrets are set correctly
- Check build logs in GitHub Actions
- Ensure `dist` folder is generated during build

### Cypress Can't Find Elements

- Add explicit waits: `cy.wait(500)` or `cy.get(..., {timeout: 10000})`
- Use `data-testid` attributes instead of text or classes
- Check if element is in viewport: `cy.scrollIntoView()`

## Next Steps

1. Add unit tests with Vitest
2. Set up Sentry for error tracking
3. Add visual regression testing with Percy
4. Configure Dependabot for dependency updates
5. Add code coverage reporting
