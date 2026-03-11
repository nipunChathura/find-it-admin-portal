import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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
  username: string;
  email: string;
  password: string;
  status: string;
}

/** Status values allowed by backend: ACTIVE | INACTIVE | PENDING | APPROVED */
const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'PENDING', label: 'PENDING' },
  { value: 'APPROVED', label: 'APPROVED' },
];

const STATUS_PATTERN = /^(ACTIVE|INACTIVE|PENDING|APPROVED)$/;

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Add User</h2>
    <form [formGroup]="form" (ngSubmit)="onSave()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="add-user-dialog__field">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" />
          @if (form.get('username')?.invalid && form.get('username')?.touched) {
            <mat-error>{{ getUsernameError() }}</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="add-user-dialog__field">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" />
          @if (form.get('email')?.invalid && form.get('email')?.touched) {
            <mat-error>{{ getEmailError() }}</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="add-user-dialog__field">
          <mat-label>Password</mat-label>
          <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" />
          <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" tabindex="-1" aria-label="Toggle password visibility">
            <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.get('password')?.invalid && form.get('password')?.touched) {
            <mat-error>{{ getPasswordError() }}</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="add-user-dialog__field">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status" [disabled]="!data.isSysAdmin">
            @for (opt of statusOptions; track opt.value) {
              <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
            }
          </mat-select>
          @if (!data.isSysAdmin) {
            <mat-hint>Admin users cannot change status; new users are PENDING.</mat-hint>
          }
          @if (form.get('status')?.invalid && form.get('status')?.touched) {
            <mat-error>Status must be ACTIVE, INACTIVE, PENDING, or APPROVED</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-raised-button type="button" mat-dialog-close class="dialog-cancel-btn">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Save</button>
      </mat-dialog-actions>
    </form>
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
  private readonly fb = inject(FormBuilder);

  readonly statusOptions = STATUS_OPTIONS;
  hidePassword = true;

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(100)]],
    email: ['', [Validators.email, Validators.maxLength(255)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]],
    status: ['PENDING' as string, [Validators.required, Validators.pattern(STATUS_PATTERN)]],
  });

  constructor() {
    if (!this.data.isSysAdmin) {
      this.form.get('status')?.disable();
    }
  }

  getUsernameError(): string {
    const c = this.form.get('username');
    if (c?.hasError('required')) return 'Username is required';
    if (c?.hasError('minlength')) return 'Username must be at least 4 characters';
    if (c?.hasError('maxlength')) return 'Username must be at most 100 characters';
    return '';
  }

  getEmailError(): string {
    const c = this.form.get('email');
    if (c?.hasError('email')) return 'Invalid email format';
    if (c?.hasError('maxlength')) return 'Email must be at most 255 characters';
    return '';
  }

  getPasswordError(): string {
    const c = this.form.get('password');
    if (c?.hasError('required')) return 'Password is required';
    if (c?.hasError('minlength')) return 'Password must be at least 6 characters';
    if (c?.hasError('maxlength')) return 'Password must be at most 255 characters';
    return '';
  }

  onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const result: AddUserDialogResult = {
      username: v.username.trim(),
      email: v.email.trim(),
      password: v.password,
      status: v.status,
    };
    this.dialogRef.close(result);
  }
}
