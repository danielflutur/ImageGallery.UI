import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ImageMetadata, UploadRequest } from '../models/image-metadata.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Upload an image with optional description
   */
  uploadImage(uploadRequest: UploadRequest): Observable<ImageMetadata> {
    const formData = new FormData();
    formData.append('file', uploadRequest.file);
    if (uploadRequest.description) {
      formData.append('description', uploadRequest.description);
    }

    return this.http.post<ImageMetadata>(`${this.apiUrl}/upload`, formData);
  }

  /**
   * Get all images
   */
  getAllImages(): Observable<ImageMetadata[]> {
    return this.http.get<ImageMetadata[]>(`${this.apiUrl}/all`);
  }

  /**
   * Get image by ID
   */
  getImageById(id: string): Observable<ImageMetadata> {
    return this.http.get<ImageMetadata>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search images by term (tags or OCR text)
   */
  searchImages(term: string): Observable<ImageMetadata[]> {
    return this.http.get<ImageMetadata[]>(`${this.apiUrl}/search`, {
      params: { term }
    });
  }
}
