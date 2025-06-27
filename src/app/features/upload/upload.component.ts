import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ImageService } from '../../core/services/image.service';
import { ImageMetadata } from '../../core/models/image-metadata.model';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSnackBarModule,
    FormsModule
  ],
  template: `
    <div class="upload-container">
      <!-- Header -->
      <mat-toolbar class="upload-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Upload Image</span>
      </mat-toolbar>

      <div class="upload-content">
        <mat-card class="upload-card">
          <mat-card-header>
            <mat-card-title>Add New Image</mat-card-title>
            <mat-card-subtitle>Upload an image to your gallery</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <!-- Upload Area -->
            <div class="upload-section">
              @if (!selectedFile) {
                <div class="drop-zone" 
                     (click)="fileInput.click()"
                     (dragover)="onDragOver($event)"
                     (dragleave)="onDragLeave($event)"
                     (drop)="onDrop($event)"
                     [class.drag-over]="isDragOver">
                  <mat-icon class="upload-icon">cloud_upload</mat-icon>
                  <h3>Drag & drop an image here</h3>
                  <p>or click to select a file</p>
                  <button mat-raised-button color="primary" type="button">
                    Choose Image
                  </button>
                </div>
              } @else {
                <!-- Image Preview -->
                <div class="preview-section">
                  <div class="image-preview">
                    <img [src]="imagePreview" [alt]="selectedFile.name" class="preview-image">
                    <button mat-icon-button 
                            class="remove-button" 
                            (click)="removeSelectedFile()"
                            type="button">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                  <div class="file-info">
                    <h4>{{ selectedFile.name }}</h4>
                    <p>{{ formatFileSize(selectedFile.size) }}</p>
                  </div>
                </div>
              }

              <input #fileInput 
                     type="file" 
                     accept="image/*" 
                     (change)="onFileSelected($event)"
                     style="display: none;">
            </div>

            <!-- Description Input -->
            @if (selectedFile) {
              <div class="description-section">
                <mat-form-field class="description-field">
                  <mat-label>Description (optional)</mat-label>
                  <textarea matInput 
                           [(ngModel)]="description"
                           placeholder="Describe your image..."
                           rows="3"></textarea>
                </mat-form-field>
              </div>
            }

            <!-- Upload Progress -->
            @if (isUploading) {
              <div class="progress-section">
                <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                <p class="progress-text">Uploading and processing your image...</p>
              </div>
            }

            <!-- Success Message -->
            @if (uploadedImage) {
              <div class="success-section">
                <mat-icon class="success-icon">check_circle</mat-icon>
                <h3>Upload Successful!</h3>
                <p>Your image has been uploaded and processed.</p>
                <div class="success-actions">
                  <button mat-raised-button 
                          color="primary" 
                          (click)="viewUploadedImage()">
                    View Image
                  </button>
                  <button mat-button (click)="uploadAnother()">
                    Upload Another
                  </button>
                </div>
              </div>
            }
          </mat-card-content>

          @if (selectedFile && !isUploading && !uploadedImage) {
            <mat-card-actions>
              <button mat-raised-button 
                      color="primary" 
                      (click)="uploadImage()"
                      [disabled]="!selectedFile">
                <mat-icon>upload</mat-icon>
                Upload Image
              </button>
              <button mat-button (click)="removeSelectedFile()">
                Cancel
              </button>
            </mat-card-actions>
          }
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .upload-header {
      background: white;
      color: #333;
    }

    .upload-content {
      flex: 1;
      padding: 24px;
      background: #f5f5f5;
      overflow-y: auto;
    }

    .upload-card {
      max-width: 600px;
      margin: 0 auto;
    }

    .upload-section {
      margin-bottom: 24px;
    }

    .drop-zone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 48px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .drop-zone:hover,
    .drop-zone.drag-over {
      border-color: #2196f3;
      background: #f0f8ff;
    }

    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .drop-zone h3 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .drop-zone p {
      margin: 0 0 24px 0;
      color: #999;
    }

    .preview-section {
      display: flex;
      gap: 16px;
      align-items: start;
    }

    .image-preview {
      position: relative;
      width: 150px;
      height: 150px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-button {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0,0,0,0.7);
      color: white;
    }

    .file-info {
      flex: 1;
    }

    .file-info h4 {
      margin: 0 0 8px 0;
      font-weight: 500;
    }

    .file-info p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .description-section {
      margin-bottom: 24px;
    }

    .description-field {
      width: 100%;
    }

    .progress-section {
      text-align: center;
      padding: 24px 0;
    }

    .progress-text {
      margin-top: 16px;
      color: #666;
    }

    .success-section {
      text-align: center;
      padding: 24px 0;
    }

    .success-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #4caf50;
      margin-bottom: 16px;
    }

    .success-section h3 {
      margin: 0 0 8px 0;
      color: #4caf50;
    }

    .success-section p {
      margin: 0 0 24px 0;
      color: #666;
    }

    .success-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .upload-content {
        padding: 16px;
      }

      .drop-zone {
        padding: 32px 16px;
      }

      .preview-section {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .success-actions {
        flex-direction: column;
      }
    }
  `]
})
export class UploadComponent {
  private router = inject(Router);
  private imageService = inject(ImageService);
  private snackBar = inject(MatSnackBar);

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  description: string = '';
  isUploading: boolean = false;
  uploadedImage: ImageMetadata | null = null;
  isDragOver: boolean = false;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processSelectedFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.processSelectedFile(file);
      } else {
        this.snackBar.open('Please select an image file', 'Close', {
          duration: 3000
        });
      }
    }
  }

  private processSelectedFile(file: File) {
    this.selectedFile = file;
    
    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeSelectedFile() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.description = '';
    this.uploadedImage = null;
  }

  uploadImage() {
    if (!this.selectedFile) {
      return;
    }

    this.isUploading = true;
    
    this.imageService.uploadImage({
      file: this.selectedFile,
      description: this.description.trim() || undefined
    }).pipe(
      catchError(error => {
        console.error('Upload failed:', error);
        this.snackBar.open('Upload failed. Please try again.', 'Close', {
          duration: 5000
        });
        return of(null);
      })
    ).subscribe((result: ImageMetadata | null) => {
      this.isUploading = false;
      if (result) {
        this.uploadedImage = result;
        this.snackBar.open('Image uploaded successfully!', 'Close', {
          duration: 3000
        });
      }
    });
  }

  viewUploadedImage() {
    if (this.uploadedImage) {
      this.router.navigate(['/gallery', this.uploadedImage.id]);
    }
  }

  uploadAnother() {
    this.removeSelectedFile();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  goBack() {
    this.router.navigate(['/gallery']);
  }
}
