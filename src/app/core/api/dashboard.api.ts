import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const DASHBOARD_BASE = 'http://localhost:9090/find-it/api/dashboard';

/** KPI counts from GET /dashboard/summary */
export interface DashboardSummaryData {
  totalUsers: number;
  totalMerchants: number;
  totalSubMerchants: number;
  totalItems: number;
  totalCustomers: number;
  totalOutlets: number;
  totalCategories: number;
  pendingApprovals: number;
  activeDiscounts: number;
}

export interface DashboardSummaryResponse {
  responseCode?: string;
  status?: string;
  data?: DashboardSummaryData;
}

/** Raw backend response: counts at root with names users, merchants, subMerchants, items, etc. */
export interface DashboardSummaryRawResponse {
  responseCode?: string;
  status?: string;
  users?: number;
  merchants?: number;
  subMerchants?: number;
  items?: number;
  customers?: number;
  outlets?: number;
  categories?: number;
  pendingApprovals?: number;
  activeDiscounts?: number;
}

/** Chart point from GET /dashboard/activity */
export interface DashboardActivityPoint {
  label: string;
  value: number;
  color?: string;
}

export interface DashboardActivityResponse {
  responseCode?: string;
  status?: string;
  data?: DashboardActivityPoint[];
}

/** Monthly income point (label = month, value = income amount e.g. LKR). */
export interface MonthlyIncomePoint {
  label: string;
  value: number;
  color?: string;
}

/** Backend response: GET /dashboard/monthly-income?months=6 */
export interface MonthlyIncomeApiResponse {
  status?: string;
  responseCode?: string;
  months?: number;
  incomeData?: { month: string; income: number }[];
}

/** Recent activity item from GET /dashboard/recent-activity */
export interface DashboardRecentActivityItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  icon: string;
  type: 'user' | 'merchant' | 'outlet' | 'payment' | 'discount' | 'item';
}

export interface DashboardRecentActivityResponse {
  responseCode?: string;
  status?: string;
  data?: DashboardRecentActivityItem[];
}

/** Outlet distribution slice for pie chart (label + value). */
export interface OutletPieSlice {
  label: string;
  value: number;
  color?: string;
}

/** GET /dashboard/merchant-summary – merchant summary + outlet distribution for pie chart */
export interface MerchantSummaryData {
  totalMerchants?: number;
  totalOutlets?: number;
  /** Outlet distribution for pie chart (e.g. by merchant, by status, by region). */
  outletDistribution?: OutletPieSlice[];
}

export interface MerchantSummaryResponse {
  responseCode?: string;
  status?: string;
  data?: MerchantSummaryData;
}

/** Fallback dummy data when API is not available */
const DUMMY_SUMMARY: DashboardSummaryData = {
  totalUsers: 1247,
  totalMerchants: 89,
  totalSubMerchants: 24,
  totalItems: 3420,
  totalCustomers: 5620,
  totalOutlets: 156,
  totalCategories: 24,
  pendingApprovals: 12,
  activeDiscounts: 48,
};

const DUMMY_ACTIVITY: DashboardActivityPoint[] = [
  { label: 'Jan', value: 420 },
  { label: 'Feb', value: 380 },
  { label: 'Mar', value: 510 },
  { label: 'Apr', value: 490 },
  { label: 'May', value: 620 },
  { label: 'Jun', value: 580 },
];

/** Dummy monthly income (LKR) for last 6 months. */
const DUMMY_MONTHLY_INCOME: MonthlyIncomePoint[] = [
  { label: 'Jan', value: 425000 },
  { label: 'Feb', value: 398000 },
  { label: 'Mar', value: 512000 },
  { label: 'Apr', value: 485000 },
  { label: 'May', value: 620000 },
  { label: 'Jun', value: 578000 },
];

const DUMMY_RECENT: DashboardRecentActivityItem[] = [
  { id: '1', title: 'New user registered', subtitle: 'john.doe@example.com', time: '2m ago', icon: 'person_add', type: 'user' },
  { id: '2', title: 'Merchant approved', subtitle: 'Green Mart', time: '15m ago', icon: 'store', type: 'merchant' },
  { id: '3', title: 'Payment received', subtitle: 'Outlet #42 - LKR 15,200', time: '1h ago', icon: 'payment', type: 'payment' },
  { id: '4', title: 'Discount created', subtitle: 'Summer Sale 20%', time: '2h ago', icon: 'local_offer', type: 'discount' },
  { id: '5', title: 'New item added', subtitle: 'Electronics - 12 items', time: '3h ago', icon: 'inventory_2', type: 'item' },
];

const DUMMY_MERCHANT_SUMMARY: MerchantSummaryData = {
  totalMerchants: 89,
  totalOutlets: 156,
  outletDistribution: [
    { label: 'Retail', value: 62 },
    { label: 'Food & Beverage', value: 38 },
    { label: 'Services', value: 28 },
    { label: 'Other', value: 28 },
  ],
};

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  /**
   * GET http://localhost:9090/find-it/api/dashboard/summary
   * Header: Authorization: Bearer <JWT>
   * Returns KPI counts. Backend may return root-level: users, merchants, items, customers, outlets, categories, pendingApprovals, activeDiscounts.
   * Falls back to dummy data only if request fails (network/4xx/5xx).
   */
  getSummary(): Observable<DashboardSummaryData> {
    const token = this.auth.token();
    if (!token || typeof token !== 'string') {
      return of(DUMMY_SUMMARY);
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http
      .get<unknown>(`${DASHBOARD_BASE}/summary`, { headers })
      .pipe(
        map((res) => this.normalizeSummaryResponse(res)),
        catchError(() => of(DUMMY_SUMMARY)),
      );
  }

  private normalizeSummaryResponse(res: unknown): DashboardSummaryData {
    const body = res != null && typeof res === 'object' ? (res as Record<string, unknown>) : {};
    const data = body['data'];
    const from = data != null && typeof data === 'object' ? (data as Record<string, unknown>) : body;
    const raw = from as Record<string, unknown>;
    const num = (v: unknown): number => {
      if (typeof v === 'number' && !Number.isNaN(v)) return v;
      const n = Number(v);
      return Number.isNaN(n) ? 0 : n;
    };
    return {
      totalUsers: num(raw['totalUsers'] ?? raw['users']),
      totalMerchants: num(raw['totalMerchants'] ?? raw['merchants']),
      totalSubMerchants: num(raw['totalSubMerchants'] ?? raw['subMerchants']),
      totalItems: num(raw['totalItems'] ?? raw['items']),
      totalCustomers: num(raw['totalCustomers'] ?? raw['customers']),
      totalOutlets: num(raw['totalOutlets'] ?? raw['outlets']),
      totalCategories: num(raw['totalCategories'] ?? raw['categories']),
      pendingApprovals: num(raw['pendingApprovals']),
      activeDiscounts: num(raw['activeDiscounts']),
    };
  }

  /**
   * GET /find-it/api/dashboard/activity?months=6
   * Returns chart data (e.g. per month). Falls back to dummy data if API fails.
   */
  getActivity(months: number = 6): Observable<DashboardActivityPoint[]> {
    const token = this.auth.token();
    if (!token) return of(DUMMY_ACTIVITY);
    const params = new HttpParams().set('months', String(months));
    const headers = { Authorization: `Bearer ${token}` };
    return this.http
      .get<DashboardActivityResponse>(`${DASHBOARD_BASE}/activity`, { params, headers })
      .pipe(
        map((res) => res?.data?.length ? res.data : DUMMY_ACTIVITY),
        catchError(() => of(DUMMY_ACTIVITY)),
      );
  }

  /**
   * GET /find-it/api/dashboard/monthly-income?months=6
   * Response: { status, responseCode, months, incomeData: [ { month: "2024-03", income: 12500 }, ... ] }
   * Returns monthly income chart points. Falls back to dummy data if API fails.
   */
  getMonthlyIncome(months: number = 6): Observable<MonthlyIncomePoint[]> {
    const token = this.auth.token();
    if (!token) return of(DUMMY_MONTHLY_INCOME);
    const params = new HttpParams().set('months', String(months));
    const headers = { Authorization: `Bearer ${token}` };
    return this.http
      .get<MonthlyIncomeApiResponse>(`${DASHBOARD_BASE}/monthly-income`, { params, headers })
      .pipe(
        map((res) => this.normalizeMonthlyIncomeResponse(res)),
        catchError(() => of(DUMMY_MONTHLY_INCOME)),
      );
  }

  private normalizeMonthlyIncomeResponse(res: MonthlyIncomeApiResponse): MonthlyIncomePoint[] {
    const list = res?.incomeData;
    if (!Array.isArray(list) || list.length === 0) return DUMMY_MONTHLY_INCOME;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return list.map((item) => {
      const value = typeof item.income === 'number' && !Number.isNaN(item.income) ? item.income : 0;
      let label = item.month ?? '';
      if (label.length === 7 && label[4] === '-') {
        const m = parseInt(label.slice(5, 7), 10);
        const monthName = monthNames[m - 1] ?? label.slice(5, 7);
        const year = label.slice(0, 4);
        label = `${monthName} ${year}`;
      }
      return { label, value };
    });
  }

  /**
   * GET /find-it/api/dashboard/recent-activity?limit=10
   * Returns recent activity feed. Falls back to dummy data if API fails.
   */
  getRecentActivity(limit: number = 10): Observable<DashboardRecentActivityItem[]> {
    const token = this.auth.token();
    if (!token) return of(DUMMY_RECENT);
    const params = new HttpParams().set('limit', String(limit));
    const headers = { Authorization: `Bearer ${token}` };
    return this.http
      .get<DashboardRecentActivityResponse>(`${DASHBOARD_BASE}/recent-activity`, { params, headers })
      .pipe(
        map((res) => res?.data?.length ? res.data : DUMMY_RECENT),
        catchError(() => of(DUMMY_RECENT)),
      );
  }

  /**
   * GET http://localhost:9090/find-it/api/dashboard/merchant-summary
   * Header: Authorization: Bearer <JWT>
   * Returns merchant summary (totalMerchants, totalOutlets) and outletDistribution for pie chart.
   * Accepts { data: { ... } } or root-level fields. Falls back to dummy data if API fails.
   */
  getMerchantSummary(): Observable<MerchantSummaryData> {
    const token = this.auth.token();
    if (!token) return of(DUMMY_MERCHANT_SUMMARY);
    const headers = { Authorization: `Bearer ${token}` };
    return this.http
      .get<MerchantSummaryResponse & MerchantSummaryData>(`${DASHBOARD_BASE}/merchant-summary`, { headers })
      .pipe(
        map((res) => this.normalizeMerchantSummaryResponse(res)),
        catchError(() => of(DUMMY_MERCHANT_SUMMARY)),
      );
  }

  private normalizeMerchantSummaryResponse(
    res: MerchantSummaryResponse & Partial<MerchantSummaryData>,
  ): MerchantSummaryData {
    const from = res?.data ?? (res as Partial<MerchantSummaryData>);
    if (!from) return DUMMY_MERCHANT_SUMMARY;
    const totalMerchants = typeof from.totalMerchants === 'number' ? from.totalMerchants : DUMMY_MERCHANT_SUMMARY.totalMerchants ?? 0;
    const totalOutlets = typeof from.totalOutlets === 'number' ? from.totalOutlets : DUMMY_MERCHANT_SUMMARY.totalOutlets ?? 0;
    const outletDistribution = Array.isArray(from.outletDistribution) && from.outletDistribution.length
      ? from.outletDistribution
      : DUMMY_MERCHANT_SUMMARY.outletDistribution ?? [];
    return { totalMerchants, totalOutlets, outletDistribution };
  }
}
