import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject, Observable, of } from 'rxjs';
import { debounceTime, switchMap, map, takeUntil } from 'rxjs/operators';
import { CreateOutletPayload } from '../../../core/api/admin-outlets.api';
import { LocationsApiService } from '../../../core/api/locations.api';
import { AdminMerchantsApiService } from '../../../core/api/admin-merchants.api';
import { MerchantRow } from '../../../core/api/admin-merchants.api';
import { MapPinPickerComponent, MapPinLocation } from '../../../shared/map-pin-picker/map-pin-picker.component';

export type AddOutletDialogResult = CreateOutletPayload;

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
  selector: 'app-add-outlet-dialog',
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
  templateUrl: './add-outlet.dialog.html',
  styleUrl: './add-outlet.dialog.scss',
})
export class AddOutletDialogComponent implements OnInit, OnDestroy {
  private readonly dialogRef = inject(MatDialogRef<AddOutletDialogComponent>);
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
  subMerchantId: number | null = null;
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
    this.subMerchantId = m.subMerchantId != null ? m.subMerchantId : null;
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

  /** True when a city is selected – show the map in the Location section. */
  get showMapAfterCitySelected(): boolean {
    return this.cityId != null;
  }

  onLocationSelected(loc: MapPinLocation): void {
    this.latitude = loc.latitude;
    this.longitude = loc.longitude;
  }

  onSave(): void {
    const merchantId = this.merchantId ?? 0;
    const provinceId = this.provinceId ?? 0;
    const districtId = this.districtId ?? 0;
    const cityId = this.cityId ?? 0;
    if (!merchantId || !provinceId || !districtId || !cityId) {
      return;
    }
    const subMerchantId = this.subMerchantId != null ? this.subMerchantId : null;
    const payload: CreateOutletPayload = {
      merchantId,
      subMerchantId,
      outletName: this.outletName.trim(),
      businessRegistrationNumber: this.businessRegistrationNumber.trim(),
      taxIdentificationNumber: this.taxIdentificationNumber.trim(),
      postalCode: this.postalCode.trim(),
      provinceId,
      districtId,
      cityId,
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
    this.dialogRef.close(payload);
  }
}
