import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, switchMap, map, takeUntil } from 'rxjs/operators';
import { MerchantRow, MerchantType } from '../../../core/api/admin-merchants.api';
import { AdminMerchantsApiService } from '../../../core/api/admin-merchants.api';

/** Create merchant API body: parentMerchantId null = main merchant, number = sub-merchant. */
export interface AddMerchantDialogResult {
  parentMerchantId: number | null;
  merchantName: string;
  merchantEmail: string;
  merchantAddress: string;
  merchantNic: string;
  merchantPhoneNumber: string;
  merchantProfileImage: string | null;
  merchantType: MerchantType;
  password: string;
  username: string;
}

const MERCHANT_TYPE_OPTIONS = [
  { value: 'FREE', label: 'FREE' },
  { value: 'SILVER', label: 'SILVER' },
  { value: 'GOLD', label: 'GOLD' },
  { value: 'PLATINUM', label: 'PLATINUM' },
  { value: 'DIAMOND', label: 'DIAMOND' },
];

const PARENT_SEARCH_RESULT_LIMIT = 5;

@Component({
  selector: 'app-add-merchant-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
  ],
  template: `
    <h2 mat-dialog-title>Add Merchant</h2>
    <mat-dialog-content>
      <div class="add-merchant-dialog__field add-merchant-dialog__toggle-wrap">
        <label class="add-merchant-dialog__label">Merchant or Sub Merchant</label>
        <mat-button-toggle-group [(ngModel)]="isSubMerchant" name="merchantMode" (ngModelChange)="onMerchantModeChange()">
          <mat-button-toggle [value]="false">Merchant</mat-button-toggle>
          <mat-button-toggle [value]="true">Sub Merchant</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      @if (isSubMerchant) {
        <mat-form-field appearance="outline" class="add-merchant-dialog__field">
          <mat-label>Search Parent Merchant</mat-label>
          <input
            matInput
            [(ngModel)]="parentMerchantSearchText"
            name="parentSearch"
            placeholder="Type to search..."
            [matAutocomplete]="parentAuto"
            (ngModelChange)="onParentSearchChange($event)"
          />
          <mat-autocomplete
            #parentAuto="matAutocomplete"
            (optionSelected)="onParentSelected($event)"
          >
            @for (m of parentSearchResults$ | async; track m.merchantId) {
              <mat-option [value]="m">{{ m.merchantName }}</mat-option>
            }
            @empty {
              @if (parentMerchantSearchText.trim()) {
                <mat-option disabled>No parent merchants found</mat-option>
              }
            }
          </mat-autocomplete>
        </mat-form-field>
      }

      <mat-form-field appearance="outline" class="add-merchant-dialog__field">
        <mat-label>Merchant Name</mat-label>
        <input matInput [(ngModel)]="merchantName" name="merchantName" required />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-merchant-dialog__field">
        <mat-label>Username</mat-label>
        <input matInput [(ngModel)]="username" name="username" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-merchant-dialog__field">
        <mat-label>Password</mat-label>
        <input matInput [type]="hidePassword ? 'password' : 'text'" [(ngModel)]="password" name="password" />
        <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" tabindex="-1" aria-label="Toggle password visibility">
          <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-merchant-dialog__field">
        <mat-label>Email</mat-label>
        <input matInput type="email" [(ngModel)]="merchantEmail" name="merchantEmail" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-merchant-dialog__field">
        <mat-label>NIC</mat-label>
        <input matInput [(ngModel)]="merchantNic" name="merchantNic" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-merchant-dialog__field">
        <mat-label>Phone Number</mat-label>
        <input matInput [(ngModel)]="merchantPhoneNumber" name="merchantPhoneNumber" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-merchant-dialog__field">
        <mat-label>Address</mat-label>
        <input matInput [(ngModel)]="merchantAddress" name="merchantAddress" />
      </mat-form-field>
      <div class="add-merchant-dialog__field add-merchant-dialog__image-block">
        <label class="add-merchant-dialog__label">Merchant profile image (optional)</label>
        <input #addProfileInput type="file" accept="image/*" (change)="onImageSelected($event)" class="add-merchant-dialog__file-input" />
        <button mat-stroked-button type="button" (click)="addProfileInput.click()">Browse</button>
        @if (merchantProfileImage) {
          <div class="add-merchant-dialog__preview-wrap">
            <span class="add-merchant-dialog__preview-label">Selected image:</span>
            <img [src]="merchantProfileImage" alt="Selected" class="add-merchant-dialog__preview-img" />
            <button mat-stroked-button type="button" (click)="clearImage()">Remove image</button>
          </div>
        }
      </div>
      <mat-form-field appearance="outline" class="add-merchant-dialog__field">
        <mat-label>Merchant Type</mat-label>
        <mat-select [(ngModel)]="merchantType" name="merchantType">
          @for (opt of merchantTypeOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button mat-dialog-close type="button" class="dialog-cancel-btn">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" type="button">Save</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content { min-width: 340px; max-height: 70vh; overflow-y: auto; margin-bottom: 0.5rem; }
      .add-merchant-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }
      .add-merchant-dialog__toggle-wrap .add-merchant-dialog__label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }
      mat-dialog-actions { padding-top: 0.5rem; gap: 0.5rem; }
      mat-dialog-actions button { border: 1px solid var(--mat-sys-outline-variant); }
      .dialog-cancel-btn { color: #c62828; }
      .add-merchant-dialog__image-block .add-merchant-dialog__label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }
      .add-merchant-dialog__file-input { display: none; }
      .add-merchant-dialog__preview-wrap { margin-top: 0.75rem; }
      .add-merchant-dialog__preview-label { display: block; font-size: 0.875rem; margin-bottom: 0.25rem; }
      .add-merchant-dialog__preview-img { max-width: 160px; max-height: 120px; object-fit: contain; display: block; margin-bottom: 0.5rem; border-radius: 4px; }
    `,
  ],
})
export class AddMerchantDialogComponent implements OnInit, OnDestroy {
  private readonly dialogRef = inject(MatDialogRef<AddMerchantDialogComponent>);
  private readonly merchantsApi = inject(AdminMerchantsApiService);
  private readonly destroy$ = new Subject<void>();
  private readonly parentSearchTerm$ = new Subject<string>();

  readonly merchantTypeOptions = MERCHANT_TYPE_OPTIONS;

  isSubMerchant = false;
  parentMerchantSearchText = '';
  parentSearchResults$!: Observable<MerchantRow[]>;

  merchantName = '';
  username = '';
  password = '';
  merchantEmail = '';
  merchantNic = '';
  merchantProfileImage = '';
  merchantAddress = '';
  merchantPhoneNumber = '';
  merchantType: MerchantType = 'FREE';
  parentMerchantName = '';
  parentMerchantId: number | null = null;
  hidePassword = true;

  ngOnInit(): void {
    this.parentSearchResults$ = this.parentSearchTerm$.pipe(
      debounceTime(250),
      switchMap((q) => {
        const term = (q ?? '').trim();
        if (!term) return of([]);
        return this.merchantsApi.getMerchants({ search: term }).pipe(
          map((list) =>
            list
              .filter((m) => !(m.parentMerchantName ?? '').trim())
              .slice(0, PARENT_SEARCH_RESULT_LIMIT)
          )
        );
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMerchantModeChange(): void {
    if (!this.isSubMerchant) {
      this.parentMerchantSearchText = '';
      this.parentMerchantName = '';
      this.parentMerchantId = null;
    }
  }

  onParentSearchChange(value: string): void {
    this.parentSearchTerm$.next(value ?? '');
  }

  onParentSelected(event: { option: { value: MerchantRow } }): void {
    const m = event.option?.value;
    if (m) {
      this.parentMerchantId = m.merchantId;
      this.parentMerchantName = m.merchantName ?? '';
      this.parentMerchantSearchText = this.parentMerchantName;
    }
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

  onSave(): void {
    const profileImage = (this.merchantProfileImage || '').trim();
    this.dialogRef.close({
      parentMerchantId: this.isSubMerchant ? this.parentMerchantId : null,
      merchantName: this.merchantName.trim(),
      merchantEmail: this.merchantEmail.trim(),
      merchantAddress: this.merchantAddress.trim(),
      merchantNic: this.merchantNic.trim(),
      merchantPhoneNumber: this.merchantPhoneNumber.trim(),
      merchantProfileImage: profileImage || null,
      merchantType: this.merchantType,
      password: this.password || '',
      username: this.username.trim(),
    });
  }
}
