import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
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
  ],
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
        <input matInput [(ngModel)]="startDate" name="startDate" placeholder="YYYY-MM-DD" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-discount-dialog__field">
        <mat-label>End date</mat-label>
        <input matInput [(ngModel)]="endDate" name="endDate" placeholder="YYYY-MM-DD" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-discount-dialog__field">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="status" name="status">
          @for (opt of statusOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
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
      <button mat-button mat-dialog-close type="button">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" type="button" [disabled]="!discountName.trim()">Update</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .edit-discount-dialog__content { min-width: 360px; }
    .edit-discount-dialog__id { margin: 0 0 1rem 0; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }
    .edit-discount-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }
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
  startDate: string;
  endDate: string;
  status: string;
  itemIds: number[] = [];

  constructor() {
    const d = this.data.discount;
    this.discountName = d.discountName ?? '';
    this.discountType = d.discountType ?? 'PERCENTAGE';
    this.discountValue = d.discountValue ?? 0;
    this.startDate = d.startDate ?? '';
    this.endDate = d.endDate ?? '';
    this.status = d.discountStatus ?? 'ACTIVE';
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

  onSave(): void {
    const body: UpdateDiscountBody = {
      discountName: this.discountName.trim(),
      discountType: this.discountType,
      discountValue: Number(this.discountValue),
      startDate: this.startDate.trim(),
      endDate: this.endDate.trim(),
      status: this.status,
      itemIds: this.itemIds ?? [],
    };
    this.dialogRef.close(body);
  }
}
