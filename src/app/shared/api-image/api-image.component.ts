import { Component, Input, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagesUploadApiService } from '../../core/api/images-upload.api';

/**
 * Displays an image by calling GET /api/images/show?type=&fileName= with Bearer token.
 * Use wherever backend returns a path/fileName (receipt, profile, discount, item, merchant, category).
 */
@Component({
  selector: 'app-api-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loading) {
      <div class="api-image__loading">Loading…</div>
    } @else if (error) {
      <div class="api-image__error">Image unavailable</div>
    } @else if (imageUrl) {
      <img [src]="imageUrl" [alt]="alt" class="api-image__img" [class]="imgClass" />
    }
  `,
  styles: [`
    .api-image__loading, .api-image__error {
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
    }
    .api-image__error { color: var(--mat-sys-error); }
    .api-image__img { max-width: 100%; height: auto; object-fit: contain; display: block; }
  `],
})
export class ApiImageComponent implements OnChanges, OnDestroy {
  private readonly imagesUploadApi = inject(ImagesUploadApiService);

  @Input() type: string = 'profile';
  @Input() pathOrFileName: string | null | undefined = '';
  @Input() alt = 'Image';
  @Input() imgClass = '';

  imageUrl: string | null = null;
  loading = false;
  error = false;
  private objectUrl: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pathOrFileName'] || changes['type']) {
      this.loadImage();
    }
  }

  ngOnDestroy(): void {
    this.revokeUrl();
  }

  private revokeUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.imageUrl = null;
  }

  private getFileName(pathOrFileName: string): string {
    const s = (pathOrFileName || '').trim();
    return s.includes('/') ? s.split('/').pop()! : s;
  }

  private loadImage(): void {
    this.revokeUrl();
    this.loading = false;
    this.error = false;
    const raw = (this.pathOrFileName || '').trim();
    if (!raw) return;
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
      this.imageUrl = raw;
      return;
    }
    const fileName = this.getFileName(raw);
    if (!fileName) return;
    this.loading = true;
    this.imagesUploadApi.getImageShow(this.type, fileName).subscribe({
      next: (blob: Blob) => {
        this.loading = false;
        if (blob && blob.size > 0) {
          this.objectUrl = URL.createObjectURL(blob);
          this.imageUrl = this.objectUrl;
        } else {
          this.error = true;
        }
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }
}
