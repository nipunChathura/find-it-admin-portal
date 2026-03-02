import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const ITEMS_URL = 'http://localhost:9090/find-it/api/items';

/** Raw item from GET /find-it/api/items. */
export interface ItemApiItem {
  itemId?: number;
  itemName?: string;
  itemDescription?: string;
  categoryId?: number;
  categoryName?: string;
  categoryTypeName?: string;
  outletId?: number;
  outletName?: string;
  price?: number;
  availability?: boolean;
  itemImage?: string | null;
  status?: string;
  [key: string]: unknown;
}

/** Table row for Manage Item page. */
export interface ViewItemRow {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  categoryTypeName: string;
  outletId: number;
  outletName: string;
  price: number;
  status: string;
  availability: boolean;
  itemImage: string | null;
}

function mapApiItemToRow(item: ItemApiItem): ViewItemRow {
  return {
    id: Number(item.itemId ?? 0),
    name: String(item.itemName ?? ''),
    description: String(item.itemDescription ?? ''),
    categoryId: Number(item.categoryId ?? 0),
    categoryName: String(item.categoryName ?? ''),
    categoryTypeName: String(item.categoryTypeName ?? ''),
    outletId: Number(item.outletId ?? 0),
    outletName: String(item.outletName ?? ''),
    price: Number(item.price ?? 0),
    status: String(item.status ?? 'ACTIVE'),
    availability: item.availability === true,
    itemImage: item.itemImage ?? null,
  };
}

@Injectable({ providedIn: 'root' })
export class AdminItemsApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  /**
   * GET /find-it/api/items?search=&categoryId=&outletId=&status=&availability=
   * Response: array of { itemId, itemName, itemDescription, categoryId, categoryName, categoryTypeName, outletId, outletName, price, availability, itemImage, status }
   */
  getItems(params: {
    search?: string;
    categoryId?: string | number;
    outletId?: string | number;
    status?: string;
    availability?: string;
  }): Observable<ViewItemRow[]> {
    const token = this.auth.token();
    if (!token) return of([]);
    const search = params.search?.trim() ?? '';
    const status = params.status === 'all' || params.status == null || params.status === '' ? '' : params.status;
    const availability = params.availability === 'all' || params.availability == null || params.availability === '' ? '' : params.availability;
    let httpParams = new HttpParams().set('search', search).set('status', status).set('availability', availability);
    if (params.categoryId != null && params.categoryId !== '') {
      httpParams = httpParams.set('categoryId', String(params.categoryId));
    }
    if (params.outletId != null && params.outletId !== '') {
      httpParams = httpParams.set('outletId', String(params.outletId));
    }
    const headers = { Authorization: `Bearer ${token}` };
    return this.http
      .get<ItemApiItem[] | { content?: ItemApiItem[]; data?: ItemApiItem[] }>(ITEMS_URL, {
        params: httpParams,
        headers,
      })
      .pipe(
        map((body) => {
          const list = Array.isArray(body) ? body : (body?.content ?? body?.data ?? []);
          return (list as ItemApiItem[]).map(mapApiItemToRow);
        }),
      );
  }

  createItem(body: { name: string; description: string; status: string }): Observable<unknown> {
    const token = this.auth.token();
    if (!token) return of(null);
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    return this.http.post(ITEMS_URL, body, { headers });
  }

  /**
   * PUT /find-it/api/items/:id
   * Body: { itemName, itemDescription, categoryId, outletId, price, availability, itemImage, status }
   */
  updateItem(
    itemId: number,
    body: {
      itemName: string;
      itemDescription: string;
      categoryId: number;
      outletId: number;
      price: number;
      availability: boolean;
      itemImage: string | null;
      status: string;
    },
  ): Observable<unknown> {
    const token = this.auth.token();
    if (!token) return of(null);
    const url = `${ITEMS_URL}/${itemId}`;
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    return this.http.put(url, body, { headers });
  }

  deleteItem(itemId: number): Observable<unknown> {
    const token = this.auth.token();
    if (!token) return of(null);
    const url = `${ITEMS_URL}/${itemId}`;
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.delete(url, { headers });
  }
}
