import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CreatePaymentBody } from '../../../core/api/admin-payments.api';
import { AdminOutletsApiService } from '../../../core/api/admin-outlets.api';
import { ImagesUploadApiService } from '../../../core/api/images-upload.api';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'PENDING' },
  { value: 'PAID', label: 'PAID' },
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
        <input matInput [(ngModel)]="paymentDate" name="paymentDate" readonly disabled />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-payment-dialog__field">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="paymentStatus" name="paymentStatus">
          @for (opt of statusOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <div class="add-payment-dialog__field add-payment-dialog__receipt-block">
        <label class="add-payment-dialog__receipt-label">Receipt image <span class="add-payment-dialog__required">*</span></label>
        <input #receiptFileInput type="file" accept="image/*" (change)="onReceiptImageSelected($event)" class="add-payment-dialog__file-input" />
        <button mat-stroked-button type="button" (click)="receiptFileInput.click()">Browse</button>
        @if (receiptImage) {
          <div class="add-payment-dialog__receipt-preview">
            <span class="add-payment-dialog__receipt-preview-label">Selected image:</span>
            <img [src]="receiptImage" alt="Receipt preview" class="add-payment-dialog__receipt-img" />
            <button mat-stroked-button type="button" (click)="clearReceiptImage()">Remove image</button>
          </div>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="onCancel()" [disabled]="saving">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" type="button" [disabled]="outletId == null || !receiptImage.trim() || saving">{{ saving ? 'Uploading...' : 'Save' }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .add-payment-dialog__content { min-width: 360px; }
    .add-payment-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }
    .add-payment-dialog__receipt-block .add-payment-dialog__receipt-label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }
    .add-payment-dialog__file-input { display: none; }
    .add-payment-dialog__receipt-preview { margin-top: 0.75rem; }
    .add-payment-dialog__receipt-preview-label { display: block; font-size: 0.875rem; margin-bottom: 0.25rem; }
    .add-payment-dialog__receipt-img { max-width: 200px; max-height: 140px; object-fit: contain; display: block; margin-bottom: 0.5rem; border-radius: 4px; border: 1px solid var(--mat-sys-outline-variant); }
    .add-payment-dialog__required { color: var(--mat-sys-error, #b3261e); }
  `],
})
export class AddPaymentDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AddPaymentDialogComponent>);
  private readonly adminOutletsApi = inject(AdminOutletsApiService);
  private readonly imagesUploadApi = inject(ImagesUploadApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly statusOptions = STATUS_OPTIONS;
  readonly typeOptions = TYPE_OPTIONS;
  outletOptions: { outletId: number; outletName: string }[] = [];

  outletId: number | null = null;
  amount = 0;
  paymentType = 'SUBSCRIPTION';
  paidMonth = '';
  paymentDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  paymentStatus = 'PENDING';
  receiptImage = '';
  /** Selected file for upload; receiptImage is data URL for preview. */
  selectedReceiptFile: File | null = null;
  saving = false;

  constructor() {
    this.adminOutletsApi.getOutlets({}).subscribe({
      next: (items) => {
        this.outletOptions = items.map((i) => ({ outletId: i.row.outletId, outletName: i.row.outletName }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.outletOptions = [];
        this.cdr.detectChanges();
      },
    });
  }

  onReceiptImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    this.selectedReceiptFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.receiptImage = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  clearReceiptImage(): void {
    this.receiptImage = '';
    this.selectedReceiptFile = null;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.outletId == null || !this.receiptImage.trim() || !this.selectedReceiptFile) return;
    this.saving = true;
    this.imagesUploadApi.upload(this.selectedReceiptFile, 'receipt').subscribe({
      next: (res) => {
        this.saving = false;
        const imageValue = res?.relativePath || res?.fileName || '';
        const body: CreatePaymentBody = {
          outletId: this.outletId!,
          paymentType: this.paymentType,
          amount: Number(this.amount),
          paymentDate: this.paymentDate.trim(),
          paidMonth: this.paidMonth.trim(),
          receiptImage: imageValue,
          status: this.paymentStatus,
        };
        this.dialogRef.close(body);
      },
      error: () => {
        this.saving = false;
      },
    });
  }
}
