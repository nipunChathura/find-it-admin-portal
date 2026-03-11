import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface AddCustomerDialogData {
  /** Optional; when provided can prefill or control behaviour. */
  placeholder?: unknown;
}

export interface AddCustomerDialogResult {
  name: string;
  email: string;
  phone: string;
  status: string;
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'PENDING', label: 'PENDING' },
];

@Component({
  selector: 'app-add-customer-dialog',
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
  template: `
    <h2 mat-dialog-title>Add Customer</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="add-customer-dialog__field">
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="name" name="name" required />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-customer-dialog__field">
        <mat-label>Email</mat-label>
        <input matInput type="email" [(ngModel)]="email" name="email" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-customer-dialog__field">
        <mat-label>Phone</mat-label>
        <input matInput [(ngModel)]="phone" name="phone" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-customer-dialog__field">
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
      mat-dialog-content {
        min-width: 340px;
        margin-bottom: 0.5rem;
      }
      .add-customer-dialog__field {
        width: 100%;
        display: block;
        margin-bottom: 0.5rem;
      }
      mat-dialog-actions {
        padding-top: 0.5rem;
        gap: 0.5rem;
      }
      mat-dialog-actions button {
        border: 1px solid var(--mat-sys-outline-variant);
      }
      .dialog-cancel-btn {
        color: #c62828;
      }
    `,
  ],
})
export class AddCustomerDialogComponent {
  readonly data: AddCustomerDialogData = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};
  private readonly dialogRef = inject(MatDialogRef<AddCustomerDialogComponent>);

  readonly statusOptions = STATUS_OPTIONS;
  name = '';
  email = '';
  phone = '';
  status = 'ACTIVE';

  onSave(): void {
    const result: AddCustomerDialogResult = {
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      status: this.status,
    };
    this.dialogRef.close(result);
  }
}
