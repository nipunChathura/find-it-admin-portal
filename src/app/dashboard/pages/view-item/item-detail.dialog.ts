import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ViewItemRow } from '../../../core/api/admin-items.api';
import { ApiImageComponent } from '../../../shared/api-image/api-image.component';

export interface ItemDetailDialogData extends ViewItemRow {}

@Component({
  selector: 'app-item-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, ApiImageComponent],
  template: `
    <div class="item-detail-dialog">
      <h2 mat-dialog-title class="item-detail-dialog__title">Item Details</h2>
      <mat-dialog-content class="item-detail-dialog__content">
        <div class="item-detail-dialog__body">
          <div class="item-detail-dialog__left">
            @if (data.itemImage) {
              <div class="item-detail-dialog__image-wrap">
                <app-api-image type="item" [pathOrFileName]="data.itemImage" alt="Item" imgClass="item-detail-dialog__image" />
              </div>
            } @else {
              <div class="item-detail-dialog__image-placeholder">
                <mat-icon class="item-detail-dialog__placeholder-icon">inventory_2</mat-icon>
                <span>No image</span>
              </div>
            }
          </div>
          <div class="item-detail-dialog__right">
            <div class="item-detail-dialog__name">{{ data.name }}</div>
            @if (data.description) {
              <p class="item-detail-dialog__description">{{ data.description }}</p>
            }
            <div class="item-detail-dialog__card">
              <div class="item-detail-dialog__card-title">Details</div>
              <dl class="item-detail-dialog__details">
                <div class="item-detail-dialog__row">
                  <dt>ID</dt>
                  <dd>{{ data.id }}</dd>
                </div>
                <div class="item-detail-dialog__row">
                  <dt>Category</dt>
                  <dd>{{ data.categoryName || '—' }}</dd>
                </div>
                <div class="item-detail-dialog__row">
                  <dt>Outlet</dt>
                  <dd>{{ data.outletName || '—' }}</dd>
                </div>
                <div class="item-detail-dialog__row item-detail-dialog__row--price">
                  <dt>Price</dt>
                  <dd>LKR {{ data.price | number:'1.2-2' }}</dd>
                </div>
                <div class="item-detail-dialog__row">
                  <dt>Status</dt>
                  <dd><span class="item-detail-dialog__badge" [class.item-detail-dialog__badge--active]="data.status === 'ACTIVE'" [class.item-detail-dialog__badge--inactive]="data.status === 'INACTIVE'">{{ data.status }}</span></dd>
                </div>
                <div class="item-detail-dialog__row">
                  <dt>Availability</dt>
                  <dd>{{ data.availability ? 'Available' : 'Unavailable' }}</dd>
                </div>
                <div class="item-detail-dialog__row">
                  <dt>Discount</dt>
                  <dd>{{ (data.discountAvailability ?? data.discountAvailable) ? 'Yes' : 'No' }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="item-detail-dialog__actions">
        <button mat-raised-button color="primary" mat-dialog-close type="button" class="item-detail-dialog__close-btn">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .item-detail-dialog {
        --item-detail-radius: 12px;
        --item-detail-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        --item-detail-surface: var(--mat-sys-surface-container-low, #f5f5f5);
        --item-detail-outline: var(--mat-sys-outline-variant, #e0e0e0);
      }
      .item-detail-dialog__title {
        margin: 0;
        padding: 1rem 1.25rem;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--mat-sys-on-surface);
        border-bottom: 1px solid var(--item-detail-outline);
        background: var(--item-detail-surface);
      }
      .item-detail-dialog__content {
        min-width: 420px;
        max-width: 640px;
        padding: 0;
        overflow: visible;
      }
      .item-detail-dialog__body {
        display: flex;
        flex-direction: row;
        gap: 1.25rem;
        padding: 1.25rem;
        align-items: flex-start;
      }
      .item-detail-dialog__left {
        flex-shrink: 0;
        width: 160px;
      }
      .item-detail-dialog__image-wrap {
        width: 160px;
        border-radius: var(--item-detail-radius);
        overflow: hidden;
        box-shadow: var(--item-detail-shadow);
        background: var(--mat-sys-surface);
      }
      .item-detail-dialog__image {
        display: block;
        width: 160px;
        height: 160px;
        object-fit: contain;
      }
      .item-detail-dialog__image-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        width: 160px;
        height: 160px;
        border-radius: var(--item-detail-radius);
        background: var(--item-detail-outline);
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.8125rem;
      }
      .item-detail-dialog__placeholder-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        opacity: 0.5;
      }
      .item-detail-dialog__right {
        flex: 1;
        min-width: 0;
      }
      .item-detail-dialog__name {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--mat-sys-on-surface);
        margin: 0 0 0.25rem 0;
      }
      .item-detail-dialog__description {
        margin: 0 0 0.75rem 0;
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
        line-height: 1.4;
      }
      .item-detail-dialog__card {
        padding: 1rem 1.25rem;
        border-radius: var(--item-detail-radius);
        border: 1px solid var(--item-detail-outline);
        background: var(--mat-sys-surface);
        box-shadow: var(--item-detail-shadow);
      }
      .item-detail-dialog__card-title {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--mat-sys-on-surface-variant);
        margin-bottom: 0.75rem;
      }
      .item-detail-dialog__details {
        margin: 0;
        padding: 0;
      }
      .item-detail-dialog__row {
        display: grid;
        grid-template-columns: 90px 1fr;
        gap: 0.5rem 1rem;
        padding: 0.4rem 0;
        border-bottom: 1px solid var(--item-detail-outline);
        align-items: center;
      }
      .item-detail-dialog__row:last-child {
        border-bottom: none;
      }
      .item-detail-dialog__row dt {
        margin: 0;
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--mat-sys-on-surface-variant);
      }
      .item-detail-dialog__row dd {
        margin: 0;
        font-size: 0.9375rem;
        color: var(--mat-sys-on-surface);
      }
      .item-detail-dialog__row--price dd {
        font-weight: 600;
        color: var(--mat-sys-primary, #1976d2);
      }
      .item-detail-dialog__badge {
        display: inline-block;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .item-detail-dialog__badge--active {
        background: rgba(76, 175, 80, 0.15);
        color: #2e7d32;
      }
      .item-detail-dialog__badge--inactive {
        background: rgba(244, 67, 54, 0.12);
        color: #c62828;
      }
      .item-detail-dialog__actions {
        padding: 0.75rem 1.25rem 1rem;
        border-top: 1px solid var(--item-detail-outline);
        background: var(--item-detail-surface);
      }
      .item-detail-dialog__close-btn {
        min-width: 88px;
      }
      mat-dialog-actions.item-detail-dialog__actions button {
        border: 1px solid var(--item-detail-outline);
      }
    `,
  ],
})
export class ItemDetailDialogComponent {
  readonly data: ItemDetailDialogData = inject(MAT_DIALOG_DATA);
}
