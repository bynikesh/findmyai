import { useState } from 'react';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { apiUrl } from 'lib/constants';

interface ImageUploadProps {
    onUploadComplete?: (fileUrl: string) => void;
    maxSizeMB?: number;
}

export default function ImageUpload({ onUploadComplete, maxSizeMB = 5 }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setProgress(0);

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Please upload a JPG, PNG, WebP, or GIF image.');
            return;
        }

        // Validate file size
        const maxSize = maxSizeMB * 1024 * 1024;
        if (file.size > maxSize) {
            setError(`File size exceeds ${maxSizeMB}MB limit.`);
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);

        // Start upload
        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        setUploading(true);

        try {
            // Step 1: Get signed upload URL from backend
            setProgress(10);
            const token = localStorage.getItem('token');
            const signRes = await fetch(`${apiUrl}/api/uploads/sign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                }),
            });

            if (!signRes.ok) {
                const errorData = await signRes.json();
                throw new Error(errorData.error || 'Failed to get upload URL');
            }

            const { data } = await signRes.json();
            const { uploadUrl, fileUrl } = data;

            // Step 2: Upload file directly to S3 using signed URL
            setProgress(30);
            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type,
                },
                body: file,
            });

            if (!uploadRes.ok) {
                throw new Error('Failed to upload file to storage');
            }

            setProgress(100);
            setUploadedUrl(fileUrl);

            // Notify parent component
            if (onUploadComplete) {
                onUploadComplete(fileUrl);
            }

            // Success feedback
            setTimeout(() => {
                setProgress(0);
                setUploading(false);
            }, 1000);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Upload failed. Please try again.');
            setUploading(false);
            setProgress(0);
        }
    };

    const clearUpload = () => {
        setPreview(null);
        setUploadedUrl(null);
        setError(null);
        setProgress(0);
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            {!preview && !uploadedUrl && (
                <div className="flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
                    <div className="text-center">
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                            <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                            >
                                <span>Upload a file</span>
                                <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                    className="sr-only"
                                    onChange={handleFileSelect}
                                    disabled={uploading}
                                />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF, WebP up to {maxSizeMB}MB</p>
                    </div>
                </div>
            )}

            {/* Preview */}
            {(preview || uploadedUrl) && (
                <div className="relative">
                    <img
                        src={preview || uploadedUrl || ''}
                        alt="Upload preview"
                        className="h-64 w-full rounded-lg object-cover"
                    />
                    <button
                        onClick={clearUpload}
                        className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Progress */}
            {uploading && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Uploading...</span>
                        <span className="text-gray-500">{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Success */}
            {uploadedUrl && !uploading && (
                <div className="rounded-md bg-green-50 p-4">
                    <p className="text-sm text-green-800">Upload successful!</p>
                    <p className="mt-1 text-xs text-green-700 break-all">{uploadedUrl}</p>
                </div>
            )}
        </div>
    );
}
