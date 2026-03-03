import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MerchantRow, MerchantType } from '../../../core/api/admin-merchants.api';

export interface EditMerchantDialogData extends MerchantRow {}

export type EditMerchantDialogResult = Partial<MerchantRow> & { merchantId: number };

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

const MERCHANT_TYPE_OPTIONS = [
  { value: 'FREE', label: 'FREE' },
  { value: 'SILVER', label: 'SILVER' },
  { value: 'GOLD', label: 'GOLD' },
  { value: 'PLATINUM', label: 'PLATINUM' },
  { value: 'DIAMOND', label: 'DIAMOND' },
];

@Component({
  selector: 'app-edit-merchant-dialog',
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
    <h2 mat-dialog-title>Edit Merchant</h2>
    <mat-dialog-content>
      <p class="edit-merchant-dialog__readonly">
        <strong>ID:</strong> {{ data.merchantId }}
      </p>
      <mat-form-field appearance="outline" class="edit-merchant-dialog__field">
        <mat-label>Merchant Name</mat-label>
        <input matInput [(ngModel)]="merchantName" name="merchantName" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-merchant-dialog__field">
        <mat-label>Username</mat-label>
        <input matInput [(ngModel)]="username" name="username" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-merchant-dialog__field">
        <mat-label>Email</mat-label>
        <input matInput type="email" [(ngModel)]="merchantEmail" name="merchantEmail" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-merchant-dialog__field">
        <mat-label>NIC</mat-label>
        <input matInput [(ngModel)]="merchantNic" name="merchantNic" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-merchant-dialog__field">
        <mat-label>Phone Number</mat-label>
        <input matInput [(ngModel)]="merchantPhoneNumber" name="merchantPhoneNumber" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-merchant-dialog__field">
        <mat-label>Address</mat-label>
        <input matInput [(ngModel)]="merchantAddress" name="merchantAddress" />
      </mat-form-field>
      <div class="edit-merchant-dialog__field edit-merchant-dialog__image-block">
        <label class="edit-merchant-dialog__label">Merchant profile image</label>
        <input #editProfileInput type="file" accept="image/*" (change)="onImageSelected($event)" class="edit-merchant-dialog__file-input" />
        <div class="edit-merchant-dialog__preview-actions">
          <button mat-stroked-button type="button" (click)="editProfileInput.click()">Change image</button>
          <button mat-stroked-button type="button" (click)="clearImage()">Remove image</button>
        </div>
        @if (merchantProfileImage) {
          <div class="edit-merchant-dialog__preview-wrap">
            <span class="edit-merchant-dialog__preview-label">Current image:</span>
            <img [src]="merchantProfileImage" alt="Profile" class="edit-merchant-dialog__preview-img" />
          </div>
        } @else {
          <p class="edit-merchant-dialog__no-image">No image. Use the file input above to add one.</p>
        }
      </div>
      <mat-form-field appearance="outline" class="edit-merchant-dialog__field">
        <mat-label>Merchant Type</mat-label>
        <mat-select [(ngModel)]="merchantType" name="merchantType">
          @for (opt of merchantTypeOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-merchant-dialog__field">
        <mat-label>Parent Merchant Name</mat-label>
        <input matInput [(ngModel)]="parentMerchantName" name="parentMerchantName" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-merchant-dialog__field">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="merchantStatus" name="merchantStatus">
          @for (opt of statusOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button mat-dialog-close type="button" class="dialog-cancel-btn">Cancel</button>
      <button mat-raised-button color="primary" (click)="onUpdate()" type="button">Update</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content { min-width: 340px; max-height: 70vh; overflow-y: auto; margin-bottom: 0.5rem; }
      .edit-merchant-dialog__readonly { margin: 0 0 1rem 0; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }
      .edit-merchant-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }
      mat-dialog-actions { padding-top: 0.5rem; gap: 0.5rem; }
      mat-dialog-actions button { border: 1px solid var(--mat-sys-outline-variant); }
      .dialog-cancel-btn { color: #c62828; }
      .edit-merchant-dialog__image-block .edit-merchant-dialog__label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }
      .edit-merchant-dialog__file-input { display: none; }
      .edit-merchant-dialog__preview-actions { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
      .edit-merchant-dialog__preview-wrap { margin-top: 0.5rem; }
      .edit-merchant-dialog__preview-label { display: block; font-size: 0.875rem; margin-bottom: 0.25rem; }
      .edit-merchant-dialog__preview-img { max-width: 160px; max-height: 120px; object-fit: contain; display: block; border-radius: 4px; }
      .edit-merchant-dialog__no-image { font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); margin: 0.5rem 0 0 0; }
    `,
  ],
})
export class EditMerchantDialogComponent {
  readonly data: EditMerchantDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditMerchantDialogComponent>);

  readonly statusOptions = STATUS_OPTIONS;
  readonly merchantTypeOptions = MERCHANT_TYPE_OPTIONS;

  merchantName: string;
  username: string;
  merchantEmail: string;
  merchantNic: string;
  merchantProfileImage: string;
  merchantAddress: string;
  merchantPhoneNumber: string;
  merchantType: MerchantType;
  merchantStatus: string;
  parentMerchantName: string;

  constructor() {
    this.merchantName = this.data.merchantName ?? '';
    this.username = this.data.username ?? '';
    this.merchantEmail = this.data.merchantEmail ?? '';
    this.merchantNic = this.data.merchantNic ?? '';
    this.merchantProfileImage = this.data.merchantProfileImage ?? '';
    this.merchantAddress = this.data.merchantAddress ?? '';
    this.merchantPhoneNumber = this.data.merchantPhoneNumber ?? '';
    this.merchantType = this.data.merchantType ?? 'FREE';
    this.merchantStatus = this.data.merchantStatus ?? 'ACTIVE';
    this.parentMerchantName = this.data.parentMerchantName ?? '';
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.merchantProfileImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  clearImage(): void {
    this.merchantProfileImage = '';
  }

  onUpdate(): void {
    this.dialogRef.close({
      merchantId: this.data.merchantId,
      merchantName: this.merchantName.trim(),
      username: this.username.trim(),
      merchantEmail: this.merchantEmail.trim(),
      merchantNic: this.merchantNic.trim(),
      merchantProfileImage: this.merchantProfileImage.trim(),
      merchantAddress: this.merchantAddress.trim(),
      merchantPhoneNumber: this.merchantPhoneNumber.trim(),
      merchantType: this.merchantType,
      merchantStatus: this.merchantStatus,
      parentMerchantName: this.parentMerchantName.trim(),
    });
  }
}
