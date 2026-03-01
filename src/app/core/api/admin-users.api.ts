import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const ADMIN_USERS_URL = 'http://localhost:9090/find-it/api/admin/users';

/** Raw user item from GET admin users API. */
export interface AdminUserApiItem {
  userId?: number;
  id?: number;
  username?: string;
  name?: string;
  email?: string;
  userStatus?: string;
  status?: string;
  role?: string;
  createdDatetime?: string;
  createdDate?: string;
  createdAt?: string;
  created_date?: string;
  isSystemUser?: string;
  [key: string]: unknown;
}

/** Table row shape used by the Manage User page. */
export interface ViewUserRow {
  id: number;
  name: string;
  email: string;
  status: string;
  createdDate: string;
  role?: string;
}

function mapApiItemToRow(item: AdminUserApiItem): ViewUserRow {
  const id = item.userId ?? item.id ?? 0;
  const created =
    item.createdDatetime ??
    item.createdDate ??
    item.createdAt ??
    item.created_date ??
    '';
  return {
    id: Number(id),
    name: item.name ?? item.username ?? '',
    email: String(item.email ?? ''),
    status: item.userStatus ?? item.status ?? 'PENDING',
    createdDate: created ? String(created).slice(0, 10) : '',
    role: item.role,
  };
}

@Injectable({ providedIn: 'root' })
export class AdminUsersApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  /**
   * GET admin users with optional status and search.
   * Uses Bearer token from AuthService.
   */
  getUsers(params: { status?: string; search?: string }): Observable<ViewUserRow[]> {
    const token = this.auth.token();
    if (!token) {
      return of([]);
    }

    const status = params.status === 'all' || params.status == null ? '' : params.status;
    const search = params.search?.trim() ?? '';
    const httpParams = new HttpParams()
      .set('status', status)
      .set('search', search);

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    return this.http
      .get<AdminUserApiItem[] | { content?: AdminUserApiItem[]; data?: AdminUserApiItem[] }>(
        ADMIN_USERS_URL,
        { params: httpParams, headers }
      )
      .pipe(
        map((body) => {
          const list = Array.isArray(body)
            ? body
            : (body?.content ?? body?.data ?? []);
          return (list as AdminUserApiItem[]).map(mapApiItemToRow);
        }),
      );
  }

  /**
   * POST create a new user.
   * Body: { username, password, email, role, status }
   */
  createUser(body: {
    username: string;
    password: string;
    email: string;
    role: string;
    status: string;
  }): Observable<unknown> {
    const token = this.auth.token();
    if (!token) {
      return of(null);
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return this.http.post(ADMIN_USERS_URL, body, { headers });
  }

  /**
   * PUT update user by id.
   * Body: { username, email, password, role, status, merchantId?, subMerchantId? }
   */
  updateUser(
    userId: number,
    body: {
      username: string;
      email: string;
      password: string;
      role: string;
      status: string;
      merchantId?: number | null;
      subMerchantId?: number | null;
    }
  ): Observable<unknown> {
    const token = this.auth.token();
    if (!token) {
      return of(null);
    }
    const url = `${ADMIN_USERS_URL}/${userId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const payload = {
      ...body,
      merchantId: body.merchantId ?? null,
      subMerchantId: body.subMerchantId ?? null,
    };
    return this.http.put(url, payload, { headers });
  }

  /**
   * PUT update user status by id.
   * Calls PUT .../admin/users/{userId}/status with body { status }.
   * Used for Delete action (status: "DELETE") and other status updates.
   */
  updateUserStatus(userId: number, status: string): Observable<unknown> {
    const token = this.auth.token();
    if (!token) {
      return of(null);
    }
    const url = `${ADMIN_USERS_URL}/${userId}/status`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return this.http.put(url, { status }, { headers });
  }

  /**
   * PUT approve user by id.
   * Calls PUT .../admin/users/approval/{userId} with Bearer token.
   */
  approveUser(userId: number): Observable<unknown> {
    const token = this.auth.token();
    if (!token) {
      return of(null);
    }
    const url = `${ADMIN_USERS_URL}/approval/${userId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return this.http.put(url, {}, { headers });
  }
}
