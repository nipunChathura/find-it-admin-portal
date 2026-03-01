import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface AddItemDialogData {
  // No extra data required for add
}

export interface AddItemDialogResult {
  name: string;
  description: string;
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
  ],
  templateUrl: './add-item.dialog.html',
  styles: [
    'mat-dialog-content { min-width: 340px; margin-bottom: 0.5rem; }',
    '.add-item-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }',
    'mat-dialog-actions { padding-top: 0.5rem; gap: 0.5rem; }',
    'mat-dialog-actions button { border: 1px solid var(--mat-sys-outline-variant); }',
    '.dialog-cancel-btn { color: #c62828; }',
  ],
})
export class AddItemDialogComponent {
  readonly data: AddItemDialogData = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};
  private readonly dialogRef = inject(MatDialogRef<AddItemDialogComponent>);

  readonly statusOptions = STATUS_OPTIONS;
  name = '';
  description = '';
  status = 'ACTIVE';

  onSave(): void {
    this.dialogRef.close({
      name: this.name.trim(),
      description: this.description.trim(),
      status: this.status,
    } as AddItemDialogResult);
  }
}
