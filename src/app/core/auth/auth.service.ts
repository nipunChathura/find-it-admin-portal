import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, timeout, throwError } from 'rxjs';

const LOGIN_URL = 'http://localhost:9090/find-it/api/users/login';
const TOKEN_KEY = 'findit_token';
const USER_KEY = 'findit_user';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  isSystemUser: string;
  responseCode: string;
  responseMessage: string;
  role: string;
  status: string;
  token: string;
  userId: number;
  userStatus: string;
  username: string;
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

  readonly token = computed(() => this.tokenSignal());
  readonly user = computed(() => this.userSignal());
  readonly isLoggedIn = computed(() => !!this.tokenSignal());

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

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
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
