import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CreatePaymentBody, PaymentRow } from '../../../core/api/admin-payments.api';

export interface EditPaymentDialogData {
  payment: PaymentRow;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'PENDING' },
  { value: 'PAID', label: 'PAID' },
  { value: 'FAILED', label: 'FAILED' },
];

const TYPE_OPTIONS = [
  { value: 'SUBSCRIPTION', label: 'SUBSCRIPTION' },
  { value: 'OTHER', label: 'OTHER' },
];

@Component({
  selector: 'app-edit-payment-dialog',
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
    <h2 mat-dialog-title>Edit Payment</h2>
    <mat-dialog-content class="edit-payment-dialog__content">
      <p class="edit-payment-dialog__id">ID: {{ data.payment.paymentId }} · Outlet: {{ data.payment.outletName }}</p>
      <mat-form-field appearance="outline" class="edit-payment-dialog__field">
        <mat-label>Amount</mat-label>
        <input matInput type="number" [(ngModel)]="amount" name="amount" min="0" step="0.01" required />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-payment-dialog__field">
        <mat-label>Payment type</mat-label>
        <mat-select [(ngModel)]="paymentType" name="paymentType">
          @for (opt of typeOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-payment-dialog__field">
        <mat-label>Paid month</mat-label>
        <input matInput [(ngModel)]="paidMonth" name="paidMonth" placeholder="YYYY-MM" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-payment-dialog__field">
        <mat-label>Payment date</mat-label>
        <input matInput [(ngModel)]="paymentDate" name="paymentDate" placeholder="YYYY-MM-DD" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-payment-dialog__field">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="paymentStatus" name="paymentStatus">
          @for (opt of statusOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-payment-dialog__field">
        <mat-label>Receipt image</mat-label>
        <input matInput [(ngModel)]="receiptImage" name="receiptImage" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close type="button">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" type="button">Update</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .edit-payment-dialog__content { min-width: 360px; }
    .edit-payment-dialog__id { margin: 0 0 1rem 0; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }
    .edit-payment-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }
  `],
})
export class EditPaymentDialogComponent {
  readonly data = inject<EditPaymentDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditPaymentDialogComponent>);

  readonly statusOptions = STATUS_OPTIONS;
  readonly typeOptions = TYPE_OPTIONS;

  amount: number;
  paymentType: string;
  paidMonth: string;
  paymentDate: string;
  paymentStatus: string;
  receiptImage: string;

  constructor() {
    const p = this.data.payment;
    this.amount = p.amount ?? 0;
    this.paymentType = p.paymentType ?? 'SUBSCRIPTION';
    this.paidMonth = p.paidMonth ?? '';
    this.paymentDate = p.paymentDate ?? '';
    this.paymentStatus = p.paymentStatus ?? 'PENDING';
    this.receiptImage = p.receiptImage ?? '';
  }

  onSave(): void {
    const receipt = this.receiptImage.trim();
    const body: CreatePaymentBody = {
      outletId: this.data.payment.outletId,
      paymentType: this.paymentType,
      amount: Number(this.amount),
      paymentDate: this.paymentDate.trim(),
      paidMonth: this.paidMonth.trim(),
      receiptImage: receipt === '' ? null : receipt,
      status: this.paymentStatus,
    };
    this.dialogRef.close(body);
  }
}
