import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// S3 Configuration
const s3Config = {
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
    // For MinIO or custom S3-compatible storage
    ...(process.env.S3_ENDPOINT && {
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
    }),
};

const s3Client = new S3Client(s3Config);

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'findmyai-uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
];

export interface SignedUploadRequest {
    fileName: string;
    fileType: string;
    fileSize: number;
}

export interface SignedUploadResponse {
    uploadUrl: string;
    fileKey: string;
    fileUrl: string;
}

/**
 * Validate file upload parameters
 */
export function validateUpload(request: SignedUploadRequest): string | null {
    // Validate file size
    if (request.fileSize > MAX_FILE_SIZE) {
        return `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(request.fileType)) {
        return `File type ${request.fileType} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`;
    }

    // Validate file name
    if (!request.fileName || request.fileName.length > 255) {
        return 'Invalid file name';
    }

    return null;
}

/**
 * Generate a signed URL for direct upload to S3
 */
export async function generateSignedUploadUrl(
    request: SignedUploadRequest,
    userId?: number
): Promise<SignedUploadResponse> {
    // Generate unique file key
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString('hex');
    const extension = request.fileName.split('.').pop();
    const sanitizedName = request.fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .substring(0, 50);

    const fileKey = userId
        ? `uploads/user-${userId}/${timestamp}-${randomId}-${sanitizedName}`
        : `uploads/public/${timestamp}-${randomId}-${sanitizedName}`;

    // Create S3 PUT command
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        ContentType: request.fileType,
        ContentLength: request.fileSize,
        // Add metadata
        Metadata: {
            'original-filename': request.fileName,
            'upload-timestamp': timestamp.toString(),
            ...(userId && { 'user-id': userId.toString() }),
        },
        // Set ACL for public read (adjust based on your security needs)
        // ACL: 'public-read',
    });

    // Generate signed URL (valid for 15 minutes)
    const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 900, // 15 minutes
    });

    // Construct public file URL
    const fileUrl = process.env.S3_ENDPOINT
        ? `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${fileKey}`
        : `https://${BUCKET_NAME}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`;

    return {
        uploadUrl,
        fileKey,
        fileUrl,
    };
}

/**
 * Get file extension from MIME type
 */
function getExtensionFromMimeType(mimeType: string): string {
    const map: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
    };
    return map[mimeType] || 'bin';
}
