import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const ADMIN_ITEMS_URL = 'http://localhost:9090/find-it/api/admin/items';

/** Raw item from GET admin items API. */
export interface AdminItemApiItem {
  id?: number;
  itemId?: number;
  name?: string;
  description?: string;
  status?: string;
  createdDate?: string;
  createdDatetime?: string;
  createdAt?: string;
  [key: string]: unknown;
}

/** Table row for Manage Item page. */
export interface ViewItemRow {
  id: number;
  name: string;
  description: string;
  status: string;
  createdDate: string;
}

function mapApiItemToRow(item: AdminItemApiItem): ViewItemRow {
  const id = item.itemId ?? item.id ?? 0;
  const created =
    item.createdDatetime ?? item.createdDate ?? item.createdAt ?? '';
  return {
    id: Number(id),
    name: String(item.name ?? ''),
    description: String(item.description ?? ''),
    status: String(item.status ?? 'ACTIVE'),
    createdDate: created ? String(created).slice(0, 10) : '',
  };
}

@Injectable({ providedIn: 'root' })
export class AdminItemsApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  getItems(params: { status?: string; search?: string }): Observable<ViewItemRow[]> {
    const token = this.auth.token();
    if (!token) return of([]);
    const status = params.status === 'all' || params.status == null ? '' : params.status;
    const search = params.search?.trim() ?? '';
    const httpParams = new HttpParams().set('status', status).set('search', search);
    const headers = { Authorization: `Bearer ${token}` };
    return this.http
      .get<AdminItemApiItem[] | { content?: AdminItemApiItem[]; data?: AdminItemApiItem[] }>(
        ADMIN_ITEMS_URL,
        { params: httpParams, headers },
      )
      .pipe(
        map((body) => {
          const list = Array.isArray(body) ? body : (body?.content ?? body?.data ?? []);
          return (list as AdminItemApiItem[]).map(mapApiItemToRow);
        }),
      );
  }

  createItem(body: { name: string; description: string; status: string }): Observable<unknown> {
    const token = this.auth.token();
    if (!token) return of(null);
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    return this.http.post(ADMIN_ITEMS_URL, body, { headers });
  }

  updateItem(
    itemId: number,
    body: { name: string; description: string; status: string },
  ): Observable<unknown> {
    const token = this.auth.token();
    if (!token) return of(null);
    const url = `${ADMIN_ITEMS_URL}/${itemId}`;
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    return this.http.put(url, body, { headers });
  }

  deleteItem(itemId: number): Observable<unknown> {
    const token = this.auth.token();
    if (!token) return of(null);
    const url = `${ADMIN_ITEMS_URL}/${itemId}`;
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.delete(url, { headers });
  }
}
