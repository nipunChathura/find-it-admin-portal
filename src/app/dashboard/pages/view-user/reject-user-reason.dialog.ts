import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface RejectUserReasonDialogData {
  userName: string;
}

@Component({
  selector: 'app-reject-user-reason-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Reject User</h2>
    <mat-dialog-content>
      <p class="reject-user-reason-dialog__intro">Rejecting <strong>{{ data.userName }}</strong>. Please enter the reason.</p>
      <mat-form-field appearance="outline" class="reject-user-reason-dialog__field">
        <mat-label>Reject reason</mat-label>
        <textarea
          matInput
          [(ngModel)]="reason"
          name="reason"
          rows="4"
          placeholder="Enter reason for rejection..."
          required
        ></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button type="button" mat-dialog-close class="dialog-cancel-btn">Cancel</button>
      <button mat-raised-button color="warn" type="button" (click)="onReject()" [disabled]="!reason.trim()">Reject</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content { min-width: 360px; margin-bottom: 0.5rem; }
      .reject-user-reason-dialog__intro { margin: 0 0 1rem 0; font-size: 0.9375rem; color: var(--mat-sys-on-surface-variant); }
      .reject-user-reason-dialog__field { width: 100%; display: block; }
      mat-dialog-actions { padding-top: 0.5rem; gap: 0.5rem; }
      mat-dialog-actions button { border: 1px solid var(--mat-sys-outline-variant); }
      .dialog-cancel-btn { color: #c62828; }
    `,
  ],
})
export class RejectUserReasonDialogComponent {
  readonly data: RejectUserReasonDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<RejectUserReasonDialogComponent>);

  reason = '';

  onReject(): void {
    const trimmed = this.reason?.trim();
    if (!trimmed) return;
    this.dialogRef.close(trimmed);
  }
}
