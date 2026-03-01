import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

export interface EditUserDialogData {
  id: number;
  name: string;
  email: string;
  status: string;
  createdDate: string;
  role?: string;
  /** When false (e.g. admin role), status dropdown is read-only. From login API role saved in state. */
  canEditStatus?: boolean;
}

export interface EditUserDialogResult {
  id: number;
  name: string;
  email: string;
  status: string;
  createdDate: string;
  role?: string;
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'PENDING', label: 'PENDING' },
  { value: 'APPROVED', label: 'APPROVED' },
  { value: 'FORGOT_PASSWORD_PENDING', label: 'FORGOT_PASSWORD_PENDING' },
];

@Component({
  selector: 'app-edit-user-dialog',
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
    <h2 mat-dialog-title>Edit User</h2>
    <mat-dialog-content>
      <p class="edit-user-dialog__readonly">
        <strong>ID:</strong> {{ data.id }} &nbsp;|&nbsp; <strong>Created:</strong> {{ data.createdDate }}
      </p>
      <mat-form-field appearance="outline" class="edit-user-dialog__field">
        <mat-label>Username</mat-label>
        <input matInput [(ngModel)]="name" name="name" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-user-dialog__field">
        <mat-label>Email</mat-label>
        <input matInput type="email" [(ngModel)]="email" name="email" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-user-dialog__field">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="status" name="status" [disabled]="!canEditStatus">
          @for (opt of statusOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
        @if (!canEditStatus) {
          <mat-hint>Your role cannot change user status.</mat-hint>
        }
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button mat-dialog-close type="button" class="dialog-cancel-btn">Cancel</button>
      <button mat-raised-button color="primary" (click)="onUpdate()" type="button">Update</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content {
        min-width: 320px;
        margin-bottom: 0.5rem;
      }
      .edit-user-dialog__readonly {
        margin: 0 0 1rem 0;
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .edit-user-dialog__field {
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
export class EditUserDialogComponent {
  readonly data: EditUserDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditUserDialogComponent>);

  readonly statusOptions = STATUS_OPTIONS;
  readonly canEditStatus: boolean;
  name: string;
  email: string;
  status: string;

  constructor() {
    this.canEditStatus = this.data.canEditStatus !== false;
    this.name = this.data.name;
    this.email = this.data.email ?? '';
    this.status = this.data.status;
  }

  onUpdate(): void {
    const result: EditUserDialogResult = {
      id: this.data.id,
      name: this.name.trim(),
      email: this.email.trim(),
      status: this.status,
      createdDate: this.data.createdDate,
      role: this.data.role,
    };
    this.dialogRef.close(result);
  }
}
