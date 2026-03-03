import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/** Body for POST /find-it/api/discounts and PUT /find-it/api/discounts/:id */
export interface CreateDiscountBody {
  discountName: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  status: string;
  itemIds: number[];
  /** Optional discount image URL (e.g. "https://example.com/sale.png"). */
  discountImage?: string | null;
}

/** Alias for create body (same shape as update). */
export type UpdateDiscountBody = CreateDiscountBody;

const DISCOUNTS_URL = 'http://localhost:9090/find-it/api/discounts';

/** Item inside discount from API. */
export interface DiscountItemApi {
  itemId?: number;
  itemName?: string;
}

/** Raw discount from GET /find-it/api/discounts. */
export interface DiscountApiItem {
  discountId?: number;
  discountName?: string;
  discountStatus?: string;
  discountType?: string;
  discountValue?: number;
  startDate?: string;
  endDate?: string;
  discountImage?: string;
  itemIds?: number[];
  items?: DiscountItemApi[];
  [key: string]: unknown;
}

/** Table row for Item Discount page. */
export interface DiscountRow {
  discountId: number;
  discountName: string;
  discountStatus: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  discountImage?: string;
  itemIds: number[];
  items: { itemId: number; itemName: string }[];
}

function mapApiDiscountToRow(d: DiscountApiItem): DiscountRow {
  const items = (d.items ?? []).map((x) => ({
    itemId: Number(x.itemId ?? 0),
    itemName: String(x.itemName ?? ''),
  }));
  return {
    discountId: Number(d.discountId ?? 0),
    discountName: String(d.discountName ?? ''),
    discountStatus: String(d.discountStatus ?? ''),
    discountType: String(d.discountType ?? ''),
    discountValue: Number(d.discountValue ?? 0),
    startDate: String(d.startDate ?? ''),
    endDate: String(d.endDate ?? ''),
    discountImage: d.discountImage != null ? String(d.discountImage) : undefined,
    itemIds: Array.isArray(d.itemIds) ? d.itemIds : [],
    items,
  };
}

@Injectable({ providedIn: 'root' })
export class AdminDiscountsApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  /**
   * GET /find-it/api/discounts?status=&itemId=
   * Query params: status (optional), itemId (optional). Omit param when empty.
   */
  getDiscounts(params: { status?: string; itemId?: string | number }): Observable<DiscountRow[]> {
    const token = this.auth.token();
    if (!token) return of([]);
    const status = params.status == null || params.status === 'all' ? '' : String(params.status).trim();
    const itemId = params.itemId == null || params.itemId === '' ? '' : String(params.itemId);
    const httpParams = new HttpParams().set('status', status).set('itemId', itemId);
    const headers = { Authorization: `Bearer ${token}` };
    return this.http
      .get<DiscountApiItem[]>(DISCOUNTS_URL, { params: httpParams, headers })
      .pipe(
        map((list) => (Array.isArray(list) ? list : []).map(mapApiDiscountToRow)),
      );
  }

  /**
   * POST /find-it/api/discounts
   * Body: { discountName, discountType, discountValue, startDate, endDate, status, itemIds }
   */
  createDiscount(body: CreateDiscountBody): Observable<unknown> {
    const token = this.auth.token();
    if (!token) return of(undefined);
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return this.http.post(DISCOUNTS_URL, body, { headers });
  }

  /**
   * PUT /find-it/api/discounts/:id
   * Body: { discountName, discountType, discountValue, startDate, endDate, status, itemIds }
   */
  updateDiscount(discountId: number, body: UpdateDiscountBody): Observable<unknown> {
    const token = this.auth.token();
    if (!token) return of(undefined);
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return this.http.put(`${DISCOUNTS_URL}/${discountId}`, body, { headers });
  }

  /**
   * DELETE /find-it/api/discounts/:id
   */
  deleteDiscount(discountId: number): Observable<unknown> {
    const token = this.auth.token();
    if (!token) return of(undefined);
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.delete(`${DISCOUNTS_URL}/${discountId}`, { headers });
  }
}
