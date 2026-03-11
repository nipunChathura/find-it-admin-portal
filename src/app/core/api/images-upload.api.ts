import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const UPLOAD_URL = 'http://localhost:9090/find-it/api/images/upload';
const IMAGES_SHOW_URL = 'http://localhost:9090/find-it/api/images/show';
/** Base URL for serving uploaded images (relativePath is appended for display). */
export const IMAGES_BASE_URL = 'http://localhost:9090/find-it/';

/** Response from POST /find-it/api/images/upload */
export interface ImageUploadResponse {
  fileName: string;
  relativePath: string;
  responseCode: string;
  responseMessage: string;
  status: string;
  type: string;
}

/** Image type for upload (form field "type"). */
export type ImageUploadType = 'profile' | 'receipt' | 'discount' | 'item' | 'merchant' | 'category';

@Injectable({ providedIn: 'root' })
export class ImagesUploadApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  /**
   * POST /find-it/api/images/upload
   * FormData: file=<File>, type=<ImageUploadType>
   * Returns fileName / relativePath to use in subsequent save/update API image field.
   */
  upload(file: File, type: ImageUploadType): Observable<ImageUploadResponse> {
    const token = this.auth.token();
    if (!token) return of({} as ImageUploadResponse);
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('type', type);
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post<ImageUploadResponse>(UPLOAD_URL, formData, { headers });
  }

  /**
   * GET /find-it/api/images/show?type=&fileName=
   * Returns image as Blob (with Bearer token). Use for receipt/profile etc.
   */
  getImageShow(type: string, fileName: string): Observable<Blob> {
    const token = this.auth.token();
    if (!token || !fileName?.trim()) return of(new Blob());
    const params = new HttpParams()
      .set('type', type)
      .set('fileName', fileName.trim());
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get(IMAGES_SHOW_URL, {
      params,
      headers,
      responseType: 'blob',
    });
  }
}
