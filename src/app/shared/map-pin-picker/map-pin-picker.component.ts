import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { Subject } from 'rxjs';

export interface MapPinLocation {
  latitude: number;
  longitude: number;
}

/** Sri Lanka center and default zoom */
const SRI_LANKA_CENTER: google.maps.LatLngLiteral = { lat: 7.8731, lng: 80.7718 };
const SRI_LANKA_ZOOM = 8;

@Component({
  selector: 'app-map-pin-picker',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  template: `
    <div class="map-pin-picker__hint">Click on the map to place the outlet location pin.</div>
    <div class="map-pin-picker__wrapper">
      <google-map
        [center]="effectiveCenter"
        [zoom]="effectiveZoom"
        [options]="mapOptions"
        width="100%"
        height="280px"
        (mapClick)="onMapClick($event)"
      >
        @if (markerPosition) {
          <map-marker [position]="markerPosition" [options]="markerOptions" />
        }
      </google-map>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        isolation: isolate;
        z-index: 0;
      }
      .map-pin-picker__hint {
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant, #49454f);
        margin-bottom: 0.5rem;
      }
      .map-pin-picker__wrapper {
        position: relative;
        overflow: hidden;
        height: 280px;
        width: 100%;
        border-radius: 8px;
        border: 1px solid var(--mat-sys-outline-variant, #79747e);
      }
      .map-pin-picker__wrapper google-map {
        display: block;
      }
    `,
  ],
})
export class MapPinPickerComponent implements OnChanges, OnDestroy {
  @Input() latitude: number | null = null;
  @Input() longitude: number | null = null;
  /** When set (e.g. selected city center), map centers and zooms here. */
  @Input() mapCenter: google.maps.LatLngLiteral | null = null;
  @Input() mapZoom: number | null = null;

  @Output() locationSelected = new EventEmitter<MapPinLocation>();

  get effectiveCenter(): google.maps.LatLngLiteral {
    return this.mapCenter ?? SRI_LANKA_CENTER;
  }
  get effectiveZoom(): number {
    return this.mapZoom ?? SRI_LANKA_ZOOM;
  }
  markerPosition: google.maps.LatLngLiteral | null = null;

  constructor() {
    this.updateMarkerPosition();
  }

  readonly mapOptions: google.maps.MapOptions = {
    mapTypeControl: true,
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    restriction: {
      latLngBounds: {
        north: 9.9,
        south: 5.9,
        west: 79.5,
        east: 82.0,
      },
      strictBounds: false,
    },
  };

  readonly markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    clickable: false,
  };

  private readonly destroy$ = new Subject<void>();

  ngOnChanges(): void {
    this.updateMarkerPosition();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    const latLng = event.latLng;
    if (!latLng) return;
    const lat = latLng.lat();
    const lng = latLng.lng();
    this.markerPosition = { lat, lng };
    this.locationSelected.emit({ latitude: lat, longitude: lng });
  }

  private updateMarkerPosition(): void {
    if (this.latitude != null && this.longitude != null) {
      this.markerPosition = { lat: this.latitude, lng: this.longitude };
    } else {
      this.markerPosition = null;
    }
  }
}
