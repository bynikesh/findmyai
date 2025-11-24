# S3/MinIO Upload Configuration Guide

## Environment Variables

Add these to your `backend/.env` file:

```env
# AWS S3 Configuration
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key-here
S3_SECRET_ACCESS_KEY=your-secret-key-here
S3_BUCKET_NAME=findmyai-uploads

# For MinIO or other S3-compatible storage (optional)
# S3_ENDPOINT=http://localhost:9000
```

## AWS S3 Setup

### 1. Create S3 Bucket

```bash
aws s3 mb s3://findmyai-uploads --region us-east-1
```

### 2. S3 Bucket Policy

Apply this policy to allow public read access to uploaded files:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::findmyai-uploads/*"
    }
  ]
}
```

**To apply:**
```bash
aws s3api put-bucket-policy \
  --bucket findmyai-uploads \
  --policy file://bucket-policy.json
```

### 3. CORS Configuration

Allow browser uploads with this CORS policy:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://yourdomain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

**To apply:**
```bash
aws s3api put-bucket-cors \
  --bucket findmyai-uploads \
  --cors-configuration file://cors-policy.json
```

### 4. Block Public Access Settings

Disable "Block all public access" for the bucket to allow the bucket policy to work:

```bash
aws s3api put-public-access-block \
  --bucket findmyai-uploads \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

## IAM User Policy

Create an IAM user with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::findmyai-uploads/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::findmyai-uploads"
    }
  ]
}
```

## MinIO Setup (Alternative)

For local development or self-hosted storage:

### 1. Run MinIO with Docker

```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  -v ~/minio/data:/data \
  minio/minio server /data --console-address ":9001"
```

### 2. Create Bucket via MinIO Console

1. Open http://localhost:9001
2. Login with `minioadmin` / `minioadmin`
3. Create bucket named `findmyai-uploads`
4. Set access policy to "public" or configure custom policy

### 3. Environment Variables for MinIO

```env
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=findmyai-uploads
S3_ENDPOINT=http://localhost:9000
```

## Upload Flow

### Backend (Server-Side Signing)

```typescript
// 1. Client requests signed URL
POST /api/uploads/sign
{
  "fileName": "logo.png",
  "fileType": "image/png",
  "fileSize": 12345
}

// 2. Server validates and generates signed URL
Response: {
  "uploadUrl": "https://s3.amazonaws.com/...",
  "fileKey": "uploads/user-1/123-abc-logo.png",
  "fileUrl": "https://findmyai-uploads.s3.amazonaws.com/uploads/user-1/123-abc-logo.png"
}
```

### Client (Direct S3 Upload)

```typescript
// 3. Client uploads directly to S3
PUT <uploadUrl>
Headers: { 'Content-Type': 'image/png' }
Body: <file binary data>

// 4. Client saves fileUrl to database or uses in submission
```

## Security Best Practices

1. **Rate Limiting**: Already implemented (10 requests/minute)
2. **File Size Validation**: Max 5MB enforced
3. **MIME Type Validation**: Only image types allowed
4. **Signed URL Expiry**: 15 minutes (configurable)
5. **User Tracking**: File keys include user ID when authenticated
6. **Content-Type Header**: Required for upload integrity

## Monitoring & Cleanup

### CloudWatch Metrics (AWS)
- Monitor S3 bucket size
- Track request rates
- Set up alarms for unusual activity

### Lifecycle Policy (Optional)
Delete old uploads after 90 days:

```json
{
  "Rules": [
    {
      "Id": "DeleteOldUploads",
      "Status": "Enabled",
      "Prefix": "uploads/",
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
```

## Troubleshooting

**"Missing credentials" error:**
- Verify S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY in `.env`
- Restart backend server after adding credentials

**"Access Denied" on upload:**
- Check bucket CORS configuration
- Verify bucket policy allows public reads
- Ensure IAM user has PutObject permission

**Upload succeeds but file not accessible:**
- Verify public read policy is applied
- Check "Block Public Access" settings
- Ensure file URL matches bucket region

## Production Checklist

- [ ] S3 bucket created in production AWS account
- [ ] Bucket policy configured for public read
- [ ] CORS policy configured with production domain
- [ ] IAM user created with minimal permissions
- [ ] Environment variables set in production
- [ ] CloudWatch alarms configured
- [ ] Lifecycle policy for cleanup (optional)
- [ ] CDN (CloudFront) configured for performance (optional)
