import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { UpdateCustomerBody } from '../../../core/api/admin-customers.api';

export interface EditCustomerDialogData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  membershipType: string;
  status: string;
  nic: string;
  dob: string;
  gender: string;
  country: string;
}

/** Result matches UpdateCustomerBody for PUT (profileImage sent as null). */
export interface EditCustomerDialogResult extends UpdateCustomerBody {
  id: number;
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'PENDING', label: 'PENDING' },
];

const MEMBERSHIP_OPTIONS = [
  { value: 'SILVER', label: 'SILVER' },
  { value: 'GOLD', label: 'GOLD' },
  { value: 'PLATINUM', label: 'PLATINUM' },
];

const GENDER_OPTIONS = [
  { value: '', label: '—' },
  { value: 'MALE', label: 'MALE' },
  { value: 'FEMALE', label: 'FEMALE' },
  { value: 'OTHER', label: 'OTHER' },
];

@Component({
  selector: 'app-edit-customer-dialog',
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
    <h2 mat-dialog-title>Edit Customer</h2>
    <mat-dialog-content>
      <p class="edit-customer-dialog__readonly"><strong>ID:</strong> {{ data.id }}</p>
      <mat-form-field appearance="outline" class="edit-customer-dialog__field">
        <mat-label>First name</mat-label>
        <input matInput [(ngModel)]="firstName" name="firstName" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-customer-dialog__field">
        <mat-label>Last name</mat-label>
        <input matInput [(ngModel)]="lastName" name="lastName" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-customer-dialog__field">
        <mat-label>Email</mat-label>
        <input matInput type="email" [(ngModel)]="email" name="email" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-customer-dialog__field">
        <mat-label>Phone number</mat-label>
        <input matInput [(ngModel)]="phoneNumber" name="phoneNumber" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-customer-dialog__field">
        <mat-label>NIC</mat-label>
        <input matInput [(ngModel)]="nic" name="nic" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-customer-dialog__field">
        <mat-label>Date of birth</mat-label>
        <input matInput [(ngModel)]="dob" name="dob" placeholder="YYYY-MM-DD" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-customer-dialog__field">
        <mat-label>Gender</mat-label>
        <mat-select [(ngModel)]="gender" name="gender">
          @for (opt of genderOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-customer-dialog__field">
        <mat-label>Country</mat-label>
        <input matInput [(ngModel)]="country" name="country" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-customer-dialog__field">
        <mat-label>Membership</mat-label>
        <mat-select [(ngModel)]="membershipType" name="membershipType">
          @for (opt of membershipOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="edit-customer-dialog__field">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="status" name="status">
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
      mat-dialog-content {
        min-width: 320px;
        max-height: 70vh;
        overflow-y: auto;
        margin-bottom: 0.5rem;
      }
      .edit-customer-dialog__readonly {
        margin: 0 0 1rem 0;
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .edit-customer-dialog__field {
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
export class EditCustomerDialogComponent {
  readonly data: EditCustomerDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditCustomerDialogComponent>);

  readonly statusOptions = STATUS_OPTIONS;
  readonly membershipOptions = MEMBERSHIP_OPTIONS;
  readonly genderOptions = GENDER_OPTIONS;

  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nic: string;
  dob: string;
  gender: string;
  country: string;
  membershipType: string;
  status: string;

  constructor() {
    this.firstName = this.data.firstName ?? '';
    this.lastName = this.data.lastName ?? '';
    this.email = this.data.email ?? '';
    this.phoneNumber = this.data.phoneNumber ?? '';
    this.nic = this.data.nic ?? '';
    this.dob = this.data.dob ?? '';
    this.gender = this.data.gender ?? '';
    this.country = this.data.country ?? '';
    this.membershipType = this.data.membershipType ?? '';
    this.status = this.data.status ?? 'ACTIVE';
  }

  onUpdate(): void {
    const result: EditCustomerDialogResult = {
      id: this.data.id,
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      nic: this.nic.trim() || null,
      dob: this.dob.trim() || null,
      gender: this.gender.trim() || null,
      country: this.country.trim() || null,
      profileImage: null,
      email: this.email.trim(),
      phoneNumber: this.phoneNumber.trim(),
      membershipType: this.membershipType.trim() || 'SILVER',
      status: this.status,
    };
    this.dialogRef.close(result);
  }
}
