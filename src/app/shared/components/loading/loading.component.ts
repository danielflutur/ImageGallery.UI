import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loading-container" [class.overlay]="overlay">
      <mat-spinner [diameter]="size" [strokeWidth]="strokeWidth"></mat-spinner>
      @if (message) {
        <p class="loading-message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      z-index: 1000;
    }
    
    .loading-message {
      margin-top: 1rem;
      color: #666;
      font-size: 0.9rem;
    }
  `]
})
export class LoadingComponent {
  @Input() size: number = 40;
  @Input() strokeWidth: number = 4;
  @Input() message?: string;
  @Input() overlay: boolean = false;
}
