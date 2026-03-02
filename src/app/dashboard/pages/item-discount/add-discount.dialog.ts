import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
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
  ],
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
        <input matInput [(ngModel)]="startDate" name="startDate" placeholder="YYYY-MM-DD" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
        <mat-label>End date</mat-label>
        <input matInput [(ngModel)]="endDate" name="endDate" placeholder="YYYY-MM-DD" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="status" name="status">
          @for (opt of statusOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
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
      <button mat-button mat-dialog-close type="button">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" type="button" [disabled]="!discountName.trim()">Add</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .add-discount-dialog__content { min-width: 360px; }
    .add-discount-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }
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
  startDate = '';
  endDate = '';
  status = 'ACTIVE';
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

  onSave(): void {
    const body: CreateDiscountBody = {
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
