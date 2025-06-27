import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { ImageMetadata } from '../../../core/models/image-metadata.model';

@Component({
  selector: 'app-image-card',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, MatIconModule, DatePipe],
  template: `
    <mat-card class="image-card" (click)="onCardClick()">
      <div class="image-container">
        @if (!imageError && image.sasUrl) {
          <img [src]="image.sasUrl" 
               [alt]="image.fileName" 
               class="image-thumbnail"
               (error)="onImageError()"
               (load)="onImageLoad()">
        } @else {
          <div class="image-placeholder">
            <mat-icon>broken_image</mat-icon>
            <span>Image unavailable</span>
          </div>
        }
      </div>
      <mat-card-content>
        <h3 class="image-title">{{ image.fileName }}</h3>
        <p class="upload-date">{{ image.uploadedAt | date:'short' }}</p>
        <div class="tags-container">
          @for (tag of displayTags; track tag) {
            <mat-chip>{{ tag }}</mat-chip>
          }
          @if (remainingTagsCount > 0) {
            <mat-chip class="more-tags">+{{ remainingTagsCount }} more</mat-chip>
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .image-card {
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      max-width: 350px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      background: white;
      border: none;
    }
    
    .image-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.2);
    }
    
    .image-container {
      position: relative;
      width: 100%;
      height: 250px;
      overflow: hidden;
    }
    
    .image-thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    .image-card:hover .image-thumbnail {
      transform: scale(1.05);
    }
    
    mat-card-content {
      padding: 20px !important;
      flex-shrink: 0;
    }
    
    .image-title {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.4;
    }
    
    .upload-date {
      margin: 0 0 16px 0;
      color: #757575;
      font-size: 0.875rem;
      font-weight: 400;
    }
    
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    mat-chip {
      font-size: 0.75rem;
      height: 28px;
      border-radius: 14px;
      background-color: #e8f4fd;
      color: #1565c0;
      border: 1px solid #bbdefb;
      font-weight: 500;
    }
    
    .more-tags {
      background-color: #f3e5f5;
      color: #7b1fa2;
      border: 1px solid #ce93d8;
    }
    
    .image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(45deg, #f5f5f5, #eeeeee);
      color: #999;
    }
    
    .image-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }
    
    .image-placeholder span {
      font-size: 0.875rem;
    }
  `]
})
export class ImageCardComponent {
  @Input({ required: true }) image!: ImageMetadata;
  @Input() maxTags: number = 3;
  @Output() cardClick = new EventEmitter<ImageMetadata>();
  
  imageError = false;

  get displayTags(): string[] {
    return this.image.tags.slice(0, this.maxTags);
  }

  get remainingTagsCount(): number {
    return Math.max(0, this.image.tags.length - this.maxTags);
  }

  onImageError(): void {
    this.imageError = true;
  }

  onImageLoad(): void {
    this.imageError = false;
  }

  onCardClick(): void {
    this.cardClick.emit(this.image);
  }
}
