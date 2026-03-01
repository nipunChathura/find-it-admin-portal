import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const ADMIN_MERCHANTS_URL = 'http://localhost:9090/find-it/api/admin/merchants';

export type MerchantType = 'FREE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export interface MerchantRow {
  merchantId: number;
  merchantName: string;
  merchantEmail: string;
  merchantNic: string;
  merchantProfileImage: string;
  merchantAddress: string;
  merchantPhoneNumber: string;
  merchantType: MerchantType;
  merchantStatus: string;
  parentMerchantName: string;
}

/** Raw merchant item from GET admin merchants API. */
export interface MerchantApiItem {
  merchantId?: number;
  id?: number;
  merchantName?: string;
  name?: string;
  merchantEmail?: string;
  email?: string;
  username?: string;
  merchantNic?: string;
  nic?: string;
  merchantProfileImage?: string;
  merchantAddress?: string;
  address?: string;
  merchantPhoneNumber?: string;
  phoneNumber?: string;
  phone?: string;
  merchantType?: string;
  merchantStatus?: string;
  status?: string;
  type?: string;
  parentMerchantName?: string;
  subMerchantId?: number;
  [key: string]: unknown;
}

/** GET admin merchants API response wrapper. */
export interface GetMerchantsApiResponse {
  merchants?: MerchantApiItem[];
  responseCode?: string;
  responseMessage?: string;
  status?: string;
}

function mapApiItemToRow(item: MerchantApiItem): MerchantRow {
  const id = item.merchantId ?? item.id ?? 0;
  const type = (item.merchantType ?? 'FREE') as MerchantType;
  const validTypes: MerchantType[] = ['FREE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  const merchantType = validTypes.includes(type) ? type : 'FREE';
  return {
    merchantId: Number(id),
    merchantName: String(item.merchantName ?? item.name ?? ''),
    merchantEmail: String(item.merchantEmail ?? item.email ?? ''),
    merchantNic: String(item.merchantNic ?? item.nic ?? ''),
    merchantProfileImage: String(item.merchantProfileImage ?? ''),
    merchantAddress: String(item.merchantAddress ?? item.address ?? ''),
    merchantPhoneNumber: String(
      item.merchantPhoneNumber ?? item.phoneNumber ?? item.phone ?? ''
    ),
    merchantType,
    merchantStatus: String(item.merchantStatus ?? item.status ?? 'ACTIVE'),
    parentMerchantName: String(
      item.parentMerchantName ?? item['peirentMercahntName'] ?? ''
    ),
  };
}

@Injectable({ providedIn: 'root' })
export class AdminMerchantsApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  /**
   * GET all merchants with optional filters.
   * Query params: merchantType, status, search.
   * Uses Bearer token from AuthService.
   */
  getMerchants(params: {
    status?: string;
    merchantType?: string;
    search?: string;
  }): Observable<MerchantRow[]> {
    const token = this.auth.token();
    if (!token) {
      return of([]);
    }

    let httpParams = new HttpParams();
    const status =
      params.status === 'all' || !params.status ? '' : params.status;
    const merchantType =
      params.merchantType === 'all' || !params.merchantType
        ? ''
        : params.merchantType;
    const search = params.search?.trim() ?? '';

    if (status) httpParams = httpParams.set('status', status);
    if (merchantType) httpParams = httpParams.set('merchantType', merchantType);
    if (search) httpParams = httpParams.set('search', search);

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    return this.http
      .get<MerchantApiItem[] | GetMerchantsApiResponse>(
        ADMIN_MERCHANTS_URL,
        { params: httpParams, headers }
      )
      .pipe(
        map((body) => {
          const list = Array.isArray(body)
            ? body
            : (body as GetMerchantsApiResponse).merchants ??
              (body as { content?: MerchantApiItem[] }).content ??
              (body as { data?: MerchantApiItem[] }).data ??
              [];
          return (list as MerchantApiItem[]).map(mapApiItemToRow);
        }),
      );
  }

  /**
   * POST create merchant.
   */
  createMerchant(body: Omit<MerchantRow, 'merchantId'>): Observable<MerchantRow> {
    const token = this.auth.token();
    if (!token) {
      return of({} as MerchantRow);
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return this.http
      .post<MerchantApiItem>(ADMIN_MERCHANTS_URL, body, { headers })
      .pipe(map(mapApiItemToRow));
  }

  /**
   * PUT update merchant by id.
   */
  updateMerchant(
    merchantId: number,
    body: Partial<MerchantRow>
  ): Observable<MerchantRow> {
    const token = this.auth.token();
    if (!token) {
      return of({} as MerchantRow);
    }
    const url = `${ADMIN_MERCHANTS_URL}/${merchantId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return this.http
      .put<MerchantApiItem>(url, body, { headers })
      .pipe(map(mapApiItemToRow));
  }

  /**
   * DELETE merchant by id.
   */
  deleteMerchant(merchantId: number): Observable<void> {
    const token = this.auth.token();
    if (!token) {
      return of(undefined);
    }
    const url = `${ADMIN_MERCHANTS_URL}/${merchantId}`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.delete<void>(url, { headers });
  }
}
