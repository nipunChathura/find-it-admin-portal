import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AdminCategoriesApiService } from '../../../core/api/admin-categories.api';
import { AdminOutletsApiService } from '../../../core/api/admin-outlets.api';

export interface AddItemDialogData {
  // No extra data required for add
}

export interface AddItemDialogResult {
  itemName: string;
  itemDescription: string;
  categoryId: number;
  outletId: number;
  price: number;
  availability: boolean;
  itemImage: string | null;
  status: string;
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'PENDING', label: 'PENDING' },
];

@Component({
  selector: 'app-add-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './add-item.dialog.html',
  styles: [
    'mat-dialog-content { min-width: 340px; margin-bottom: 0.5rem; }',
    '.add-item-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }',
    '.add-item-dialog__image-wrap { margin-top: 0.5rem; }',
    '.add-item-dialog__image-label { display: block; font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); margin-bottom: 0.25rem; }',
    '.add-item-dialog__file-input { font-size: 0.875rem; }',
    '.add-item-dialog__preview { margin-top: 0.5rem; }',
    '.add-item-dialog__preview-img { max-width: 160px; max-height: 120px; object-fit: contain; border-radius: 8px; border: 1px solid var(--mat-sys-outline-variant); display: block; margin-bottom: 0.25rem; }',
    'mat-dialog-actions { padding-top: 0.5rem; gap: 0.5rem; }',
    'mat-dialog-actions button { border: 1px solid var(--mat-sys-outline-variant); }',
    '.dialog-cancel-btn { color: #c62828; }',
  ],
})
export class AddItemDialogComponent {
  readonly data: AddItemDialogData = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};
  private readonly dialogRef = inject(MatDialogRef<AddItemDialogComponent>);
  private readonly adminCategoriesApi = inject(AdminCategoriesApiService);
  private readonly adminOutletsApi = inject(AdminOutletsApiService);

  readonly statusOptions = STATUS_OPTIONS;
  categoryOptions: { id: number; name: string }[] = [];
  outletOptions: { outletId: number; outletName: string }[] = [];

  itemName = '';
  itemDescription = '';
  categoryId: number | null = null;
  outletId: number | null = null;
  price = 0;
  availability = true;
  itemImage: string | null = null;
  status = 'ACTIVE';

  constructor() {
    this.adminCategoriesApi.getCategories({}).subscribe({
      next: (rows) => {
        this.categoryOptions = rows.map((r) => ({ id: r.id, name: r.name }));
      },
      error: () => {
        this.categoryOptions = [];
      },
    });
    this.adminOutletsApi.getOutlets({ search: '', status: '', outletType: '' }).subscribe({
      next: (rows) => {
        this.outletOptions = rows.map((r) => ({ outletId: r.row.outletId, outletName: r.row.outletName }));
      },
      error: () => {
        this.outletOptions = [];
      },
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.itemImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  clearImage(): void {
    this.itemImage = null;
  }

  onSave(): void {
    if (this.categoryId == null || this.outletId == null) return;
    this.dialogRef.close({
      itemName: this.itemName.trim(),
      itemDescription: this.itemDescription.trim(),
      categoryId: this.categoryId,
      outletId: this.outletId,
      price: Number(this.price),
      availability: this.availability,
      itemImage: this.itemImage,
      status: this.status,
    } as AddItemDialogResult);
  }
}
