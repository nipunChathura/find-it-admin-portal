import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CreatePaymentBody } from '../../../core/api/admin-payments.api';
import { AdminOutletsApiService } from '../../../core/api/admin-outlets.api';

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
  selector: 'app-add-payment-dialog',
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
    <h2 mat-dialog-title>Add Payment</h2>
    <mat-dialog-content class="add-payment-dialog__content">
      <mat-form-field appearance="outline" class="add-payment-dialog__field">
        <mat-label>Outlet</mat-label>
        <mat-select [(ngModel)]="outletId" name="outletId" required>
          @for (opt of outletOptions; track opt.outletId) {
            <mat-option [value]="opt.outletId">{{ opt.outletName }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-payment-dialog__field">
        <mat-label>Amount</mat-label>
        <input matInput type="number" [(ngModel)]="amount" name="amount" min="0" step="0.01" required />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-payment-dialog__field">
        <mat-label>Payment type</mat-label>
        <mat-select [(ngModel)]="paymentType" name="paymentType">
          @for (opt of typeOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-payment-dialog__field">
        <mat-label>Paid month</mat-label>
        <input matInput [(ngModel)]="paidMonth" name="paidMonth" placeholder="YYYY-MM" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-payment-dialog__field">
        <mat-label>Payment date</mat-label>
        <input matInput [(ngModel)]="paymentDate" name="paymentDate" placeholder="YYYY-MM-DD" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-payment-dialog__field">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="paymentStatus" name="paymentStatus">
          @for (opt of statusOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-payment-dialog__field">
        <mat-label>Receipt image</mat-label>
        <input matInput [(ngModel)]="receiptImage" name="receiptImage" placeholder="Optional" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close type="button">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" type="button" [disabled]="outletId == null">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .add-payment-dialog__content { min-width: 360px; }
    .add-payment-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }
  `],
})
export class AddPaymentDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AddPaymentDialogComponent>);
  private readonly adminOutletsApi = inject(AdminOutletsApiService);

  readonly statusOptions = STATUS_OPTIONS;
  readonly typeOptions = TYPE_OPTIONS;
  outletOptions: { outletId: number; outletName: string }[] = [];

  outletId: number | null = null;
  amount = 0;
  paymentType = 'SUBSCRIPTION';
  paidMonth = '';
  paymentDate = '';
  paymentStatus = 'PENDING';
  receiptImage = '';

  constructor() {
    this.adminOutletsApi.getOutlets({}).subscribe({
      next: (items) => {
        this.outletOptions = items.map((i) => ({ outletId: i.row.outletId, outletName: i.row.outletName }));
      },
      error: () => {
        this.outletOptions = [];
      },
    });
  }

  onSave(): void {
    if (this.outletId == null) return;
    const body: CreatePaymentBody = {
      outletId: this.outletId,
      paymentType: this.paymentType,
      amount: Number(this.amount),
      paymentDate: this.paymentDate.trim(),
      paidMonth: this.paidMonth.trim(),
      receiptImage: this.receiptImage.trim() || undefined,
      status: this.paymentStatus,
    };
    this.dialogRef.close(body);
  }
}
