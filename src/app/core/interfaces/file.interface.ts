export interface IFile {
  title: string;
  titleEng: string;
  location: string; // Legacy field - still used for local file fallback
  s3Key: string; // S3 key for file deletion and management
  cdnUrl: string; // CloudFront CDN URL for fast content delivery
  size: string;
  type: string;
  checksums: {
    etag: string; // S3 ETag for integrity verification
    sha256?: string; // Optional SHA256 hash for additional verification
  };
  metadata: {
    mimeType: string; // MIME type of the file
    dimensions?: {
      width: number;
      height: number;
    }; // For images and videos
    duration?: number; // For audio and video files (in seconds)
    compressionRatio?: number; // Compression ratio if processed
    originalSize?: number; // Original file size before processing
    processedSize?: number; // File size after compression/optimization
  };
  createdAt?: string; // Timestamp fields
  updatedAt?: string;
}
