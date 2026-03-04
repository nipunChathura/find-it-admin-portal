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

/** Approximate coordinates for Sri Lankan cities – map zooms to selected city. */
const CITY_CENTER_ZOOM = 13;
const SRI_LANKA_CENTER = { lat: 7.8731, lng: 80.7718 };
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  colombo: { lat: 6.9271, lng: 79.8612 },
  kandy: { lat: 7.2906, lng: 80.6337 },
  galle: { lat: 6.0531, lng: 80.2110 },
  jaffna: { lat: 9.6615, lng: 80.0255 },
  negombo: { lat: 7.2088, lng: 79.8358 },
  kurunegala: { lat: 7.4863, lng: 80.3624 },
  anuradhapura: { lat: 8.3114, lng: 80.4037 },
  badulla: { lat: 6.9934, lng: 81.0550 },
  ratnapura: { lat: 6.6844, lng: 80.4036 },
  trincomalee: { lat: 8.5874, lng: 81.2152 },
  matara: { lat: 5.9494, lng: 80.5493 },
  batticaloa: { lat: 7.7102, lng: 81.6924 },
  hambantota: { lat: 6.124, lng: 81.1132 },
  gampaha: { lat: 7.084, lng: 80.0094 },
  kalutara: { lat: 6.5833, lng: 79.9667 },
  vavuniya: { lat: 8.7514, lng: 80.4971 },
  ampara: { lat: 7.2975, lng: 81.682 },
  kilinochchi: { lat: 9.3961, lng: 80.3982 },
  mullaitivu: { lat: 9.2671, lng: 80.8142 },
};

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

  /** Center the map on the selected city when known; otherwise Sri Lanka. */
  get selectedCityMapCenter(): { lat: number; lng: number } | null {
    const name = (this.citySearchText ?? '').trim().toLowerCase();
    if (!name) return null;
    return CITY_COORDS[name] ?? SRI_LANKA_CENTER;
  }

  /** Zoom level when a city is selected (zoomed in to city). */
  get selectedCityMapZoom(): number {
    const name = (this.citySearchText ?? '').trim().toLowerCase();
    return name && CITY_COORDS[name] ? CITY_CENTER_ZOOM : 11;
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
