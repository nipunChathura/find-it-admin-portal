import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const PAYMENTS_URL = 'http://localhost:9090/find-it/api/payments';
const ADMIN_PAYMENTS_URL = 'http://localhost:9090/find-it/api/admin/payments';

/** Raw payment item from GET /find-it/api/payments. */
export interface PaymentApiItem {
  paymentId?: number;
  outletId?: number;
  outletName?: string;
  amount?: number;
  paidMonth?: string;
  paymentDate?: string;
  paymentStatus?: string;
  paymentType?: string;
  receiptImage?: string;
  [key: string]: unknown;
}

/** Table row for Payment page. */
export interface PaymentRow {
  paymentId: number;
  outletId: number;
  outletName: string;
  amount: number;
  paidMonth: string;
  paymentDate: string;
  paymentStatus: string;
  paymentType: string;
  receiptImage: string;
}

/** Body for POST /payments and PUT /payments/:id (API uses "status", not "paymentStatus"). */
export interface CreatePaymentBody {
  outletId: number;
  paymentType: string;
  amount: number;
  paymentDate: string;
  paidMonth: string;
  receiptImage?: string | null;
  status: string;
}

function mapApiPaymentToRow(p: PaymentApiItem): PaymentRow {
  return {
    paymentId: Number(p.paymentId ?? 0),
    outletId: Number(p.outletId ?? 0),
    outletName: String(p.outletName ?? ''),
    amount: Number(p.amount ?? 0),
    paidMonth: String(p.paidMonth ?? ''),
    paymentDate: String(p.paymentDate ?? ''),
    paymentStatus: String(p.paymentStatus ?? ''),
    paymentType: String(p.paymentType ?? ''),
    receiptImage: String(p.receiptImage ?? ''),
  };
}

@Injectable({ providedIn: 'root' })
export class AdminPaymentsApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  /**
   * GET /find-it/api/payments?outletId=&status=
   */
  getPayments(params: { outletId?: string | number; status?: string }): Observable<PaymentRow[]> {
    const token = this.auth.token();
    if (!token) return of([]);
    const outletId = params.outletId == null || params.outletId === '' ? '' : String(params.outletId);
    const status = params.status == null || params.status === 'all' ? '' : String(params.status).trim();
    const httpParams = new HttpParams().set('outletId', outletId).set('status', status);
    const headers = { Authorization: `Bearer ${token}` };
    return this.http
      .get<PaymentApiItem[]>(PAYMENTS_URL, { params: httpParams, headers })
      .pipe(
        map((list) => (Array.isArray(list) ? list : []).map(mapApiPaymentToRow)),
      );
  }

  createPayment(body: CreatePaymentBody): Observable<unknown> {
    const token = this.auth.token();
    if (!token) return of(undefined);
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    return this.http.post(PAYMENTS_URL, body, { headers });
  }

  updatePayment(paymentId: number, body: CreatePaymentBody): Observable<unknown> {
    const token = this.auth.token();
    if (!token) return of(undefined);
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    return this.http.put(`${PAYMENTS_URL}/${paymentId}`, body, { headers });
  }

  deletePayment(paymentId: number): Observable<unknown> {
    const token = this.auth.token();
    if (!token) return of(undefined);
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.delete(`${PAYMENTS_URL}/${paymentId}`, { headers });
  }

  /**
   * PUT /find-it/api/admin/payments/:id/approve
   * Approve a PENDING payment.
   */
  approvePayment(paymentId: number): Observable<unknown> {
    const token = this.auth.token();
    if (!token) return of(undefined);
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.put(`${ADMIN_PAYMENTS_URL}/${paymentId}/approve`, {}, { headers });
  }
}
