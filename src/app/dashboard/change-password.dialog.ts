import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Change password</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Current password</mat-label>
          <input matInput type="password" formControlName="currentPassword" autocomplete="current-password" />
          @if (form.get('currentPassword')?.invalid && form.get('currentPassword')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>New password</mat-label>
          <input matInput type="password" formControlName="newPassword" autocomplete="new-password" />
          @if (form.get('newPassword')?.invalid && form.get('newPassword')?.touched) {
            <mat-error>Required (min 6 characters)</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirm new password</mat-label>
          <input matInput type="password" formControlName="confirmPassword" autocomplete="new-password" />
          @if (form.get('confirmPassword')?.invalid && form.get('confirmPassword')?.touched) {
            <mat-error>{{ form.errors?.['mismatch'] ? 'Passwords do not match' : 'Required' }}</mat-error>
          }
        </mat-form-field>
      </form>
      @if (message) {
        <p class="change-password__message" [class.error]="isError">{{ message }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close type="button">Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid" type="button">Change password</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    .change-password__message { font-size: 0.875rem; margin-top: 0.5rem; }
    .change-password__message.error { color: var(--mat-sys-error); }
  `],
})
export class ChangePasswordDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ChangePasswordDialogComponent>);
  private readonly fb = inject(FormBuilder);

  form: FormGroup = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: this.passwordMatchValidator });

  message = '';
  isError = false;

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const g = control as FormGroup;
    const newP = g.get('newPassword')?.value;
    const confirm = g.get('confirmPassword')?.value;
    return newP && confirm && newP !== confirm ? { mismatch: true } : null;
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const current = this.form.get('currentPassword')?.value;
    const newP = this.form.get('newPassword')?.value;
    // TODO: call API to change password (e.g. PUT /users/me/password)
    this.message = 'Password change requested. Connect an API to complete.';
    this.isError = false;
    // this.dialogRef.close(true);
  }
}
