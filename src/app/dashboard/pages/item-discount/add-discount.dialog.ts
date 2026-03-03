import { Component, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { CreateDiscountBody } from '../../../core/api/admin-discounts.api';
import { AdminItemsApiService } from '../../../core/api/admin-items.api';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'PERCENTAGE', label: 'PERCENTAGE' },
  { value: 'FIXED', label: 'FIXED' },
];

@Component({
  selector: 'app-add-discount-dialog',
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
    <h2 mat-dialog-title>Add discount</h2>
    <mat-dialog-content class="add-discount-dialog__content">
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
        <mat-label>Discount name</mat-label>
        <input matInput [(ngModel)]="discountName" name="discountName" required />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
        <mat-label>Type</mat-label>
        <mat-select [(ngModel)]="discountType" name="discountType">
          @for (opt of discountTypeOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
        <mat-label>Value</mat-label>
        <input matInput type="number" [(ngModel)]="discountValue" name="discountValue" min="0" step="0.01" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
        <mat-label>Start date</mat-label>
        <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDateModel" name="startDate" />
        <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
        <mat-datepicker #startPicker></mat-datepicker>
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
        <mat-label>End date</mat-label>
        <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDateModel" name="endDate" />
        <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
        <mat-datepicker #endPicker></mat-datepicker>
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="status" name="status">
          @for (opt of statusOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <div class="add-discount-dialog__field add-discount-dialog__image-wrap">
        <label class="add-discount-dialog__image-label">Discount image (optional)</label>
        <input type="file" accept="image/*" (change)="onImageSelected($event)" class="add-discount-dialog__file-input" #addImageInput />
        @if (discountImage) {
          <div class="add-discount-dialog__preview">
            <span class="add-discount-dialog__preview-label">Selected image:</span>
            <img [src]="discountImage" alt="Discount preview" class="add-discount-dialog__preview-img" />
            <button mat-button type="button" (click)="clearImage()">Remove image</button>
          </div>
        }
      </div>
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
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
      <button mat-raised-button color="primary" type="button" (click)="onSave()" [disabled]="!discountName.trim()">Add</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .add-discount-dialog__content { min-width: 360px; }
    .add-discount-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }
    .add-discount-dialog__image-wrap { margin-top: 0.5rem; }
    .add-discount-dialog__image-label { display: block; font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); margin-bottom: 0.25rem; }
    .add-discount-dialog__file-input { font-size: 0.875rem; }
    .add-discount-dialog__preview { margin-top: 0.5rem; }
    .add-discount-dialog__preview-label { display: block; font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); margin-bottom: 0.25rem; }
    .add-discount-dialog__preview-img { max-width: 160px; max-height: 120px; object-fit: contain; border-radius: 8px; border: 1px solid var(--mat-sys-outline-variant); display: block; margin-bottom: 0.25rem; }
  `],
})
export class AddDiscountDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AddDiscountDialogComponent>);
  private readonly adminItemsApi = inject(AdminItemsApiService);

  readonly statusOptions = STATUS_OPTIONS;
  readonly discountTypeOptions = DISCOUNT_TYPE_OPTIONS;
  itemOptions: { id: number; name: string }[] = [];

  discountName = '';
  discountType = 'PERCENTAGE';
  discountValue = 0;
  startDateModel: Date | null = null;
  endDateModel: Date | null = null;
  status = 'ACTIVE';
  discountImage = '';
  itemIds: number[] = [];

  constructor() {
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
    const body: CreateDiscountBody = {
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
