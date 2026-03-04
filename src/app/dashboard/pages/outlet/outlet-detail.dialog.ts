import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GoogleMapsModule } from '@angular/google-maps';
import { OutletTableItem } from '../../../core/api/admin-outlets.api';

export interface OutletDetailDialogData {
  item: OutletTableItem;
}

@Component({
  selector: 'app-outlet-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    GoogleMapsModule,
  ],
  template: `
    <h2 mat-dialog-title>Outlet Details</h2>
    <mat-dialog-content class="outlet-detail-dialog__content">
      @let row = data.item.row;
      @let raw = data.item.raw;

      <!-- Map section (when coordinates exist) -->
      @if (hasLocation()) {
        <section class="outlet-detail-dialog__section outlet-detail-dialog__map-section">
          <div class="outlet-detail-dialog__section-label">
            <mat-icon>location_on</mat-icon>
            <span>Location</span>
          </div>
          <div class="outlet-detail-dialog__map-wrap">
            <google-map
              [center]="mapCenter()"
              [zoom]="15"
              [options]="mapOptions"
              width="100%"
              height="220"
            >
              <map-marker [position]="mapCenter()" [options]="markerOptions" />
            </google-map>
          </div>
        </section>
      }

      <!-- Overview -->
      <section class="outlet-detail-dialog__section">
        <div class="outlet-detail-dialog__section-label">
          <mat-icon>storefront</mat-icon>
          <span>Overview</span>
        </div>
        <div class="outlet-detail-dialog__grid">
          <div class="outlet-detail-dialog__field">
            <span class="outlet-detail-dialog__field-label">Outlet ID</span>
            <span class="outlet-detail-dialog__field-value">{{ row.outletId }}</span>
          </div>
          <div class="outlet-detail-dialog__field">
            <span class="outlet-detail-dialog__field-label">Name</span>
            <span class="outlet-detail-dialog__field-value">{{ row.outletName || '—' }}</span>
          </div>
          <div class="outlet-detail-dialog__field">
            <span class="outlet-detail-dialog__field-label">Type</span>
            <span class="outlet-detail-dialog__field-value">{{ row.outletType || raw?.outletType || '—' }}</span>
          </div>
          <div class="outlet-detail-dialog__field">
            <span class="outlet-detail-dialog__field-label">Status</span>
            <span class="outlet-detail-dialog__status" [class]="'outlet-detail-dialog__status--' + (row.status || '').toLowerCase()">{{ row.status || '—' }}</span>
          </div>
          <div class="outlet-detail-dialog__field outlet-detail-dialog__field--full">
            <span class="outlet-detail-dialog__field-label">Merchant</span>
            <span class="outlet-detail-dialog__field-value">{{ row.merchantName || '—' }}</span>
          </div>
          @if (row.subMerchantName) {
            <div class="outlet-detail-dialog__field outlet-detail-dialog__field--full">
              <span class="outlet-detail-dialog__field-label">Sub Merchant</span>
              <span class="outlet-detail-dialog__field-value">{{ row.subMerchantName }}</span>
            </div>
          }
        </div>
      </section>

      <!-- Contact & Address -->
      <section class="outlet-detail-dialog__section">
        <div class="outlet-detail-dialog__section-label">
          <mat-icon>contact_phone</mat-icon>
          <span>Contact &amp; Address</span>
        </div>
        <div class="outlet-detail-dialog__grid">
          <div class="outlet-detail-dialog__field outlet-detail-dialog__field--full">
            <span class="outlet-detail-dialog__field-label">Phone</span>
            <span class="outlet-detail-dialog__field-value">{{ row.outletPhone || raw?.contactNumber || raw?.phone || '—' }}</span>
          </div>
          @if (raw?.emailAddress) {
            <div class="outlet-detail-dialog__field outlet-detail-dialog__field--full">
              <span class="outlet-detail-dialog__field-label">Email</span>
              <span class="outlet-detail-dialog__field-value">{{ raw.emailAddress }}</span>
            </div>
          }
          <div class="outlet-detail-dialog__field outlet-detail-dialog__field--full">
            <span class="outlet-detail-dialog__field-label">Address</span>
            <span class="outlet-detail-dialog__field-value">{{ row.outletAddress || '—' }}</span>
          </div>
          @if (raw?.cityName || raw?.districtName || raw?.provinceName) {
            <div class="outlet-detail-dialog__field outlet-detail-dialog__field--full">
              <span class="outlet-detail-dialog__field-label">City / District / Province</span>
              <span class="outlet-detail-dialog__field-value">{{ formatCityDistrictProvince(raw?.cityName, raw?.districtName, raw?.provinceName) }}</span>
            </div>
          }
          @if (raw?.postalCode) {
            <div class="outlet-detail-dialog__field">
              <span class="outlet-detail-dialog__field-label">Postal Code</span>
              <span class="outlet-detail-dialog__field-value">{{ raw.postalCode }}</span>
            </div>
          }
        </div>
      </section>

      <!-- Banking (if present) -->
      @if (raw?.bankName || raw?.accountHolderName || raw?.accountNumber) {
        <section class="outlet-detail-dialog__section">
          <div class="outlet-detail-dialog__section-label">
            <mat-icon>account_balance</mat-icon>
            <span>Banking</span>
          </div>
          <div class="outlet-detail-dialog__grid">
            <div class="outlet-detail-dialog__field">
              <span class="outlet-detail-dialog__field-label">Bank</span>
              <span class="outlet-detail-dialog__field-value">{{ raw.bankName || '—' }}</span>
            </div>
            <div class="outlet-detail-dialog__field">
              <span class="outlet-detail-dialog__field-label">Branch</span>
              <span class="outlet-detail-dialog__field-value">{{ raw.bankBranch || '—' }}</span>
            </div>
            <div class="outlet-detail-dialog__field outlet-detail-dialog__field--full">
              <span class="outlet-detail-dialog__field-label">Account Holder</span>
              <span class="outlet-detail-dialog__field-value">{{ raw.accountHolderName || '—' }}</span>
            </div>
            <div class="outlet-detail-dialog__field">
              <span class="outlet-detail-dialog__field-label">Account Number</span>
              <span class="outlet-detail-dialog__field-value">{{ raw.accountNumber || '—' }}</span>
            </div>
          </div>
        </section>
      }

      <!-- Business (if present) -->
      @if (raw?.businessRegistrationNumber || raw?.taxIdentificationNumber || raw?.businessCategory) {
        <section class="outlet-detail-dialog__section">
          <div class="outlet-detail-dialog__section-label">
            <mat-icon>business</mat-icon>
            <span>Business</span>
          </div>
          <div class="outlet-detail-dialog__grid">
            @if (raw?.businessRegistrationNumber) {
              <div class="outlet-detail-dialog__field">
                <span class="outlet-detail-dialog__field-label">Registration No</span>
                <span class="outlet-detail-dialog__field-value">{{ raw.businessRegistrationNumber }}</span>
              </div>
            }
            @if (raw?.taxIdentificationNumber) {
              <div class="outlet-detail-dialog__field">
                <span class="outlet-detail-dialog__field-label">Tax ID</span>
                <span class="outlet-detail-dialog__field-value">{{ raw.taxIdentificationNumber }}</span>
              </div>
            }
            @if (raw?.businessCategory) {
              <div class="outlet-detail-dialog__field outlet-detail-dialog__field--full">
                <span class="outlet-detail-dialog__field-label">Category</span>
                <span class="outlet-detail-dialog__field-value">{{ raw.businessCategory }}</span>
              </div>
            }
          </div>
        </section>
      }

      <!-- Other -->
      @if (raw?.subscriptionValidUntil || raw?.remarks) {
        <section class="outlet-detail-dialog__section">
          <div class="outlet-detail-dialog__section-label">
            <mat-icon>info</mat-icon>
            <span>Other</span>
          </div>
          <div class="outlet-detail-dialog__grid">
            @if (raw?.subscriptionValidUntil) {
              <div class="outlet-detail-dialog__field">
                <span class="outlet-detail-dialog__field-label">
                  Subscription valid until
                  <span class="outlet-detail-dialog__hint">(subscription expiry date)</span>
                </span>
                <span class="outlet-detail-dialog__field-value">
                  {{ formatSubscriptionDate(raw.subscriptionValidUntil) }}
                </span>
              </div>
            }
            @if (raw?.remarks) {
              <div class="outlet-detail-dialog__field outlet-detail-dialog__field--full">
                <span class="outlet-detail-dialog__field-label">Remarks</span>
                <span class="outlet-detail-dialog__field-value">{{ raw.remarks }}</span>
              </div>
            }
          </div>
        </section>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button mat-dialog-close type="button" class="dialog-cancel-btn">Cancel</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .outlet-detail-dialog__content {
        min-width: 400px;
        max-width: 560px;
        max-height: 85vh;
        overflow-y: auto;
      }

      .outlet-detail-dialog__section {
        margin-bottom: 1.25rem;
        padding: 1rem 1.25rem;
        background: var(--mat-sys-surface-container-lowest, #f5f5f5);
        border-radius: 12px;
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
      }
      .outlet-detail-dialog__section:last-child {
        margin-bottom: 0;
      }

      .outlet-detail-dialog__section-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--mat-sys-primary, #1976d2);
        margin-bottom: 0.75rem;
      }
      .outlet-detail-dialog__section-label mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
      }

      .outlet-detail-dialog__map-section {
        padding: 0.75rem;
      }
      .outlet-detail-dialog__map-wrap {
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        height: 220px;
      }
      .outlet-detail-dialog__map-wrap google-map {
        display: block;
      }

      .outlet-detail-dialog__grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem 1.5rem;
      }

      .outlet-detail-dialog__field {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }
      .outlet-detail-dialog__field--full {
        grid-column: 1 / -1;
      }

      .outlet-detail-dialog__field-label {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--mat-sys-on-surface-variant, #5f5f5f);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .outlet-detail-dialog__hint {
        display: inline-block;
        margin-left: 0.5rem;
        font-size: 0.7rem;
        font-weight: 400;
        text-transform: none;
        letter-spacing: 0;
        color: var(--mat-sys-on-surface-variant, #8a8a8a);
      }
      .outlet-detail-dialog__field-value {
        font-size: 0.9375rem;
        color: var(--mat-sys-on-surface, #1c1b1f);
      }

      .outlet-detail-dialog__status {
        display: inline-block;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-size: 0.8125rem;
        font-weight: 600;
        width: fit-content;
      }
      .outlet-detail-dialog__status--active {
        background: #e8f5e9;
        color: #1b5e20;
      }
      .outlet-detail-dialog__status--inactive {
        background: #eceff1;
        color: #455a64;
      }
      .outlet-detail-dialog__status--pending {
        background: #fff8e1;
        color: #f57f17;
      }
      .outlet-detail-dialog__status-- {
        background: var(--mat-sys-surface-container-highest);
        color: var(--mat-sys-on-surface);
      }

      mat-dialog-actions {
        padding-top: 0.75rem;
      }
    `,
  ],
})
export class OutletDetailDialogComponent {
  readonly data: OutletDetailDialogData = inject(MAT_DIALOG_DATA);

  readonly mapOptions: google.maps.MapOptions = {
    mapTypeControl: true,
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
  };

  readonly markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    clickable: false,
  };

  /** Format subscription end date: show only date part (YYYY-MM-DD). */
  formatSubscriptionDate(value: string | null | undefined): string {
    if (value == null) return '—';
    const raw = String(value).trim();
    if (!raw) return '—';
    // If value contains time, keep only the first 10 chars (date part).
    return raw.length > 10 ? raw.slice(0, 10) : raw;
  }

  /** Join city, district, province (skip empty); return '—' if all empty. */
  formatCityDistrictProvince(city?: string, district?: string, province?: string): string {
    const parts = [city, district, province].filter((v) => v != null && String(v).trim() !== '');
    return parts.length > 0 ? parts.join(' · ') : '—';
  }

  hasLocation(): boolean {
    const raw = this.data.item.raw;
    return raw != null && raw.latitude != null && raw.longitude != null;
  }

  mapCenter(): google.maps.LatLngLiteral {
    const raw = this.data.item.raw;
    const lat = Number(raw?.latitude ?? 7.8731);
    const lng = Number(raw?.longitude ?? 80.7718);
    return { lat, lng };
  }
}
