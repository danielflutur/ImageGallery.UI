# AI-Powered Image Gallery - Frontend

A modern Angular application for uploading, viewing, and searching images with AI-generated tags and OCR text extraction.

## Features

- 📸 **Image Upload**: Drag & drop or click to upload images with optional descriptions
- 🔍 **Smart Search**: Search through images using AI-generated tags and OCR text
- 🖼️ **Gallery View**: Responsive grid layout with image cards showing thumbnails, tags, and metadata
- 📱 **Responsive Design**: Mobile-first design that works on all screen sizes
- 🎨 **Modern UI**: Built with Angular Material for a clean, professional interface
- 🔍 **Image Details**: Full-size image view with complete metadata, tags, and OCR text
- 📋 **Copy OCR Text**: One-click copy functionality for detected text

## Technology Stack

- **Angular 20** (Latest LTS) with standalone components
- **Angular Material** for UI components
- **Angular SSR** for server-side rendering
- **TypeScript** for type safety
- **SCSS** for styling
- **RxJS** for reactive programming

## Project Structure

```
src/
├── app/
│   ├── core/                    # Core services and models
│   │   ├── models/             # TypeScript interfaces and models
│   │   └── services/           # API services
│   ├── shared/                 # Reusable components
│   │   └── components/         # Shared UI components
│   ├── features/               # Feature modules
│   │   ├── gallery/           # Gallery feature (list, details)
│   │   └── upload/            # Upload feature
│   ├── app.routes.ts          # Application routing
│   └── app.config.ts          # Application configuration
└── styles.scss               # Global styles
```

## Getting Started

### Prerequisites

- Node.js (20.x or 22.x LTS recommended)
- npm 8.x or later
- Angular CLI 20.x

### Installation

1. Navigate to the project directory:
   ```bash
   cd image-gallery-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure API endpoint:
   - Update the `apiUrl` in `src/app/core/services/image.service.ts`
   - Default: `https://localhost:5001/api/image`

### Development

Start the development server:
```bash
ng serve
```

The application will be available at `http://localhost:4200/`.

### Building

Build for production:
```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## API Integration

The application expects a backend API with the following endpoints:

### Upload Image
- **POST** `/api/image/upload`
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (required), `description` (optional)

### Get All Images
- **GET** `/api/image/all`
- **Response**: Array of `ImageMetadata` objects

### Get Image by ID
- **GET** `/api/image/{id}`
- **Response**: Single `ImageMetadata` object

### Search Images
- **GET** `/api/image/search?term={searchTerm}`
- **Response**: Array of matching `ImageMetadata` objects

### ImageMetadata Model
```typescript
interface ImageMetadata {
  id: string;
  blobUrl: string;
  fileName: string;
  description: string;
  tags: string[];
  ocrText: string;
  uploadedAt: string;
}
```

## Features Overview

### Gallery View
- Responsive grid layout (1-4 columns based on screen size)
- Image cards with thumbnails, file names, upload dates, and key tags
- Search functionality with real-time filtering
- Empty state for new users
- "No results" state for unsuccessful searches

### Upload View
- Drag & drop upload area
- File picker fallback
- Image preview before upload
- Optional description field
- Upload progress indicator
- Success confirmation with navigation options

### Image Details View
- Full-size image display
- Complete metadata including:
  - File name and upload date
  - User description
  - AI-generated tags as chips
  - OCR text with copy functionality
- Responsive layout (side-by-side on desktop, stacked on mobile)

## Responsive Design

- **Mobile (≤768px)**: Single column layout, FAB for upload
- **Tablet (769px-1024px)**: Two-column gallery grid
- **Desktop (≥1025px)**: 3-4 column gallery grid, header upload button

## Error Handling

- Network error handling with user-friendly messages
- Loading states for all async operations
- Graceful degradation when backend is unavailable
- Form validation for upload requirements

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast support

## Development Notes

- Uses Angular's new standalone components architecture
- Implements lazy loading for feature routes
- Uses Angular's new control flow (`@if`, `@for`) instead of structural directives
- Server-side rendering configured for performance
- Material Design 3 components

## Backend Integration

Make sure your backend API is running on `https://localhost:5001` before testing the application. The frontend is designed to work with the AI-powered image processing backend as described in the implementation.md file.

## License

This project is licensed under the MIT License.
