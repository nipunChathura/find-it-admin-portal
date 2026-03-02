import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface EditItemDialogData {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  outletId: number;
  outletName: string;
  price: number;
  availability: boolean;
  itemImage: string | null;
  status: string;
  createdDate?: string;
}

export interface EditItemDialogResult {
  id: number;
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
  selector: 'app-edit-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  templateUrl: './edit-item.dialog.html',
  styles: [
    'mat-dialog-content { min-width: 320px; margin-bottom: 0.5rem; }',
    '.edit-item-dialog__readonly { margin: 0 0 1rem 0; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }',
    '.edit-item-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }',
    '.edit-item-dialog__checkbox { margin-bottom: 0.5rem; }',
    'mat-dialog-actions { padding-top: 0.5rem; gap: 0.5rem; }',
    'mat-dialog-actions button { border: 1px solid var(--mat-sys-outline-variant); }',
    '.dialog-cancel-btn { color: #c62828; }',
  ],
})
export class EditItemDialogComponent {
  readonly data: EditItemDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditItemDialogComponent>);

  readonly statusOptions = STATUS_OPTIONS;
  name: string;
  description: string;
  price: number;
  availability: boolean;
  itemImage: string;
  status: string;

  constructor() {
    this.name = this.data.name;
    this.description = this.data.description;
    this.price = this.data.price;
    this.availability = this.data.availability;
    this.itemImage = this.data.itemImage ?? '';
    this.status = this.data.status;
  }

  onUpdate(): void {
    const img = (this.itemImage ?? '').trim();
    this.dialogRef.close({
      id: this.data.id,
      itemName: this.name.trim(),
      itemDescription: this.description.trim(),
      categoryId: this.data.categoryId,
      outletId: this.data.outletId,
      price: Number(this.price),
      availability: this.availability,
      itemImage: img || null,
      status: this.status,
    } as EditItemDialogResult);
  }
}
