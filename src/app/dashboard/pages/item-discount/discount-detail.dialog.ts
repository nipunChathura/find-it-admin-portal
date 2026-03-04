import { Component, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DiscountRow } from '../../../core/api/admin-discounts.api';
import { ApiImageComponent } from '../../../shared/api-image/api-image.component';

export interface DiscountDetailDialogData {
  discount: DiscountRow;
}

@Component({
  selector: 'app-discount-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, ApiImageComponent],
  template: `
    <h2 mat-dialog-title>Discount: {{ data.discount.discountName }}</h2>
    <mat-dialog-content class="discount-detail-dialog__content">
      <div class="discount-detail-dialog__left">
        <div class="discount-detail-dialog__info">
          <p><strong>ID:</strong> {{ data.discount.discountId }}</p>
          <p><strong>Type:</strong> {{ data.discount.discountType }}</p>
          <p><strong>Value:</strong> {{ data.discount.discountType === 'PERCENTAGE' ? data.discount.discountValue + '%' : data.discount.discountValue }}</p>
          <p><strong>Status:</strong> {{ data.discount.discountStatus }}</p>
          <p><strong>Start date:</strong> {{ data.discount.startDate || '—' }}</p>
          <p><strong>End date:</strong> {{ data.discount.endDate || '—' }}</p>
        </div>
        <div class="discount-detail-dialog__items">
          <h3 class="discount-detail-dialog__items-title">Items</h3>
          @if (data.discount.items.length) {
            <ul class="discount-detail-dialog__list">
              @for (item of data.discount.items; track item.itemId) {
                <li>{{ item.itemName }} <span class="discount-detail-dialog__id">(ID: {{ item.itemId }})</span></li>
              }
            </ul>
          } @else {
            <p class="discount-detail-dialog__empty">No items</p>
          }
        </div>
      </div>
      <div class="discount-detail-dialog__image-wrap">
        @if (discountImagePath()) {
          <app-api-image type="discount" [pathOrFileName]="discountImagePath()" alt="Discount image" imgClass="discount-detail-dialog__image" />
        } @else {
          <span class="discount-detail-dialog__no-image">No image</span>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .discount-detail-dialog__content {
      min-width: 360px;
      max-width: 520px;
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
    }
    .discount-detail-dialog__left {
      flex: 1;
      min-width: 0;
    }
    .discount-detail-dialog__image-wrap {
      flex-shrink: 0;
      width: 175px;
      min-height: 80px;
      max-width: 36%;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .discount-detail-dialog__image-wrap ::ng-deep .discount-detail-dialog__image,
    .discount-detail-dialog__image-wrap ::ng-deep .api-image__img {
      width: 175px;
      max-width: 100%;
      max-height: 200px;
      height: auto;
      object-fit: contain;
      border-radius: 12px;
      border: 1px solid var(--mat-sys-outline-variant);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
      image-rendering: auto;
    }
    .discount-detail-dialog__info {
      margin-bottom: 1.25rem;
    }
    .discount-detail-dialog__info p {
      margin: 0.35rem 0;
      font-size: 0.9375rem;
    }
    .discount-detail-dialog__items-title {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      font-weight: 600;
    }
    .discount-detail-dialog__list {
      margin: 0;
      padding-left: 1.25rem;
    }
    .discount-detail-dialog__list li {
      margin-bottom: 0.25rem;
    }
    .discount-detail-dialog__id {
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.8125rem;
    }
    .discount-detail-dialog__empty {
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
    }
    .discount-detail-dialog__no-image {
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
    }
  `],
})
export class DiscountDetailDialogComponent implements AfterViewInit {
  readonly data = inject<DiscountDetailDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DiscountDetailDialogComponent>);
  private readonly cdr = inject(ChangeDetectorRef);

  discountImagePath(): string {
    const path = this.data?.discount?.discountImage;
    return path != null && String(path).trim() !== '' ? String(path).trim() : '';
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }
}
