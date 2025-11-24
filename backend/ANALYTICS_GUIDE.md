# Analytics and Trending System

## Overview

A comprehensive analytics system to track views, calculate trending scores, and provide admin insights into platform performance.

## View Tracking

### POST `/api/tools/:id/view`

Record a view event for a tool.

**Request:**
```json
{
  "sessionId": "user-session-123" // optional
}
```

**Usage:**
Call this endpoint when a user views a tool detail page. Session IDs help prevent duplicate counting.

**Example:**
```javascript
// In ToolDetail component
useEffect(() => {
  fetch(`/api/tools/${toolId}/view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: localStorage.getItem('sessionId') })
  });
}, [toolId]);
```

## Trending Score Calculation

### Script: `scripts/calculate-trending.ts`

**Formula:**
```
trending_score = (views_last_7_days * 0.7) + (views_last_1_day * 0.3) + newness_boost

newness_boost = 50 if created within last 7 days, else 0
is_trending = true if trending_score >= 10
```

**Run manually:**
```bash
cd backend
npm run calculate-trending
```

**Recommended Schedule:**
Run this script every day using a cron job or scheduler:

```bash
# Cron example: Run daily at 2 AM
0 2 * * * cd /path/to/backend && npm run calculate-trending
```

**Using node-cron (optional):**
```typescript
import cron from 'node-cron';
import { calculateTrendingScores } from './scripts/calculate-trending';

// Run every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running trending calculation...');
  await calculateTrendingScores();
});
```

## Analytics API Endpoints

### GET `/api/analytics/overview` (Admin)

Platform-wide statistics.

**Response:**
```json
{
  "totals": {
    "tools": 150,
    "users": 1200,
    "reviews": 450,
    "views": 15000
  },
  "last7Days": {
    "newSignups": 35,
    "views": 3500
  }
}
```

### GET `/api/analytics/top-tools` (Admin)

Top tools by views in a time period.

**Query Params:**
- `limit` (default: 10) - Number of tools to return
- `days` (default: 7) - Time period in days

**Response:**
```json
[
  {
    "id": 1,
    "name": "ChatGPT",
    "slug": "chatgpt",
    "viewCount": 1500,
    "average_rating": 4.5,
    "review_count": 120
  }
]
```

### GET `/api/analytics/trending` (Public)

Get currently trending tools.

**Response:**
```json
[
  {
    "id": 5,
    "name": "GPT-4",
    "slug": "gpt-4",
    "description": "...",
    "trending_score": 85.6,
    "average_rating": 4.8
  }
]
```

### GET `/api/analytics/signups` (Admin)

Signup statistics over time.

**Query Params:**
- `days` (default: 30) - Number of days to include

**Response:**
```json
[
  { "date": "2024-01-01", "count": 12 },
  { "date": "2024-01-02", "count": 15 }
]
```

## Admin Analytics Dashboard

**Route:** `/admin/analytics`

Features:
- **Platform Totals:** Tools, users, reviews, views
- **7-Day Stats:** New signups, page views
- **Top Tools Table:** Ranked by views with ratings

## Database Schema Updates

### Tool Model

Added fields:
```prisma
model Tool {
  // ... existing fields
  trending_score Float?    @default(0)
  is_trending    Boolean   @default(false)
  
  @@index([trending_score])
  @@index([is_trending])
}
```

## Usage Examples

### Display Trending Tools on Homepage

```typescript
const [trending, setTrending] = useState([]);

useEffect(() => {
  fetch('/api/analytics/trending')
    .then(res => res.json())
    .then(data => setTrending(data));
}, []);
```

### Track Tool Views

```typescript
// In ToolDetail.tsx
useEffect(() => {
  const trackView = async () => {
    try {
      await fetch(`/api/tools/${id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getOrCreateSessionId()
        })
      });
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };
  
  trackView();
}, [id]);
```

## Performance Considerations

1. **View Tracking:** Uses simple INSERT, very fast
2. **Trending Calculation:** Can be slow with many tools - run during off-peak hours
3. **Analytics Queries:** Uses aggregations - consider caching results
4. **Indexes:** Added indexes on trending_score and is_trending for fast queries

## Monitoring

Track these metrics:
- Total views per day
- Number of trending tools
- Average trending score
- Query performance for analytics endpoints

## Future Enhancements

1. **Real-time Analytics:** Use WebSockets or Redis streams
2. **User Behavior Tracking:** Click-through rates, time on page
3. **A/B Testing:** Track conversion rates for different UI variants
4. **Export Reports:** CSV/PDF downloads of analytics data
5. **Alerts:** Notify admins when tools go viral or views drop
