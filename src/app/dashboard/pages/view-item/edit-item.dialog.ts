import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

export interface EditItemDialogData {
  id: number;
  name: string;
  description: string;
  status: string;
  createdDate: string;
}

export interface EditItemDialogResult {
  id: number;
  name: string;
  description: string;
  status: string;
  createdDate: string;
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
    MatButtonModule,
  ],
  templateUrl: './edit-item.dialog.html',
  styles: [
    'mat-dialog-content { min-width: 320px; margin-bottom: 0.5rem; }',
    '.edit-item-dialog__readonly { margin: 0 0 1rem 0; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }',
    '.edit-item-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }',
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
  status: string;

  constructor() {
    this.name = this.data.name;
    this.description = this.data.description;
    this.status = this.data.status;
  }

  onUpdate(): void {
    this.dialogRef.close({
      id: this.data.id,
      name: this.name.trim(),
      description: this.description.trim(),
      status: this.status,
      createdDate: this.data.createdDate,
    } as EditItemDialogResult);
  }
}
