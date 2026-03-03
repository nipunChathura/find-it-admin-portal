import { Component, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { DiscountRow, UpdateDiscountBody } from '../../../core/api/admin-discounts.api';
import { AdminItemsApiService } from '../../../core/api/admin-items.api';

export interface EditDiscountDialogData {
  discount: DiscountRow;
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'PERCENTAGE', label: 'PERCENTAGE' },
  { value: 'FIXED', label: 'FIXED' },
];

@Component({
  selector: 'app-edit-discount-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <h2 mat-dialog-title>Edit discount</h2>
    <mat-dialog-content class="edit-discount-dialog__content">
      <p class="edit-discount-dialog__id">ID: {{ data.discount.discountId }}</p>
      <mat-form-field appearance="outline" class="edit-discount-dialog__field">
        <mat-label>Discount name</mat-label>
        <input matInput [(ngModel)]="discountName" name="discountName" required />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-discount-dialog__field">
        <mat-label>Type</mat-label>
        <mat-select [(ngModel)]="discountType" name="discountType">
          @for (opt of discountTypeOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-discount-dialog__field">
        <mat-label>Value</mat-label>
        <input matInput type="number" [(ngModel)]="discountValue" name="discountValue" min="0" step="0.01" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-discount-dialog__field">
        <mat-label>Start date</mat-label>
        <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDateModel" name="startDate" />
        <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
        <mat-datepicker #startPicker></mat-datepicker>
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-discount-dialog__field">
        <mat-label>End date</mat-label>
        <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDateModel" name="endDate" />
        <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
        <mat-datepicker #endPicker></mat-datepicker>
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-discount-dialog__field">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="status" name="status">
          @for (opt of statusOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <div class="edit-discount-dialog__field edit-discount-dialog__image-wrap">
        <label class="edit-discount-dialog__image-label">Discount image</label>
        <input type="file" accept="image/*" (change)="onImageSelected($event)" class="edit-discount-dialog__file-input" #editImageInput />
        @if (discountImage) {
          <div class="edit-discount-dialog__preview">
            <span class="edit-discount-dialog__preview-label">Current image:</span>
            <img [src]="discountImage" alt="Discount image" class="edit-discount-dialog__preview-img" />
            <div class="edit-discount-dialog__preview-actions">
              <button mat-button type="button" (click)="editImageInput.click()">Change image</button>
              <button mat-button type="button" (click)="clearImage()">Remove image</button>
            </div>
          </div>
        } @else {
          <p class="edit-discount-dialog__no-image">No image. Use the file input above to add one.</p>
        }
      </div>
      <mat-form-field appearance="outline" class="edit-discount-dialog__field">
        <mat-label>Items</mat-label>
        <mat-select [(ngModel)]="itemIds" name="itemIds" multiple>
          @for (item of itemOptions; track item.id) {
            <mat-option [value]="item.id">{{ item.name }}</mat-option>
          }
        </mat-select>
        <mat-hint>Select items that have this discount.</mat-hint>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" type="button" (click)="onSave()" [disabled]="!discountName.trim()">Update</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .edit-discount-dialog__content { min-width: 360px; }
    .edit-discount-dialog__id { margin: 0 0 1rem 0; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }
    .edit-discount-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }
    .edit-discount-dialog__image-wrap { margin-top: 0.5rem; }
    .edit-discount-dialog__image-label { display: block; font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); margin-bottom: 0.25rem; }
    .edit-discount-dialog__file-input { font-size: 0.875rem; }
    .edit-discount-dialog__preview { margin-top: 0.5rem; }
    .edit-discount-dialog__preview-label { display: block; font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); margin-bottom: 0.25rem; }
    .edit-discount-dialog__preview-img { max-width: 160px; max-height: 120px; object-fit: contain; border-radius: 8px; border: 1px solid var(--mat-sys-outline-variant); display: block; margin-bottom: 0.5rem; }
    .edit-discount-dialog__preview-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .edit-discount-dialog__no-image { margin: 0.5rem 0 0 0; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }
  `],
})
export class EditDiscountDialogComponent {
  readonly data = inject<EditDiscountDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditDiscountDialogComponent>);
  private readonly adminItemsApi = inject(AdminItemsApiService);

  readonly statusOptions = STATUS_OPTIONS;
  readonly discountTypeOptions = DISCOUNT_TYPE_OPTIONS;
  itemOptions: { id: number; name: string }[] = [];

  discountName: string;
  discountType: string;
  discountValue: number;
  startDateModel: Date | null = null;
  endDateModel: Date | null = null;
  status: string;
  discountImage = '';
  itemIds: number[] = [];

  constructor() {
    const d = this.data.discount;
    this.discountName = d.discountName ?? '';
    this.discountType = d.discountType ?? 'PERCENTAGE';
    this.discountValue = d.discountValue ?? 0;
    const startStr = d.startDate ?? '';
    const endStr = d.endDate ?? '';
    this.startDateModel = startStr ? new Date(startStr) : null;
    this.endDateModel = endStr ? new Date(endStr) : null;
    this.status = d.discountStatus ?? 'ACTIVE';
    this.discountImage = d.discountImage ?? '';
    this.itemIds = d.itemIds?.length ? [...d.itemIds] : (d.items?.map((i) => i.itemId) ?? []);
    this.adminItemsApi.getItems({}).subscribe({
      next: (rows) => {
        this.itemOptions = rows.map((r) => ({ id: r.id, name: r.name }));
      },
      error: () => {
        this.itemOptions = [];
      },
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.discountImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  clearImage(): void {
    this.discountImage = '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const startDate = this.startDateModel ? formatDate(this.startDateModel, 'yyyy-MM-dd', 'en') : '';
    const endDate = this.endDateModel ? formatDate(this.endDateModel, 'yyyy-MM-dd', 'en') : '';
    const body: UpdateDiscountBody = {
      discountName: this.discountName.trim(),
      discountType: this.discountType,
      discountValue: Number(this.discountValue),
      startDate,
      endDate,
      status: this.status,
      itemIds: this.itemIds ?? [],
      discountImage: this.discountImage || null,
    };
    this.dialogRef.close(body);
  }
}
