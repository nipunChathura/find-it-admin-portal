import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface AddUserDialogData {
  /** When true, status dropdown is editable. When false (admin), status is PENDING and disabled. */
  isSysAdmin: boolean;
}

export interface AddUserDialogResult {
  name: string;
  username: string;
  email: string;
  password: string;
  status: string;
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'PENDING', label: 'PENDING' },
  { value: 'APPROVED', label: 'APPROVED' },
  { value: 'FORGOT_PASSWORD_PENDING', label: 'FORGOT_PASSWORD_PENDING' },
];

@Component({
  selector: 'app-add-user-dialog',
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
    <h2 mat-dialog-title>Add User</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="add-user-dialog__field">
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="name" name="name" required />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-user-dialog__field">
        <mat-label>Username</mat-label>
        <input matInput [(ngModel)]="username" name="username" required />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-user-dialog__field">
        <mat-label>Email</mat-label>
        <input matInput type="email" [(ngModel)]="email" name="email" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-user-dialog__field">
        <mat-label>Password</mat-label>
        <input matInput [type]="hidePassword ? 'password' : 'text'" [(ngModel)]="password" name="password" required />
        <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" tabindex="-1" aria-label="Toggle password visibility">
          <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-user-dialog__field">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="status" name="status" [disabled]="!data.isSysAdmin">
          @for (opt of statusOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
        @if (!data.isSysAdmin) {
          <mat-hint>Admin users cannot change status; new users are PENDING.</mat-hint>
        }
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
      .add-user-dialog__field {
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
export class AddUserDialogComponent {
  readonly data: AddUserDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AddUserDialogComponent>);

  readonly statusOptions = STATUS_OPTIONS;
  name = '';
  username = '';
  email = '';
  password = '';
  hidePassword = true;
  /** SysAdmin can edit; admin user gets PENDING and cannot edit. */
  status: string;

  constructor() {
    this.status = this.data.isSysAdmin ? 'PENDING' : 'PENDING';
  }

  onSave(): void {
    const result: AddUserDialogResult = {
      name: this.name.trim(),
      username: this.username.trim(),
      email: this.email.trim(),
      password: this.password,
      status: this.status,
    };
    this.dialogRef.close(result);
  }
}
