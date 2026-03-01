import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

export type CategoryType = 'ITEM' | 'SERVICE';

export interface EditCategoryDialogData {
  id: number;
  name: string;
  categoryType: CategoryType;
  status: string;
  createdDate: string;
}

export type EditCategoryDialogResult = EditCategoryDialogData;

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

const CATEGORY_TYPE_OPTIONS = [
  { value: 'ITEM', label: 'ITEM' },
  { value: 'SERVICE', label: 'SERVICE' },
];

@Component({
  selector: 'app-edit-category-dialog',
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
    <h2 mat-dialog-title>Edit Category</h2>
    <mat-dialog-content>
      <p class="edit-category-dialog__readonly">
        <strong>ID:</strong> {{ data.id }} &nbsp;|&nbsp; <strong>Created:</strong> {{ data.createdDate }}
      </p>
      <mat-form-field appearance="outline" class="edit-category-dialog__field">
        <mat-label>Category Name</mat-label>
        <input matInput [(ngModel)]="name" name="name" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-category-dialog__field">
        <mat-label>Category Type</mat-label>
        <mat-select [(ngModel)]="categoryType" name="categoryType">
          @for (opt of categoryTypeOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-category-dialog__field">
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
      <button mat-raised-button color="primary" (click)="onUpdate()" type="button">Update</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content { min-width: 320px; margin-bottom: 0.5rem; }
      .edit-category-dialog__readonly { margin: 0 0 1rem 0; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }
      .edit-category-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }
      mat-dialog-actions { padding-top: 0.5rem; gap: 0.5rem; }
      mat-dialog-actions button { border: 1px solid var(--mat-sys-outline-variant); }
      .dialog-cancel-btn { color: #c62828; }
    `,
  ],
})
export class EditCategoryDialogComponent {
  readonly data: EditCategoryDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditCategoryDialogComponent>);

  readonly statusOptions = STATUS_OPTIONS;
  readonly categoryTypeOptions = CATEGORY_TYPE_OPTIONS;
  name: string;
  categoryType: CategoryType;
  status: string;

  constructor() {
    this.name = this.data.name;
    this.categoryType = this.data.categoryType;
    this.status = this.data.status;
  }

  onUpdate(): void {
    this.dialogRef.close({
      id: this.data.id,
      name: this.name.trim(),
      categoryType: this.categoryType,
      status: this.status,
      createdDate: this.data.createdDate,
    });
  }
}
