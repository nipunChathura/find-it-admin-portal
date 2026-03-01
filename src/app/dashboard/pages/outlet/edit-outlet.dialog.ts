import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject, Observable, of } from 'rxjs';
import { debounceTime, switchMap, map, takeUntil } from 'rxjs/operators';
import {
  CreateOutletPayload,
  OutletApiItem,
} from '../../../core/api/admin-outlets.api';
import { LocationsApiService } from '../../../core/api/locations.api';
import { AdminMerchantsApiService } from '../../../core/api/admin-merchants.api';
import { MerchantRow } from '../../../core/api/admin-merchants.api';
import { MapPinPickerComponent, MapPinLocation } from '../../../shared/map-pin-picker/map-pin-picker.component';

export interface EditOutletDialogData {
  outletId: number;
  [key: string]: unknown;
}

export type EditOutletDialogResult = { outletId: number } & Partial<CreateOutletPayload>;

const OUTLET_TYPE_OPTIONS = [
  { value: 'PHYSICAL_STORE', label: 'PHYSICAL_STORE' },
  { value: 'ONLINE', label: 'ONLINE' },
  { value: 'KIOSK', label: 'KIOSK' },
];

const BUSINESS_CATEGORY_OPTIONS = [
  { value: 'RESTAURANT', label: 'RESTAURANT' },
  { value: 'RETAIL', label: 'RETAIL' },
  { value: 'SERVICE', label: 'SERVICE' },
  { value: 'OTHER', label: 'OTHER' },
];

const SEARCH_LIMIT = 5;

@Component({
  selector: 'app-edit-outlet-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatAutocompleteModule,
    MapPinPickerComponent,
  ],
  templateUrl: './edit-outlet.dialog.html',
  styleUrl: './edit-outlet.dialog.scss',
})
export class EditOutletDialogComponent implements OnInit, OnDestroy {
  readonly data: EditOutletDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditOutletDialogComponent>);
  private readonly locationsApi = inject(LocationsApiService);
  private readonly merchantsApi = inject(AdminMerchantsApiService);
  private readonly destroy$ = new Subject<void>();

  readonly outletTypeOptions = OUTLET_TYPE_OPTIONS;
  readonly businessCategoryOptions = BUSINESS_CATEGORY_OPTIONS;

  merchantSearchTerm$ = new Subject<string>();
  provinceSearchTerm$ = new Subject<string>();
  districtSearchTerm$ = new Subject<string>();
  citySearchTerm$ = new Subject<string>();

  merchantSearchResults$!: Observable<MerchantRow[]>;
  provinceOptions$!: Observable<{ id: number; name: string }[]>;
  districtOptions$!: Observable<{ id: number; name: string }[]>;
  cityOptions$!: Observable<{ id: number; name: string }[]>;

  merchantId: number | null = null;
  merchantSearchText = '';
  provinceId: number | null = null;
  provinceSearchText = '';
  districtId: number | null = null;
  districtSearchText = '';
  cityId: number | null = null;
  citySearchText = '';

  outletName = '';
  businessRegistrationNumber = '';
  taxIdentificationNumber = '';
  contactNumber = '';
  emailAddress = '';
  addressLine1 = '';
  addressLine2 = '';
  postalCode = '';
  outletType = 'PHYSICAL_STORE';
  businessCategory = 'RESTAURANT';
  bankName = '';
  bankBranch = '';
  accountNumber = '';
  accountHolderName = '';
  latitude: number | null = null;
  longitude: number | null = null;
  remarks = '';

  ngOnInit(): void {
    this.merchantSearchResults$ = this.merchantSearchTerm$.pipe(
      debounceTime(250),
      switchMap((q) => {
        const term = (q ?? '').trim();
        if (!term) return of([]);
        return this.merchantsApi.getMerchants({ search: term }).pipe(
          map((list) => list.slice(0, SEARCH_LIMIT)),
        );
      }),
      takeUntil(this.destroy$),
    );
    this.provinceOptions$ = this.provinceSearchTerm$.pipe(
      debounceTime(250),
      switchMap((q) => this.locationsApi.getProvinces({ name: q ?? '', description: '' })),
      takeUntil(this.destroy$),
    );
    this.districtOptions$ = this.districtSearchTerm$.pipe(
      debounceTime(250),
      switchMap((q) =>
        this.provinceId != null
          ? this.locationsApi.getDistricts(this.provinceId, { name: q ?? '' })
          : of([]),
      ),
      takeUntil(this.destroy$),
    );
    this.cityOptions$ = this.citySearchTerm$.pipe(
      debounceTime(250),
      switchMap((q) =>
        this.districtId != null
          ? this.locationsApi.getCities(this.districtId, { name: q ?? '' })
          : of([]),
      ),
      takeUntil(this.destroy$),
    );
    this.initFromData();
  }

  private initFromData(): void {
    const d = this.data as OutletApiItem & { outletId: number };
    this.outletName = String(d.outletName ?? '');
    this.businessRegistrationNumber = String(d.businessRegistrationNumber ?? '');
    this.taxIdentificationNumber = String(d.taxIdentificationNumber ?? '');
    this.contactNumber = String(d.contactNumber ?? d.phone ?? '');
    this.emailAddress = String(d.emailAddress ?? '');
    this.addressLine1 = String(d.addressLine1 ?? d.address ?? '');
    this.addressLine2 = String(d.addressLine2 ?? '');
    this.postalCode = String(d.postalCode ?? '');
    this.outletType = String(d.outletType ?? 'PHYSICAL_STORE');
    this.businessCategory = String(d.businessCategory ?? 'RESTAURANT');
    this.bankName = String(d.bankName ?? '');
    this.bankBranch = String(d.bankBranch ?? '');
    this.accountNumber = String(d.accountNumber ?? '');
    this.accountHolderName = String(d.accountHolderName ?? '');
    this.latitude = d.latitude ?? null;
    this.longitude = d.longitude ?? null;
    this.remarks = String(d.remarks ?? '');
    this.merchantId = d.merchantId ?? null;
    this.merchantSearchText = String(d.merchantName ?? '');
    this.provinceId = d.provinceId ?? null;
    this.provinceSearchText = String(d.provinceName ?? '');
    this.districtId = d.districtId ?? null;
    this.districtSearchText = String(d.districtName ?? '');
    this.cityId = d.cityId ?? null;
    this.citySearchText = String(d.cityName ?? '');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMerchantSearchChange(value: string): void {
    this.merchantSearchTerm$.next(value ?? '');
  }

  onMerchantSelected(m: MerchantRow): void {
    this.merchantId = m.merchantId;
    this.merchantSearchText = m.merchantName ?? '';
  }

  onProvinceSearchChange(value: string): void {
    this.provinceSearchTerm$.next(value ?? '');
  }

  onProvinceSelected(item: { id: number; name: string }): void {
    this.provinceId = item.id;
    this.provinceSearchText = item.name;
    this.districtId = null;
    this.districtSearchText = '';
    this.cityId = null;
    this.citySearchText = '';
  }

  onDistrictSearchChange(value: string): void {
    this.districtSearchTerm$.next(value ?? '');
  }

  onDistrictSelected(item: { id: number; name: string }): void {
    this.districtId = item.id;
    this.districtSearchText = item.name;
    this.cityId = null;
    this.citySearchText = '';
  }

  onCitySearchChange(value: string): void {
    this.citySearchTerm$.next(value ?? '');
  }

  onCitySelected(item: { id: number; name: string }): void {
    this.cityId = item.id;
    this.citySearchText = item.name;
  }

  get districtDisabled(): boolean {
    return this.provinceId == null;
  }

  get cityDisabled(): boolean {
    return this.districtId == null;
  }

  onLocationSelected(loc: MapPinLocation): void {
    this.latitude = loc.latitude;
    this.longitude = loc.longitude;
  }

  onUpdate(): void {
    const payload: Partial<CreateOutletPayload> = {
      outletName: this.outletName.trim(),
      businessRegistrationNumber: this.businessRegistrationNumber.trim(),
      taxIdentificationNumber: this.taxIdentificationNumber.trim(),
      postalCode: this.postalCode.trim(),
      contactNumber: this.contactNumber.trim(),
      emailAddress: this.emailAddress.trim(),
      addressLine1: this.addressLine1.trim(),
      addressLine2: this.addressLine2.trim(),
      outletType: this.outletType,
      businessCategory: this.businessCategory,
      latitude: this.latitude ?? 0,
      longitude: this.longitude ?? 0,
      bankName: this.bankName.trim(),
      bankBranch: this.bankBranch.trim(),
      accountNumber: this.accountNumber.trim(),
      accountHolderName: this.accountHolderName.trim(),
      remarks: this.remarks.trim(),
    };
    if (this.merchantId != null) payload.merchantId = this.merchantId;
    if (this.provinceId != null) payload.provinceId = this.provinceId;
    if (this.districtId != null) payload.districtId = this.districtId;
    if (this.cityId != null) payload.cityId = this.cityId;
    payload.subMerchantId = null;
    this.dialogRef.close({ outletId: this.data.outletId, ...payload });
  }
}
