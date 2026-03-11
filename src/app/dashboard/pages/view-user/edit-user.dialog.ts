import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
  username: string;
  email: string;
  password: string;
  status: string;
  createdDate: string;
}

/** Optional password: when provided, must be 6–255 characters (same as add user). */
function optionalPasswordLength(control: AbstractControl): ValidationErrors | null {
  const v = control.value as string;
  if (v == null || v.length === 0) return null;
  if (v.length < 6) return { minlength: { requiredLength: 6, actualLength: v.length } };
  if (v.length > 255) return { maxlength: { requiredLength: 255, actualLength: v.length } };
  return null;
}

/** Status options for edit (include FORGOT_PASSWORD_PENDING for existing rows). */
const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'PENDING', label: 'PENDING' },
  { value: 'APPROVED', label: 'APPROVED' },
  { value: 'FORGOT_PASSWORD_PENDING', label: 'FORGOT_PASSWORD_PENDING' },
];

const STATUS_PATTERN = /^(ACTIVE|INACTIVE|PENDING|APPROVED|FORGOT_PASSWORD_PENDING)$/;

@Component({
  selector: 'app-edit-user-dialog',
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
    <h2 mat-dialog-title>Edit User</h2>
    <form [formGroup]="form" (ngSubmit)="onUpdate()">
      <mat-dialog-content>
        <p class="edit-user-dialog__readonly">
          <strong>ID:</strong> {{ data.id }} &nbsp;|&nbsp; <strong>Created:</strong> {{ data.createdDate }}
        </p>
        <mat-form-field appearance="outline" class="edit-user-dialog__field">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" />
          @if (form.get('username')?.invalid && form.get('username')?.touched) {
            <mat-error>{{ getUsernameError() }}</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="edit-user-dialog__field">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" />
          @if (form.get('email')?.invalid && form.get('email')?.touched) {
            <mat-error>{{ getEmailError() }}</mat-error>
          }
        </mat-form-field>
        @if (canEditStatus) {
          <mat-form-field appearance="outline" class="edit-user-dialog__field">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Leave blank to keep current" />
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" tabindex="-1" aria-label="Toggle password visibility">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <mat-error>{{ getPasswordError() }}</mat-error>
            }
          </mat-form-field>
        }
        <mat-form-field appearance="outline" class="edit-user-dialog__field">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status" [disabled]="!canEditStatus">
            @for (opt of statusOptions; track opt.value) {
              <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
            }
          </mat-select>
          @if (!canEditStatus) {
            <mat-hint>Your role cannot change user status.</mat-hint>
          }
          @if (form.get('status')?.invalid && form.get('status')?.touched) {
            <mat-error>Status must be ACTIVE, INACTIVE, PENDING, or APPROVED</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-raised-button type="button" mat-dialog-close class="dialog-cancel-btn">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Update</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      mat-dialog-content {
        min-width: 340px;
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
  private readonly fb = inject(FormBuilder);

  readonly statusOptions = STATUS_OPTIONS;
  readonly canEditStatus: boolean;
  hidePassword = true;

  readonly form = this.fb.nonNullable.group({
    username: [this.data.name, [Validators.required, Validators.minLength(4), Validators.maxLength(100)]],
    email: [this.data.email ?? '', [Validators.email, Validators.maxLength(255)]],
    password: ['', [optionalPasswordLength]],
    status: [this.data.status, [Validators.required, Validators.pattern(STATUS_PATTERN)]],
  });

  constructor() {
    this.canEditStatus = this.data.canEditStatus !== false;
    if (!this.canEditStatus) {
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
    if (c?.hasError('minlength')) return 'Password must be at least 6 characters';
    if (c?.hasError('maxlength')) return 'Password must be at most 255 characters';
    return '';
  }

  onUpdate(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const result: EditUserDialogResult = {
      id: this.data.id,
      username: v.username.trim(),
      email: v.email.trim(),
      password: v.password.trim(),
      status: v.status,
      createdDate: this.data.createdDate,
    };
    this.dialogRef.close(result);
  }
}
