import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const CUSTOMERS_URL = 'http://localhost:9090/find-it/api/customers';

/** Raw customer item from GET customers API. */
export interface AdminCustomerApiItem {
  customerId?: number;
  id?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  membershipType?: string;
  phoneNumber?: string;
  status?: string;
  [key: string]: unknown;
}

/** Table row shape used by the Manage Customer page. */
export interface ViewCustomerRow {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  membershipType: string;
  createdDate: string;
  nic: string;
  dob: string;
  gender: string;
  country: string;
}

/** Request body for PUT /api/customers/:id */
export interface UpdateCustomerBody {
  firstName: string;
  lastName: string;
  nic: string | null;
  dob: string | null;
  gender: string | null;
  country: string | null;
  profileImage: string | null;
  email: string;
  phoneNumber: string;
  membershipType: string;
  status: string;
}

function mapApiItemToRow(item: AdminCustomerApiItem): ViewCustomerRow {
  const id = item.customerId ?? item.id ?? 0;
  const first = String(item.firstName ?? '').trim();
  const last = String(item.lastName ?? '').trim();
  const name = [first, last].filter(Boolean).join(' ') || '—';
  return {
    id: Number(id),
    name,
    firstName: first,
    lastName: last,
    email: String(item.email ?? ''),
    phone: String(item.phoneNumber ?? item['phone'] ?? ''),
    status: String(item.status ?? 'ACTIVE'),
    membershipType: String(item.membershipType ?? ''),
    createdDate: '',
    nic: String(item['nic'] ?? '').trim(),
    dob: String(item['dob'] ?? '').trim(),
    gender: String(item['gender'] ?? '').trim(),
    country: String(item['country'] ?? '').trim(),
  };
}

@Injectable({ providedIn: 'root' })
export class AdminCustomersApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  getCustomers(params: { status?: string; search?: string; membershipType?: string }): Observable<ViewCustomerRow[]> {
    const token = this.auth.token();
    if (!token) {
      return of([]);
    }

    const status = params.status === 'all' || params.status == null ? '' : (params.status ?? '');
    const search = (params.search?.trim() ?? '');
    const membershipType = params.membershipType === 'all' || params.membershipType == null ? '' : (params.membershipType ?? '');
    // Match working curl: ?search=&status=&membershipType=
    const query = `search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&membershipType=${encodeURIComponent(membershipType)}`;
    const url = `${CUSTOMERS_URL}?${query}`;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    return this.http
      .get<AdminCustomerApiItem[] | { content?: AdminCustomerApiItem[]; data?: AdminCustomerApiItem[] }>(url, { headers })
      .pipe(
        map((body) => {
          const list = Array.isArray(body)
            ? body
            : (body?.content ?? body?.data ?? []);
          return (list as AdminCustomerApiItem[]).map(mapApiItemToRow);
        }),
      );
  }

  createCustomer(body: {
    name: string;
    email: string;
    phone?: string;
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
    return this.http.post(CUSTOMERS_URL, body, { headers });
  }

  /** PUT /api/customers/:id – body must match backend (firstName, lastName, nic, dob, gender, country, profileImage, email, phoneNumber, membershipType, status). */
  updateCustomer(customerId: number, body: UpdateCustomerBody): Observable<unknown> {
    const token = this.auth.token();
    if (!token) {
      return of(null);
    }
    const url = `${CUSTOMERS_URL}/${customerId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return this.http.put(url, body, { headers });
  }

  deleteCustomer(customerId: number): Observable<unknown> {
    const token = this.auth.token();
    if (!token) {
      return of(null);
    }
    const url = `${CUSTOMERS_URL}/${customerId}`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.delete(url, { headers });
  }
}
