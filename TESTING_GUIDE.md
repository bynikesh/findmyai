# FindMyAI Testing Guide

## Prerequisites

1. **Start the development servers:**
   ```bash
   # From project root
   npm run dev
   ```

   This starts:
   - Backend on `http://localhost:3000`
   - Frontend on `http://localhost:5173`

2. **Create demo admin user (if not done):**
   ```bash
   cd backend
   npx ts-node scripts/create-demo-user.ts
   ```

   Credentials: `admin@findmyai.com` / `admin123`

## Quick Test Script

Run the automated test suite:

```bash
cd backend
npx ts-node scripts/test-api.ts
```

This tests:
- ✓ S3 Upload flow
- ✓ Analytics endpoints
- ✓ AI chat endpoint
- ✓ Reviews system
- ✓ Auth system
- ✓ Admin analytics

## Manual Testing

### 1. Test S3 Uploads

**Option A: Using curl**

```bash
# Step 1: Get signed URL
curl -X POST http://localhost:3000/api/uploads/sign \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.png",
    "fileType": "image/png",
    "fileSize": 1024
  }'

# You'll get back:
# {
#   "uploadUrl": "https://s3.amazonaws.com/...",
#   "fileUrl": "https://bucket.s3.amazonaws.com/..."
# }

# Step 2: Upload file to the signed URL
# curl -X PUT "<uploadUrl>" \
#   -H "Content-Type: image/png" \
#   --data-binary @/path/to/your/image.png
```

**Option B: Using the frontend**

1. Open `http://localhost:5173`
2. Use the `<ImageUpload />` component
3. Drag and drop an image
4. Monitor the upload progress

**Expected Results:**
- Without S3 configured: "Upload service is not configured" error
- With S3 configured: Upload progress → Success with file URL

### 2. Test Analytics

**Record a view:**
```bash
curl -X POST http://localhost:3000/api/tools/1/view \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-123"}'
```

**Get trending tools:**
```bash
curl http://localhost:3000/api/analytics/trending
```

**Calculate trending scores:**
```bash
cd backend
npx ts-node scripts/calculate-trending.ts
```

### 3. Test Reviews

**Get reviews:**
```bash
curl http://localhost:3000/api/tools/1/reviews?page=1&perPage=5
```

**Submit review (requires auth):**
```bash
# First login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@findmyai.com","password":"admin123"}' \
  | jq -r '.token')

# Then submit review
curl -X POST http://localhost:3000/api/tools/1/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "rating": 5,
    "title": "Great tool!",
    "body": "Really helpful for my workflow"
  }'
```

### 4. Test AI Endpoints

**AI Chat:**
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test",
    "messages": [
      {"role": "user", "content": "I need a tool for writing"}
    ]
  }'
```

**AI Summary:**
```bash
curl -X POST http://localhost:3000/api/ai/summary \
  -H "Content-Type: application/json" \
  -d '{
    "toolData": {
      "name": "ChatGPT",
      "description": "AI chatbot"
    }
  }'
```

**AI Compare:**
```bash
curl -X POST http://localhost:3000/api/ai/compare \
  -H "Content-Type: application/json" \
  -d '{
    "toolIds": [1, 2, 3],
    "focus": "best for speed"
  }'
```

### 5. Test Admin Features

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@findmyai.com","password":"admin123"}'
```

**Get admin analytics:**
```bash
TOKEN="<your-token-here>"

curl http://localhost:3000/api/analytics/overview \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:3000/api/analytics/top-tools?limit=10&days=7 \
  -H "Authorization: Bearer $TOKEN"
```

**Get submissions:**
```bash
curl http://localhost:3000/api/admin/submissions \
  -H "Authorization: Bearer $TOKEN"
```

## Frontend Testing

### 1. Open the App
```
http://localhost:5173
```

### 2. Test User Flows

**Browse Tools:**
- Navigate to `/tools`
- Use search and filters
- Click on a tool to view details

**Submit a Tool:**
- Go to `/submit`
- Fill out the form
- Submit (requires login)

**Login:**
- Go to `/login`
- Use `admin@findmyai.com` / `admin123`
- Should redirect to admin dashboard

**Admin Dashboard:**
- After login, click "Admin" in header
- Should see `/admin` dashboard
- Navigate to Submissions (`/admin/submissions`)
- Navigate to Analytics (`/admin/analytics`)

**Reviews:**
- View tool detail page
- If logged in, submit a review
- See reviews list with pagination

**Chat Widget:**
- Click the blue chat bubble (bottom-right)
- Ask: "I need a tool for writing"
- Should get AI recommendations with tool cards

## Testing Configuration States

### Without S3 Configured
- Upload signing will fail with "Upload service not configured"
- Frontend upload component shows error

### Without Claude Configured
- AI endpoints return placeholder responses
- Chat shows: "Configure ANTHROPIC_API_KEY..."
- Summary shows: "Configure ANTHROPIC_API_KEY..."

### Without Redis Configured
- All endpoints work but without caching
- Console shows: "Redis not configured, running without cache"

## Database Testing

**View data:**
```bash
cd backend
npx prisma studio
```

Opens Prisma Studio at `http://localhost:5555` to browse:
- Tools
- Users
- Reviews
- Views
- Submissions

## Performance Testing

**Load test with Apache Bench:**
```bash
# Test tool list endpoint
ab -n 1000 -c 10 http://localhost:3000/api/tools

# Test view tracking (POST)
ab -n 1000 -c 10 -p view.json -T application/json http://localhost:3000/api/tools/1/view

# view.json contains: {"sessionId": "test"}
```

## Troubleshooting

### Backend not starting
```bash
cd backend
npm run build
npm run dev
```

### Frontend not starting
```bash
cd frontend
npm install
npm run dev
```

### Tests failing
1. Ensure backend is running on port 3000
2. Check .env file has DATABASE_URL
3. Run migrations: `cd backend && npx prisma migrate dev`
4. Generate Prisma client: `npx prisma generate`

### S3 uploads failing
1. Check S3_ACCESS_KEY_ID in `.env`
2. Verify bucket exists and CORS is configured
3. See `backend/S3_SETUP_GUIDE.md`

### AI endpoints not working
1. Check ANTHROPIC_API_KEY in `.env`
2. Verify API key is valid
3. See `backend/CLAUDE_AI_INTEGRATION.md`

## Success Indicators

✓ All tests pass in test-api.ts
✓ Frontend loads without errors
✓ Login works and redirects to admin dashboard
✓ Tools can be browsed and filtered
✓ Reviews can be submitted and viewed
✓ Chat widget responds with recommendations
✓ Admin analytics shows real data
✓ Trending calculation runs without errors

## Next Steps

1. **Configure S3** (optional for development)
2. **Configure Claude API** (for AI features)
3. **Set up Redis** (for caching)
4. **Schedule trending calculation** (cron job)
5. **Deploy to production** (see deployment docs)
