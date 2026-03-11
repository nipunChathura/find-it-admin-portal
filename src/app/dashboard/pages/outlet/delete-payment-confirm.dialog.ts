import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface DeletePaymentConfirmData {
  paymentId: number;
  outletName: string;
  amount: number;
}

@Component({
  selector: 'app-delete-payment-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Delete Payment</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete this payment?</p>
      <p><strong>ID:</strong> {{ data.paymentId }} · <strong>Outlet:</strong> {{ data.outletName }} · <strong>Amount:</strong> {{ data.amount | number:'1.2-2' }}</p>
      <p class="delete-payment-confirm__hint">This action cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button mat-dialog-close type="button" class="dialog-cancel-btn">Cancel</button>
      <button mat-raised-button color="warn" (click)="onConfirm()" type="button">Delete</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 320px; margin-bottom: 0.5rem; }
    .delete-payment-confirm__hint { margin-top: 0.5rem; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }
    .dialog-cancel-btn { color: #c62828; }
  `],
})
export class DeletePaymentConfirmDialogComponent {
  readonly data = inject<DeletePaymentConfirmData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DeletePaymentConfirmDialogComponent>);

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
