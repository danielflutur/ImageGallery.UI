import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFabButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, startWith, catchError } from 'rxjs/operators';
import { Subject, of, combineLatest } from 'rxjs';
import { ImageService } from '../../../core/services/image.service';
import { ImageMetadata } from '../../../core/models/image-metadata.model';
import { ImageCardComponent } from '../../../shared/components/image-card/image-card.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-gallery-list',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatInputModule, 
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatFabButton,
    FormsModule,
    ImageCardComponent,
    LoadingComponent
  ],
  template: `
    <div class="gallery-container">
      <!-- Header -->
      <mat-toolbar color="primary" class="gallery-header">
        <span>Image Gallery</span>
        <div class="spacer"></div>
        <button mat-raised-button color="accent" (click)="navigateToUpload()">
          <mat-icon>add</mat-icon>
          Upload Image
        </button>
      </mat-toolbar>

      <!-- Search Bar -->
      <div class="search-container">
        <mat-form-field class="search-field">
          <mat-label>Search images by tags or text...</mat-label>
          <input matInput 
                 [(ngModel)]="searchTerm" 
                 (input)="onSearchInput($event)"
                 placeholder="e.g., nature, summer, party">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <app-loading message="Loading images..."></app-loading>
      }

      <!-- Images Grid -->
      @if (!isLoading && images.length > 0) {
        <div class="images-grid">
          @for (image of images; track image.id) {
            <app-image-card 
              [image]="image" 
              (cardClick)="viewImageDetails($event)">
            </app-image-card>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading && images.length === 0 && !searchTerm) {
        <div class="empty-state">
          <mat-icon class="empty-icon">photo_library</mat-icon>
          <h2>No images yet</h2>
          <p>Start by uploading your first image</p>
          <button mat-raised-button color="primary" (click)="navigateToUpload()">
            <mat-icon>add</mat-icon>
            Upload Your First Image
          </button>
        </div>
      }

      <!-- No Search Results -->
      @if (!isLoading && images.length === 0 && searchTerm) {
        <div class="empty-state">
          <mat-icon class="empty-icon">search_off</mat-icon>
          <h2>No results found</h2>
          <p>Try different keywords or check your spelling</p>
          <button mat-button (click)="clearSearch()">Clear Search</button>
        </div>
      }

      <!-- FAB for mobile -->
      <button mat-fab 
              color="primary" 
              class="fab-button"
              (click)="navigateToUpload()"
              aria-label="Upload image">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .gallery-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .gallery-header {
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .spacer {
      flex: 1;
    }

    .search-container {
      padding: 20px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(224, 224, 224, 0.3);
    }

    .search-field {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      display: block;
    }

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      padding: 24px;
      flex: 1;
      overflow-y: auto;
      justify-items: center;
      background: transparent;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 16px;
      text-align: center;
      flex: 1;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h2 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      color: #999;
    }

    .fab-button {
      position: fixed;
      bottom: 16px;
      right: 16px;
      z-index: 1000;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .images-grid {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 16px;
      }

      .gallery-header button {
        display: none;
      }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .images-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }
      
      .fab-button {
        display: none;
      }
    }

    @media (min-width: 1025px) {
      .fab-button {
        display: none;
      }
    }

    @media (min-width: 1200px) {
      .images-grid {
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 28px;
        padding: 32px;
      }
    }

    @media (min-width: 1600px) {
      .images-grid {
        max-width: 1400px;
        margin: 0 auto;
      }
    }
  `]
})
export class GalleryListComponent implements OnInit {
  private imageService = inject(ImageService);
  private router = inject(Router);
  private searchSubject = new Subject<string>();

  images: ImageMetadata[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;

  ngOnInit() {
    this.setupSearch();
    this.loadImages();
  }

  private setupSearch() {
    const searchStream$ = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.trim()) {
          return this.imageService.searchImages(term).pipe(
            catchError(error => {
              console.error('Search failed:', error);
              return of([]);
            })
          );
        } else {
          return this.imageService.getAllImages().pipe(
            catchError(error => {
              console.error('Failed to load images:', error);
              return of([]);
            })
          );
        }
      })
    );

    const initialLoad$ = this.imageService.getAllImages().pipe(
      catchError(error => {
        console.error('Failed to load images:', error);
        return of([]);
      })
    );

    // Combine initial load with search
    combineLatest([
      initialLoad$.pipe(startWith([])),
      searchStream$.pipe(startWith([]))
    ]).subscribe(([initialImages, searchImages]) => {
      this.images = this.searchTerm ? searchImages : initialImages;
      this.isLoading = false;
    });
  }

  private loadImages() {
    this.isLoading = true;
    this.imageService.getAllImages().pipe(
      catchError(error => {
        console.error('Failed to load images:', error);
        return of([]);
      })
    ).subscribe(images => {
      this.images = images;
      this.isLoading = false;
    });
  }

  onSearchInput(event: any) {
    this.searchTerm = event.target.value;
    this.searchSubject.next(this.searchTerm);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  viewImageDetails(image: ImageMetadata) {
    this.router.navigate(['/gallery', image.id]);
  }

  navigateToUpload() {
    this.router.navigate(['/upload']);
  }
}
