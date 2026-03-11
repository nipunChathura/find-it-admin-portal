import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CreatePaymentBody, PaymentRow } from '../../../core/api/admin-payments.api';
import { ImagesUploadApiService } from '../../../core/api/images-upload.api';
import { ApiImageComponent } from '../../../shared/api-image/api-image.component';

export interface EditPaymentDialogData {
  payment: PaymentRow;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'PENDING' },
  { value: 'PAID', label: 'PAID' },
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
    ApiImageComponent,
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
      <div class="edit-payment-dialog__field edit-payment-dialog__receipt-block">
        <label class="edit-payment-dialog__receipt-label">Receipt image</label>
        <input #receiptFileInput type="file" accept="image/*" (change)="onReceiptImageSelected($event)" class="edit-payment-dialog__file-input" />
        <div class="edit-payment-dialog__receipt-actions">
          <button mat-stroked-button type="button" (click)="receiptFileInput.click()">Select new image</button>
          @if (selectedReceiptFile) {
            <button mat-stroked-button type="button" (click)="clearReceiptImage()">Remove new image</button>
          }
        </div>
        @if (receiptImageDisplay()) {
          <div class="edit-payment-dialog__receipt-preview">
            <span class="edit-payment-dialog__receipt-preview-label">{{ selectedReceiptFile ? 'New image:' : 'Current image:' }}</span>
            @if (selectedReceiptFile) {
              <img [src]="receiptImagePreview" alt="Receipt preview" class="edit-payment-dialog__receipt-img" />
            } @else {
              <app-api-image type="receipt" [pathOrFileName]="receiptImage" alt="Receipt" imgClass="edit-payment-dialog__receipt-img" />
            }
          </div>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" class="dialog-cancel-btn" (click)="onCancel()" [disabled]="saving">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" type="button" [disabled]="saving">{{ saving ? 'Uploading...' : 'Update' }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .edit-payment-dialog__content { min-width: 360px; }
    .edit-payment-dialog__id { margin: 0 0 1rem 0; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }
    .edit-payment-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }
    .edit-payment-dialog__receipt-block .edit-payment-dialog__receipt-label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }
    .edit-payment-dialog__file-input { display: none; }
    .edit-payment-dialog__receipt-actions { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap; }
    .edit-payment-dialog__receipt-preview { margin-top: 0.5rem; }
    .edit-payment-dialog__receipt-preview-label { display: block; font-size: 0.875rem; margin-bottom: 0.25rem; }
    .edit-payment-dialog__receipt-img { max-width: 200px; max-height: 140px; object-fit: contain; display: block; border-radius: 4px; border: 1px solid var(--mat-sys-outline-variant); }
  `],
})
export class EditPaymentDialogComponent {
  readonly data = inject<EditPaymentDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditPaymentDialogComponent>);
  private readonly imagesUploadApi = inject(ImagesUploadApiService);

  readonly statusOptions = STATUS_OPTIONS;
  readonly typeOptions = TYPE_OPTIONS;

  amount: number;
  paymentType: string;
  paidMonth: string;
  paymentDate: string;
  paymentStatus: string;
  /** Stored receipt path (from payment); used for display via API and for save when no new file. */
  receiptImage: string;
  /** Data URL when user selects a new file (preview only). */
  receiptImagePreview = '';
  selectedReceiptFile: File | null = null;
  saving = false;

  constructor() {
    const p = this.data.payment;
    this.amount = p.amount ?? 0;
    this.paymentType = p.paymentType ?? 'SUBSCRIPTION';
    this.paidMonth = p.paidMonth ?? '';
    this.paymentDate = p.paymentDate ?? '';
    this.paymentStatus = p.paymentStatus ?? 'PENDING';
    this.receiptImage = p.receiptImage ?? '';
  }

  receiptImageDisplay(): boolean {
    return this.receiptImage.trim() !== '' || this.receiptImagePreview !== '' || this.selectedReceiptFile !== null;
  }

  onReceiptImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    this.selectedReceiptFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.receiptImagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  clearReceiptImage(): void {
    this.selectedReceiptFile = null;
    this.receiptImagePreview = '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const buildBody = (receiptValue: string | null) => ({
      outletId: this.data.payment.outletId,
      paymentType: this.paymentType,
      amount: Number(this.amount),
      paymentDate: this.paymentDate.trim(),
      paidMonth: this.paidMonth.trim(),
      receiptImage: receiptValue,
      status: this.paymentStatus,
    });
    if (this.selectedReceiptFile) {
      this.saving = true;
      this.imagesUploadApi.upload(this.selectedReceiptFile, 'receipt').subscribe({
        next: (res) => {
          this.saving = false;
          const path = res?.relativePath || res?.fileName || null;
          this.dialogRef.close(buildBody(path));
        },
        error: () => { this.saving = false; },
      });
    } else {
      const receipt = this.receiptImage.trim();
      this.dialogRef.close(buildBody(receipt === '' ? null : receipt));
    }
  }
}
