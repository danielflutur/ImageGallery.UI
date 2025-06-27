import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { catchError, of } from 'rxjs';
import { ImageService } from '../../../core/services/image.service';
import { ImageMetadata } from '../../../core/models/image-metadata.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-image-details',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    DatePipe,
    LoadingComponent
  ],
  template: `
    <div class="details-container">
      <!-- Header -->
      <mat-toolbar class="details-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Image Details</span>
      </mat-toolbar>

      <!-- Loading State -->
      @if (isLoading) {
        <app-loading message="Loading image details..."></app-loading>
      }

      <!-- Image Details -->
      @if (!isLoading && image) {
        <div class="details-content">
          <!-- Image Display -->
          <div class="image-section">
            @if (!imageError && image.sasUrl) {
              <img [src]="image.sasUrl" 
                   [alt]="image.fileName" 
                   class="full-image"
                   (error)="onImageError()"
                   (load)="onImageLoad()">
            } @else {
              <div class="image-placeholder">
                <mat-icon>broken_image</mat-icon>
                <h3>Image unavailable</h3>
                <p>The image could not be loaded. The access token may have expired.</p>
              </div>
            }
          </div>

          <!-- Metadata Section -->
          <div class="metadata-section">
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{ image.fileName }}</mat-card-title>
                <mat-card-subtitle>
                  Uploaded on {{ image.uploadedAt | date:'full' }}
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <!-- Description -->
                @if (image.description) {
                  <div class="metadata-item">
                    <h3>Description</h3>
                    <p>{{ image.description }}</p>
                  </div>
                }

                <!-- Tags -->
                @if (image.tags && image.tags.length > 0) {
                  <div class="metadata-item">
                    <h3>Tags</h3>
                    <div class="tags-container">
                      @for (tag of image.tags; track tag) {
                        <mat-chip>{{ tag }}</mat-chip>
                      }
                    </div>
                  </div>
                }

                <!-- OCR Text -->
                @if (image.ocrText) {
                  <div class="metadata-item">
                    <div class="ocr-header">
                      <h3>Detected Text</h3>
                      <button mat-stroked-button 
                              (click)="copyOcrText()" 
                              class="copy-button">
                        <mat-icon>content_copy</mat-icon>
                        Copy Text
                      </button>
                    </div>
                    <div class="ocr-text">{{ image.ocrText }}</div>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (!isLoading && !image) {
        <div class="error-state">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <h2>Image not found</h2>
          <p>The requested image could not be found.</p>
          <button mat-raised-button color="primary" (click)="goBack()">
            Go Back to Gallery
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .details-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .details-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: white;
      color: #333;
    }

    .details-content {
      flex: 1;
      overflow-y: auto;
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 0;
    }

    .image-section {
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .full-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .image-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999;
      text-align: center;
      padding: 48px 16px;
    }

    .image-placeholder mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .image-placeholder h3 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .image-placeholder p {
      margin: 0;
      color: #999;
      font-size: 0.9rem;
    }

    .metadata-section {
      background: #f5f5f5;
      padding: 16px;
      overflow-y: auto;
    }

    mat-card {
      height: fit-content;
    }

    .metadata-item {
      margin-bottom: 24px;
    }

    .metadata-item:last-child {
      margin-bottom: 0;
    }

    .metadata-item h3 {
      margin: 0 0 12px 0;
      font-size: 1.1rem;
      font-weight: 500;
      color: #333;
    }

    .metadata-item p {
      margin: 0;
      line-height: 1.5;
      color: #666;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .ocr-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .copy-button {
      min-width: auto;
    }

    .ocr-text {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 12px;
      font-family: monospace;
      font-size: 0.9rem;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 200px;
      overflow-y: auto;
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 16px;
      text-align: center;
      flex: 1;
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .error-state h2 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .error-state p {
      margin: 0 0 24px 0;
      color: #999;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .details-content {
        grid-template-columns: 1fr;
        grid-template-rows: 60vh auto;
      }

      .metadata-section {
        padding: 12px;
      }

      .image-section {
        padding: 12px;
      }
    }

    /* Tablet */
    @media (max-width: 1024px) and (min-width: 769px) {
      .details-content {
        grid-template-columns: 1fr 350px;
      }
    }
  `]
})
export class ImageDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private imageService = inject(ImageService);
  private snackBar = inject(MatSnackBar);

  image: ImageMetadata | null = null;
  isLoading: boolean = true;
  imageError = false;

  ngOnInit() {
    const imageId = this.route.snapshot.paramMap.get('id');
    if (imageId) {
      this.loadImageDetails(imageId);
    } else {
      this.isLoading = false;
    }
  }

  private loadImageDetails(id: string) {
    this.isLoading = true;
    this.imageService.getImageById(id).pipe(
      catchError(error => {
        console.error('Failed to load image details:', error);
        return of(null);
      })
    ).subscribe(image => {
      this.image = image;
      this.isLoading = false;
    });
  }

  copyOcrText() {
    if (this.image?.ocrText) {
      navigator.clipboard.writeText(this.image.ocrText).then(() => {
        this.snackBar.open('OCR text copied to clipboard', 'Close', {
          duration: 3000
        });
      }).catch(error => {
        console.error('Failed to copy text:', error);
        this.snackBar.open('Failed to copy text', 'Close', {
          duration: 3000
        });
      });
    }
  }

  onImageError(): void {
    this.imageError = true;
  }

  onImageLoad(): void {
    this.imageError = false;
  }

  goBack() {
    this.router.navigate(['/gallery']);
  }
}
