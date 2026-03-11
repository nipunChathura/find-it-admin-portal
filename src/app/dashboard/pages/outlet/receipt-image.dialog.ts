import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ReceiptImageDialogData {
  imageUrl: string;
}

@Component({
  selector: 'app-receipt-image-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Receipt</h2>
    <mat-dialog-content class="receipt-image-dialog__content">
      <div class="receipt-image-dialog__zoom-bar">
        <button mat-icon-button type="button" (click)="zoomOut()" [disabled]="zoomScale <= 0.5" aria-label="Zoom out">
          <mat-icon>zoom_out</mat-icon>
        </button>
        <span class="receipt-image-dialog__zoom-label">{{ zoomPercent }}%</span>
        <button mat-icon-button type="button" (click)="zoomIn()" [disabled]="zoomScale >= 3" aria-label="Zoom in">
          <mat-icon>zoom_in</mat-icon>
        </button>
      </div>
      <div class="receipt-image-dialog__img-wrap">
        <img
          [src]="data.imageUrl"
          alt="Receipt"
          class="receipt-image-dialog__img"
          [style.transform]="'scale(' + zoomScale + ')'"
        />
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button mat-dialog-close type="button">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .receipt-image-dialog__content { min-width: 400px; max-width: 95vw; }
    .receipt-image-dialog__zoom-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .receipt-image-dialog__zoom-label { min-width: 3.5rem; text-align: center; font-size: 0.875rem; }
    .receipt-image-dialog__img-wrap {
      overflow: auto;
      max-height: 70vh;
      text-align: center;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
      padding: 0.5rem;
    }
    .receipt-image-dialog__img {
      max-width: 100%;
      height: auto;
      object-fit: contain;
      border-radius: 4px;
      transform-origin: center top;
    }
  `],
})
export class ReceiptImageDialogComponent {
  readonly data: ReceiptImageDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ReceiptImageDialogComponent>);

  zoomScale = 1;
  readonly zoomStep = 0.25;
  readonly minZoom = 0.5;
  readonly maxZoom = 3;

  get zoomPercent(): number {
    return Math.round(this.zoomScale * 100);
  }

  zoomIn(): void {
    if (this.zoomScale < this.maxZoom) {
      this.zoomScale = Math.min(this.maxZoom, this.zoomScale + this.zoomStep);
    }
  }

  zoomOut(): void {
    if (this.zoomScale > this.minZoom) {
      this.zoomScale = Math.max(this.minZoom, this.zoomScale - this.zoomStep);
    }
  }
}
