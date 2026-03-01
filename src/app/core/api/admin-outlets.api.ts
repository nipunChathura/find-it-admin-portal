import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const ADMIN_OUTLETS_URL = 'http://localhost:9090/find-it/api/admin/outlets';
const CREATE_OUTLETS_URL = 'http://localhost:9090/find-it/api/outlets';

/** Payload for POST /find-it/api/outlets (create outlet). */
export interface CreateOutletPayload {
  merchantId: number;
  subMerchantId: number | null;
  outletName: string;
  businessRegistrationNumber: string;
  taxIdentificationNumber: string;
  postalCode: string;
  provinceId: number;
  districtId: number;
  cityId: number;
  contactNumber: string;
  emailAddress: string;
  addressLine1: string;
  addressLine2: string;
  outletType: string;
  businessCategory: string;
  latitude: number;
  longitude: number;
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  accountHolderName: string;
  remarks: string;
}

export interface OutletRow {
  outletId: number;
  outletName: string;
  outletAddress: string;
  outletPhone: string;
  status: string;
  merchantName: string;
  outletType: string;
}

/** Raw outlet item from GET admin outlets API. */
export interface OutletApiItem {
  outletId?: number;
  outletName?: string;
  outletType?: string;
  merchantId?: number;
  merchantName?: string;
  status?: string;
  contactNumber?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  address?: string;
  emailAddress?: string;
  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  bankBranch?: string;
  businessCategory?: string;
  businessRegistrationNumber?: string;
  cityId?: number;
  cityName?: string;
  districtId?: number;
  districtName?: string;
  provinceId?: number;
  provinceName?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  remarks?: string;
  subscriptionValidUntil?: string;
  taxIdentificationNumber?: string;
  [key: string]: unknown;
}

/** GET admin outlets API response wrapper. */
export interface GetOutletsApiResponse {
  outlets?: OutletApiItem[];
  responseCode?: string;
  responseMessage?: string;
  status?: string;
}

/** Table item with both display row and full API response for expandable detail. */
export interface OutletTableItem {
  row: OutletRow;
  raw: OutletApiItem;
}

function mapApiItemToRow(item: OutletApiItem): OutletRow {
  const id = item.outletId ?? 0;
  const addr1 = item.addressLine1 ?? item.address ?? '';
  const addr2 = item.addressLine2 ?? '';
  const outletAddress = addr2 ? `${addr1}, ${addr2}` : addr1;
  return {
    outletId: Number(id),
    outletName: String(item.outletName ?? ''),
    outletAddress,
    outletPhone: String(item.contactNumber ?? item.phone ?? ''),
    status: String(item.status ?? 'PENDING'),
    merchantName: String(item.merchantName ?? ''),
    outletType: String(item.outletType ?? ''),
  };
}

@Injectable({ providedIn: 'root' })
export class AdminOutletsApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  /**
   * GET all outlets with optional filters.
   * Query params: search, status, outletType.
   * Uses Bearer token from AuthService.
   */
  getOutlets(params: {
    status?: string;
    outletType?: string;
    search?: string;
  }): Observable<OutletTableItem[]> {
    const token = this.auth.token();
    if (!token) {
      return of([]);
    }

    const search = params.search?.trim() ?? '';
    const status =
      params.status === 'all' || !params.status ? '' : params.status;
    const outletType =
      params.outletType === 'all' || !params.outletType ? '' : params.outletType;

    let httpParams = new HttpParams()
      .set('search', search)
      .set('status', status)
      .set('outletType', outletType);

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    return this.http
      .get<OutletApiItem[] | GetOutletsApiResponse>(ADMIN_OUTLETS_URL, {
        params: httpParams,
        headers,
      })
      .pipe(
        map((body) => {
          const list = Array.isArray(body)
            ? body
            : (body as GetOutletsApiResponse).outlets ??
              (body as { content?: OutletApiItem[] }).content ??
              (body as { data?: OutletApiItem[] }).data ??
              [];
          return (list as OutletApiItem[]).map((item) => ({
            row: mapApiItemToRow(item),
            raw: item,
          }));
        }),
      );
  }

  /**
   * POST create outlet (full payload) to /find-it/api/outlets.
   */
  createOutletWithPayload(body: CreateOutletPayload): Observable<OutletApiItem | unknown> {
    const token = this.auth.token();
    if (!token) {
      return of({});
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return this.http.post<OutletApiItem | unknown>(CREATE_OUTLETS_URL, body, { headers });
  }

  /**
   * PUT update outlet (full payload) at /find-it/api/outlets/:id.
   */
  updateOutletWithPayload(
    outletId: number,
    body: Partial<CreateOutletPayload>,
  ): Observable<OutletApiItem | unknown> {
    const token = this.auth.token();
    if (!token) {
      return of({});
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const url = `${CREATE_OUTLETS_URL}/${outletId}`;
    return this.http.put<OutletApiItem | unknown>(url, body, { headers });
  }

  /**
   * POST create outlet (legacy simple body). Prefer createOutletWithPayload for new flows.
   */
  createOutlet(body: Omit<OutletRow, 'outletId'>): Observable<OutletRow> {
    const token = this.auth.token();
    if (!token) {
      return of({} as OutletRow);
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return this.http
      .post<OutletApiItem>(ADMIN_OUTLETS_URL, body, { headers })
      .pipe(map(mapApiItemToRow));
  }

  /**
   * PUT update outlet by id.
   */
  updateOutlet(
    outletId: number,
    body: Partial<OutletRow>
  ): Observable<OutletRow> {
    const token = this.auth.token();
    if (!token) {
      return of({} as OutletRow);
    }
    const url = `${ADMIN_OUTLETS_URL}/${outletId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return this.http
      .put<OutletApiItem>(url, body, { headers })
      .pipe(map(mapApiItemToRow));
  }

  /**
   * DELETE outlet by id.
   */
  deleteOutlet(outletId: number): Observable<void> {
    const token = this.auth.token();
    if (!token) {
      return of(undefined);
    }
    const url = `${ADMIN_OUTLETS_URL}/${outletId}`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.delete<void>(url, { headers });
  }
}
