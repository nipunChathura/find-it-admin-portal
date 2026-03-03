import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ViewItemRow } from '../../../core/api/admin-items.api';

export interface ItemDetailDialogData extends ViewItemRow {}

@Component({
  selector: 'app-item-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Item Details</h2>
    <mat-dialog-content class="item-detail-dialog__content">
      @if (data.itemImage) {
        <div class="item-detail-dialog__image-wrap">
          <img [src]="data.itemImage" alt="Item" class="item-detail-dialog__image" />
        </div>
      }
      <dl class="item-detail-dialog__details">
        <dt>ID</dt>
        <dd>{{ data.id }}</dd>
        <dt>Name</dt>
        <dd>{{ data.name }}</dd>
        <dt>Description</dt>
        <dd>{{ data.description || '—' }}</dd>
        <dt>Category</dt>
        <dd>{{ data.categoryName || '—' }}</dd>
        <dt>Outlet</dt>
        <dd>{{ data.outletName || '—' }}</dd>
        <dt>Price</dt>
        <dd>{{ data.price | number:'1.2-2' }}</dd>
        <dt>Status</dt>
        <dd>{{ data.status }}</dd>
        <dt>Availability</dt>
        <dd>{{ data.availability ? 'Yes' : 'No' }}</dd>
        <dt>Discount Available</dt>
        <dd>{{ data.discountAvailable ? 'Yes' : 'No' }}</dd>
      </dl>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button mat-dialog-close type="button">Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .item-detail-dialog__content { min-width: 320px; max-width: 480px; }
      .item-detail-dialog__image-wrap { margin-bottom: 1rem; text-align: center; }
      .item-detail-dialog__image { max-width: 100%; max-height: 240px; object-fit: contain; border-radius: 8px; }
      .item-detail-dialog__details { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 0.25rem 1.5rem; }
      .item-detail-dialog__details dt { font-weight: 600; color: var(--mat-sys-on-surface-variant); }
      .item-detail-dialog__details dd { margin: 0; }
      mat-dialog-actions { padding-top: 0.5rem; }
    `,
  ],
})
export class ItemDetailDialogComponent {
  readonly data: ItemDetailDialogData = inject(MAT_DIALOG_DATA);
}
