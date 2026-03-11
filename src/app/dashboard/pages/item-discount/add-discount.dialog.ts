import { Component, inject, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { CreateDiscountBody } from '../../../core/api/admin-discounts.api';
import { AdminItemsApiService } from '../../../core/api/admin-items.api';
import { AdminOutletsApiService } from '../../../core/api/admin-outlets.api';
import { ImagesUploadApiService } from '../../../core/api/images-upload.api';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'PERCENTAGE', label: 'PERCENTAGE' },
  { value: 'FIXED_AMOUNT', label: 'FIXED_AMOUNT' },
];

@Component({
  selector: 'app-add-discount-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <h2 mat-dialog-title>Add discount</h2>
    <mat-dialog-content class="add-discount-dialog__content">
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
        <mat-label>Discount name</mat-label>
        <input matInput [(ngModel)]="discountName" name="discountName" required />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
        <mat-label>Type</mat-label>
        <mat-select [(ngModel)]="discountType" name="discountType">
          @for (opt of discountTypeOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
        <mat-label>Value</mat-label>
        <input matInput type="number" [(ngModel)]="discountValue" name="discountValue" min="0" step="0.01" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
        <mat-label>Start date</mat-label>
        <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDateModel" name="startDate" />
        <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
        <mat-datepicker #startPicker></mat-datepicker>
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
        <mat-label>End date</mat-label>
        <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDateModel" name="endDate" />
        <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
        <mat-datepicker #endPicker></mat-datepicker>
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="status" name="status">
          @for (opt of statusOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
        <mat-label>Outlet</mat-label>
        <input
          matInput
          [(ngModel)]="outletSearchText"
          name="outletSearch"
          placeholder="Search outlet..."
          [matAutocomplete]="outletAutocomplete"
          [disabled]="itemIds.length > 0"
        />
        <mat-autocomplete
          #outletAutocomplete="matAutocomplete"
          [displayWith]="outletDisplayName"
          (optionSelected)="onOutletSelected($event.option.value)"
        >
          @for (opt of filteredOutletOptions; track opt.outletId) {
            <mat-option [value]="opt">{{ opt.outletName }}</mat-option>
          }
          @empty {
            @if (outletSearchText.trim()) {
              <mat-option disabled>No outlets match</mat-option>
            }
          }
        </mat-autocomplete>
        <mat-hint>{{ selectedOutletId != null ? 'Selected outlet: ' + selectedOutletName : 'Select outlet first, then items for that outlet will load.' }}</mat-hint>
      </mat-form-field>
      <div class="add-discount-dialog__field add-discount-dialog__image-wrap">
        <label class="add-discount-dialog__image-label">Discount image (optional)</label>
        <input type="file" accept="image/*" (change)="onImageSelected($event)" class="add-discount-dialog__file-input" #addImageInput />
        <button mat-stroked-button type="button" (click)="addImageInput.click()">Select image</button>
        @if (discountImage) {
          <div class="add-discount-dialog__preview">
            <span class="add-discount-dialog__preview-label">Selected image:</span>
            <img [src]="discountImage" alt="Discount preview" class="add-discount-dialog__preview-img" />
            <button mat-button type="button" (click)="clearImage()">Remove image</button>
          </div>
        }
      </div>
      <mat-form-field appearance="outline" class="add-discount-dialog__field">
        <mat-label>Items</mat-label>
        <input
          matInput
          [(ngModel)]="itemSearchText"
          name="itemSearch"
          placeholder="Search by item name..."
          [matAutocomplete]="itemAutocomplete"
          [disabled]="selectedOutletId == null"
        />
        <mat-autocomplete
          #itemAutocomplete="matAutocomplete"
          [displayWith]="itemDisplayName"
          (optionSelected)="onItemSelected($event.option.value)"
        >
          @for (item of filteredItemOptions; track item.id) {
            <mat-option [value]="item">{{ item.name }}</mat-option>
          }
          @empty {
            @if (itemSearchText.trim()) {
              <mat-option disabled>No items match "{{ itemSearchText }}"</mat-option>
            }
          }
        </mat-autocomplete>
        <mat-hint>Select outlet first. Then search by item name and select to add.</mat-hint>
      </mat-form-field>
      @if (selectedItemsForDisplay.length > 0) {
        <div class="add-discount-dialog__selected-items">
          <span class="add-discount-dialog__selected-label">Selected items:</span>
          <div class="add-discount-dialog__cards">
            @for (item of selectedItemsForDisplay; track item.id) {
              <div class="add-discount-dialog__card">
                <span class="add-discount-dialog__card-name">{{ item.name }}</span>
                <button mat-icon-button type="button" class="add-discount-dialog__card-remove" (click)="removeItem(item.id)" aria-label="Remove">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            }
          </div>
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="onCancel()" [disabled]="saving">Cancel</button>
      <button mat-raised-button color="primary" type="button" (click)="onSave()" [disabled]="!discountName.trim() || saving">{{ saving ? 'Uploading...' : 'Add' }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .add-discount-dialog__content { min-width: 360px; }
    .add-discount-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }
    .add-discount-dialog__image-wrap { margin-top: 0.5rem; }
    .add-discount-dialog__image-label { display: block; font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); margin-bottom: 0.25rem; }
    .add-discount-dialog__file-input { display: none; }
    .add-discount-dialog__preview { margin-top: 0.5rem; }
    .add-discount-dialog__preview-label { display: block; font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); margin-bottom: 0.25rem; }
    .add-discount-dialog__preview-img { max-width: 160px; max-height: 120px; object-fit: contain; border-radius: 8px; border: 1px solid var(--mat-sys-outline-variant); display: block; margin-bottom: 0.25rem; }
    .add-discount-dialog__selected-items { margin-top: 0.5rem; }
    .add-discount-dialog__selected-label { display: block; font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); margin-bottom: 0.25rem; }
    .add-discount-dialog__cards { display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .add-discount-dialog__card { display: flex; align-items: center; justify-content: space-between; gap: 0.35rem; padding: 0.3rem 0.5rem; background: var(--mat-sys-surface-container-lowest); border: 1px solid var(--mat-sys-outline-variant); border-radius: 6px; min-width: 100px; }
    .add-discount-dialog__card-name { font-size: 0.8rem; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .add-discount-dialog__card-remove { flex-shrink: 0; }
  `],
})
export class AddDiscountDialogComponent {
  @ViewChild('addImageInput') addImageInputRef?: ElementRef<HTMLInputElement>;

  private readonly dialogRef = inject(MatDialogRef<AddDiscountDialogComponent>);
  private readonly adminItemsApi = inject(AdminItemsApiService);
  private readonly adminOutletsApi = inject(AdminOutletsApiService);
  private readonly imagesUploadApi = inject(ImagesUploadApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly statusOptions = STATUS_OPTIONS;
  readonly discountTypeOptions = DISCOUNT_TYPE_OPTIONS;
  outletOptions: { outletId: number; outletName: string }[] = [];
  itemOptions: { id: number; name: string }[] = [];

  discountName = '';
  discountType = 'PERCENTAGE';
  discountValue = 0;
  startDateModel: Date | null = null;
  endDateModel: Date | null = null;
  status = 'ACTIVE';
  discountImage = '';
  outletSearchText = '';
  selectedOutletId: number | null = null;
  selectedOutletName = '';
  itemIds: number[] = [];
  itemSearchText = '';
  selectedDiscountFile: File | null = null;
  saving = false;

  /** Filter outlets by name for search dropdown (getter so it updates when user types). */
  get filteredOutletOptions(): { outletId: number; outletName: string }[] {
    const search = (this.outletSearchText ?? '').trim().toLowerCase();
    return this.outletOptions.filter(
      (o) => search === '' || (o.outletName ?? '').toLowerCase().includes(search)
    );
  }

  /** Filter items by name (search); exclude already selected. */
  get filteredItemOptions(): { id: number; name: string }[] {
    const search = (this.itemSearchText ?? '').trim().toLowerCase();
    const selected = new Set(this.itemIds);
    return this.itemOptions.filter(
      (o) => !selected.has(o.id) && (search === '' || o.name.toLowerCase().includes(search))
    );
  }

  /** Selected items as { id, name } for card display. */
  get selectedItemsForDisplay(): { id: number; name: string }[] {
    return this.itemIds
      .map((id) => {
        const o = this.itemOptions.find((x) => x.id === id);
        return o ? { id: o.id, name: o.name } : null;
      })
      .filter((x): x is { id: number; name: string } => x != null);
  }

  outletDisplayName = (): string => '';
  itemDisplayName = (): string => '';

  constructor() {
    this.adminOutletsApi.getOutlets({}).subscribe({
      next: (rows) => {
        this.outletOptions = rows.map((r) => ({
          outletId: r.row.outletId,
          outletName: r.row.outletName,
        }));
      },
      error: () => {
        this.outletOptions = [];
      },
    });
  }

  onOutletSelected(opt: { outletId: number; outletName: string }): void {
    this.selectedOutletId = opt.outletId;
    this.selectedOutletName = opt.outletName;
    this.outletSearchText = opt.outletName;
    this.itemIds = [];
    this.itemOptions = [];
    this.itemSearchText = '';
    this.adminItemsApi.getItemsByOutlet(opt.outletId).subscribe({
      next: (rows) => {
        this.itemOptions = rows.map((r) => ({ id: r.id, name: r.name }));
      },
      error: () => {
        this.itemOptions = [];
      },
    });
  }

  onItemSelected(option: { id: number; name: string }): void {
    if (!this.itemIds.includes(option.id)) {
      this.itemIds = [...this.itemIds, option.id];
    }
    this.itemSearchText = '';
  }

  removeItem(itemId: number): void {
    this.itemIds = this.itemIds.filter((id) => id !== itemId);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    this.selectedDiscountFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.discountImage = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  clearImage(): void {
    this.discountImage = '';
    this.selectedDiscountFile = null;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.saving) return;
    let fileToUpload: File | null = this.selectedDiscountFile;
    if (!fileToUpload && this.addImageInputRef?.nativeElement?.files?.length) {
      const f = this.addImageInputRef.nativeElement.files[0];
      if (f?.type?.startsWith('image/')) {
        fileToUpload = f;
        this.selectedDiscountFile = f;
      }
    }
    const startDate = this.startDateModel ? formatDate(this.startDateModel, 'yyyy-MM-dd', 'en') : '';
    const endDate = this.endDateModel ? formatDate(this.endDateModel, 'yyyy-MM-dd', 'en') : '';
    const buildBody = (discountImageValue: string | null) => ({
      discountName: this.discountName.trim(),
      discountType: this.discountType,
      discountValue: Number(this.discountValue),
      startDate,
      endDate,
      status: this.status,
      itemIds: this.itemIds ?? [],
      discountImage: discountImageValue,
    });
    if (fileToUpload) {
      this.saving = true;
      this.imagesUploadApi.upload(fileToUpload, 'discount').subscribe({
        next: (res) => {
          this.saving = false;
          const raw = res && typeof res === 'object' ? (res as unknown as Record<string, unknown>) : {};
          const data = raw['data'] && typeof raw['data'] === 'object' ? (raw['data'] as Record<string, unknown>) : raw;
          const imageValue =
            (data['relativePath'] != null && String(data['relativePath']).trim()) ||
            (data['fileName'] != null && String(data['fileName']).trim()) ||
            (raw['relativePath'] != null && String(raw['relativePath']).trim()) ||
            (raw['fileName'] != null && String(raw['fileName']).trim()) ||
            (data['name'] != null && String(data['name']).trim()) ||
            (data['path'] != null && String(data['path']).trim()) ||
            null;
          this.dialogRef.close(buildBody(imageValue));
        },
        error: () => { this.saving = false; },
      });
    } else {
      const imageVal = this.discountImage?.startsWith('data:') ? null : (this.discountImage || null);
      this.dialogRef.close(buildBody(imageVal));
    }
  }
}
