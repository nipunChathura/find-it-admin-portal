import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { timeout, catchError, of } from 'rxjs';
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
export class ApiImageComponent implements OnInit, OnChanges, OnDestroy {
  private readonly imagesUploadApi = inject(ImagesUploadApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() type: string = 'profile';
  @Input() pathOrFileName: string | null | undefined = '';
  @Input() alt = 'Image';
  @Input() imgClass = '';

  imageUrl: string | null = null;
  loading = false;
  error = false;
  private objectUrl: string | null = null;

  ngOnInit(): void {
    this.loadImage();
  }

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
    if (!s) return '';
    const parts = s.replace(/\\/g, '/').split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1]! : s;
  }

  /** For profile: extract fileName from our image URL so we always use authenticated getImageShow. */
  private getFileNameFromProfileUrl(url: string): string {
    try {
      const u = new URL(url);
      const fileName = u.searchParams.get('fileName');
      if (fileName?.trim()) return fileName.trim();
      const path = u.pathname || '';
      const segments = path.split('/').filter(Boolean);
      const profileIdx = segments.indexOf('profile');
      if (profileIdx >= 0 && profileIdx < segments.length - 1) return segments[segments.length - 1];
      if (segments.length) return segments[segments.length - 1];
    } catch {
      // ignore
    }
    return '';
  }

  private loadImage(): void {
    this.revokeUrl();
    this.loading = false;
    this.error = false;
    const raw = (this.pathOrFileName || '').trim();
    if (!raw) return;
    if (raw.startsWith('data:')) {
      this.imageUrl = raw;
      return;
    }
    let fileNameOnly = '';
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      if (this.type === 'profile') {
        fileNameOnly = this.getFileNameFromProfileUrl(raw) || this.getFileName(raw);
        if (!fileNameOnly) return;
      } else {
        this.imageUrl = raw;
        return;
      }
    } else {
      fileNameOnly = this.getFileName(raw);
    }
    if (!fileNameOnly) return;
    this.loading = true;
    this.imagesUploadApi
      .getImageShow(this.type, fileNameOnly)
      .pipe(
        timeout(12000),
        catchError(() => of(new Blob())),
      )
      .subscribe({
        next: (blob: Blob) => {
          this.loading = false;
          if (blob && blob.size > 0) {
            this.objectUrl = URL.createObjectURL(blob);
            this.imageUrl = this.objectUrl;
          } else {
            this.error = true;
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.error = true;
          this.cdr.detectChanges();
        },
      });
  }
}
