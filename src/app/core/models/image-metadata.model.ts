export interface ImageMetadata {
  id: string;
  sasUrl: string;
  fileName: string;
  description: string;
  tags: string[];
  ocrText: string;
  uploadedAt: string;
}

export interface UploadRequest {
  file: File;
  description?: string;
}

export interface SearchResponse {
  images: ImageMetadata[];
}
