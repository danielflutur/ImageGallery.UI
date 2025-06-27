import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/gallery',
    pathMatch: 'full'
  },
  {
    path: 'gallery',
    loadComponent: () => import('./features/gallery/gallery-list/gallery-list.component')
      .then(m => m.GalleryListComponent)
  },
  {
    path: 'gallery/:id',
    loadComponent: () => import('./features/gallery/image-details/image-details.component')
      .then(m => m.ImageDetailsComponent)
  },
  {
    path: 'upload',
    loadComponent: () => import('./features/upload/upload.component')
      .then(m => m.UploadComponent)
  },
  {
    path: '**',
    redirectTo: '/gallery'
  }
];
