import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, timeout, throwError } from 'rxjs';

const LOGIN_URL = 'http://localhost:9090/find-it/api/users/login';
const PROFILE_IMAGE_URL = 'http://localhost:9090/find-it/api/users/profile/image';
const PROFILE_IMAGE_BY_ID_URL = 'http://localhost:9090/find-it/api/users';
const TOKEN_KEY = 'findit_token';
const USER_KEY = 'findit_user';
const PROFILE_IMAGE_KEY = 'findit_profile_image';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  isSystemUser?: string;
  responseCode: string;
  responseMessage?: string;
  role: string;
  status: string;
  token: string;
  userId: number;
  userStatus: string;
  username: string;
  /** Profile image file name or path (from backend). Used with image show API. */
  profileImage?: string | null;
  profile_image?: string | null;
  profileImageName?: string | null;
  profileImageFileName?: string | null;
  profile_image_name?: string | null;
  image?: string | null;
  /** Some backends wrap payload in data */
  data?: { profileImage?: string; profile_image?: string; profileImageName?: string; profileImageFileName?: string; [k: string]: unknown };
}

export interface AuthUser {
  username: string;
  role: string;
  userId: number;
  userStatus: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSignal = signal<string | null>(this.getStoredToken());
  private readonly userSignal = signal<AuthUser | null>(this.getStoredUser());
  private readonly profileImageUrlSignal = signal<string | null>(sessionStorage.getItem(PROFILE_IMAGE_KEY));

  readonly token = computed(() => this.tokenSignal());
  readonly user = computed(() => this.userSignal());
  readonly isLoggedIn = computed(() => !!this.tokenSignal());
  readonly profileImageUrl = computed(() => this.profileImageUrlSignal());

  setProfileImageUrl(url: string | null): void {
    if (url) {
      sessionStorage.setItem(PROFILE_IMAGE_KEY, url);
      this.profileImageUrlSignal.set(url);
    } else {
      sessionStorage.removeItem(PROFILE_IMAGE_KEY);
      this.profileImageUrlSignal.set(null);
    }
  }

  /** True when the logged-in user's role from login API allows editing user status (e.g. sysAdmin). */
  readonly canEditUserStatus = computed(() => {
    const role = this.userSignal()?.role;
    if (role == null) return false;
    const r = role.trim().toLowerCase();
    return r === 'sysadmin';
  });

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  login(username: string, password: string): Observable<LoginResponse | null> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    console.log(username);
    console.log(password)
    return this.http
      .post<LoginResponse>(LOGIN_URL, { username, password }, { headers })
      .pipe(
        timeout(20000),
        tap((res) => {
          if (res.responseCode === '00' && res.status === 'success' && res.token) {
            this.setSession(res);
          }
        }),
        catchError((err) => throwError(() => err)),
      );
  }

  /**
   * PUT /find-it/api/users/profile/image
   * Upload profile image as multipart/form-data with field "file".
   */
  updateProfileImage(file: File): Observable<unknown> {
    const token = this.tokenSignal();
    if (!token) return of(undefined);
    const formData = new FormData();
    formData.append('file', file, file.name);
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.put(PROFILE_IMAGE_URL, formData, { headers });
  }

  /**
   * PUT /find-it/api/users/:userId/profile-image
   * Body: { "fileName": "..." } – set user profile image by fileName (from upload API response).
   */
  setProfileImageByFileName(userId: number, fileName: string): Observable<unknown> {
    const token = this.tokenSignal();
    if (!token || !fileName?.trim()) return of(undefined);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
    const url = `${PROFILE_IMAGE_BY_ID_URL}/${userId}/profile-image`;
    return this.http.put(url, { fileName: fileName.trim() }, { headers });
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(PROFILE_IMAGE_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.profileImageUrlSignal.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(res: LoginResponse): void {
    sessionStorage.setItem(TOKEN_KEY, res.token);
    this.tokenSignal.set(res.token);
    const user: AuthUser = {
      username: res.username,
      role: res.role,
      userId: res.userId,
      userStatus: res.userStatus,
    };
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSignal.set(user);
    const profileImageName = this.getProfileImageNameFromLoginResponse(res);
    if (profileImageName) {
      sessionStorage.setItem(PROFILE_IMAGE_KEY, profileImageName);
      this.profileImageUrlSignal.set(profileImageName);
    }
  }

  /** Read profile image file name/path from login response (tries common backend key names). */
  private getProfileImageNameFromLoginResponse(res: LoginResponse): string | null {
    const from = (v: string | null | undefined): string | null =>
      (v && typeof v === 'string' && (v = v.trim()).length) ? v : null;
    const keys = [
      'profileImage', 'profile_image', 'profileImageName', 'profileImageFileName',
      'profile_image_name', 'image', 'profileImageUrl', 'profile_image_url'
    ] as const;
    for (const k of keys) {
      const val = (res as unknown as Record<string, unknown>)[k];
      if (val != null && typeof val === 'string') {
        const s = from(val);
        if (s) return s;
      }
    }
    const data = res.data as Record<string, unknown> | undefined;
    if (data && typeof data === 'object') {
      for (const k of keys) {
        const val = data[k];
        if (val != null && typeof val === 'string') {
          const s = from(val);
          if (s) return s;
        }
      }
    }
    return null;
  }

  private getStoredToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  private getStoredUser(): AuthUser | null {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
