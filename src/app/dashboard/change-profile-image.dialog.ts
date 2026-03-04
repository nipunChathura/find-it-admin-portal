import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ImageUploadResponse, ImagesUploadApiService, IMAGES_BASE_URL } from '../core/api/images-upload.api';

export interface ChangeProfileImageDialogData {
  currentUrl?: string | null;
}

@Component({
  selector: 'app-change-profile-image-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Change profile image</h2>
    <mat-dialog-content>
      <div class="browse-row">
        <button mat-stroked-button type="button" (click)="fileInput.click()" class="browse-btn">
          Browse from computer
        </button>
        <input #fileInput type="file" accept="image/*" class="file-input" (change)="onFileSelected($event)" />
      </div>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Or enter image URL</mat-label>
        <input matInput [(ngModel)]="imageUrl" name="imageUrl" placeholder="https://..." />
      </mat-form-field>
      @if (imageUrl) {
        <div class="preview">
          <img [src]="imageUrl" alt="Preview" (error)="previewError = true" (load)="previewError = false" />
          @if (previewError) {
            <p class="preview-error">Could not load image.</p>
          }
        </div>
      }
    </mat-dialog-content>
    @if (errorMessage) {
      <p class="change-profile-image__error">{{ errorMessage }}</p>
    }
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close type="button" [disabled]="saving">Cancel</button>
      <button mat-button (click)="clear()" type="button" [disabled]="saving">Remove image</button>
      <button mat-raised-button color="primary" (click)="save()" type="button" [disabled]="saving">
        {{ saving ? 'Uploading...' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    .browse-row { margin-bottom: 1rem; }
    .browse-btn { width: 100%; }
    .file-input { display: none; }
    .preview { margin-top: 1rem; text-align: center; }
    .preview img { max-width: 120px; max-height: 120px; border-radius: 50%; object-fit: cover; }
    .preview-error { color: var(--mat-sys-error); font-size: 0.875rem; }
    .change-profile-image__error { color: var(--mat-sys-error); font-size: 0.875rem; margin: 0.5rem 0 0 0; }
  `],
})
export class ChangeProfileImageDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ChangeProfileImageDialogComponent>);
  private readonly data = inject<ChangeProfileImageDialogData>(MAT_DIALOG_DATA, { optional: true });
  private readonly imagesUploadApi = inject(ImagesUploadApiService);

  imageUrl = this.data?.currentUrl ?? '';
  previewError = false;
  /** When user selects a file from browse, we keep it to upload via API on Save. */
  selectedFile: File | null = null;
  saving = false;
  errorMessage = '';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    this.selectedFile = file;
    this.errorMessage = '';
    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrl = reader.result as string;
      this.previewError = false;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  clear(): void {
    this.imageUrl = '';
    this.previewError = false;
    this.selectedFile = null;
    this.errorMessage = '';
    this.dialogRef.close(null);
  }

  save(): void {
    if (this.selectedFile) {
      this.saving = true;
      this.errorMessage = '';
      this.imagesUploadApi.upload(this.selectedFile, 'profile').subscribe({
        next: (res: ImageUploadResponse) => {
          this.saving = false;
          const path = res?.relativePath || res?.fileName;
          const imageValue = path ? IMAGES_BASE_URL.replace(/\/?$/, '/') + path.replace(/^\//, '') : null;
          this.dialogRef.close(imageValue);
        },
        error: (err: unknown) => {
          this.saving = false;
          this.errorMessage = this.getErrorMessage(err);
        },
      });
      return;
    }
    const url = this.imageUrl?.trim() || null;
    this.dialogRef.close(url);
  }

  private getErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const status = err.status;
      const body = err.error;
      const serverMessage = this.getServerMessage(body);
      if (status === 401) {
        return 'Session expired or unauthorized. Please log in again.';
      }
      if (status === 413) {
        return 'Image file is too large. Please choose a smaller image.';
      }
      if (status === 400) {
        return serverMessage || 'Invalid image or file type. Please use a valid image (e.g. JPG, PNG).';
      }
      if (status === 0 || err.error?.message === 'Http failure response') {
        return 'Network error. Please check your connection and try again.';
      }
      if (status >= 500) {
        return serverMessage || 'Server error. Please try again later.';
      }
      return serverMessage || err.message || 'Failed to upload profile image. Please try again.';
    }
    if (err instanceof Error) {
      return err.message || 'Failed to upload profile image. Please try again.';
    }
    return 'Failed to upload profile image. Please try again.';
  }

  private getServerMessage(body: unknown): string {
    if (body == null) return '';
    if (typeof body === 'string') return body;
    if (typeof body === 'object') {
      const o = body as Record<string, unknown>;
      if (typeof o['message'] === 'string') return o['message'];
      if (typeof o['error'] === 'string') return o['error'];
      if (typeof o['responseMessage'] === 'string') return o['responseMessage'];
    }
    return '';
  }
}
