import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

export type CategoryType = 'ITEM' | 'SERVICE';

export interface AddCategoryDialogResult {
  name: string;
  categoryType: CategoryType;
  status: string;
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

const CATEGORY_TYPE_OPTIONS = [
  { value: 'ITEM', label: 'ITEM' },
  { value: 'SERVICE', label: 'SERVICE' },
];

@Component({
  selector: 'app-add-category-dialog',
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
    <h2 mat-dialog-title>Add Category</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="add-category-dialog__field">
        <mat-label>Category Name</mat-label>
        <input matInput [(ngModel)]="name" name="name" required />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-category-dialog__field">
        <mat-label>Category Type</mat-label>
        <mat-select [(ngModel)]="categoryType" name="categoryType">
          @for (opt of categoryTypeOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-category-dialog__field">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="status" name="status">
          @for (opt of statusOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button mat-dialog-close type="button" class="dialog-cancel-btn">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" type="button">Save</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content { min-width: 320px; margin-bottom: 0.5rem; }
      .add-category-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }
      mat-dialog-actions { padding-top: 0.5rem; gap: 0.5rem; }
      mat-dialog-actions button { border: 1px solid var(--mat-sys-outline-variant); }
      .dialog-cancel-btn { color: #c62828; }
    `,
  ],
})
export class AddCategoryDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AddCategoryDialogComponent>);

  readonly statusOptions = STATUS_OPTIONS;
  readonly categoryTypeOptions = CATEGORY_TYPE_OPTIONS;
  name = '';
  categoryType: 'ITEM' | 'SERVICE' = 'ITEM';
  status = 'ACTIVE';

  onSave(): void {
    this.dialogRef.close({ name: this.name.trim(), categoryType: this.categoryType, status: this.status });
  }
}
