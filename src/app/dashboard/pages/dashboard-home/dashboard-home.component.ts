import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/auth/auth.service';
import {
  DashboardApiService,
  DashboardSummaryData,
  MerchantSummaryData,
  OutletPieSlice,
  MonthlyIncomePoint,
} from '../../../core/api/dashboard.api';
import { NotificationService } from '../../../core/notifications/notification.service';
import { Notification, NotificationType } from '../../../core/notifications/notification.model';

/** Chart colors for bar chart (CSS vars). */
const CHART_COLORS = [
  'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)',
  'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)',
];

/** Explicit hex colors for outlet pie chart (SVG fill). */
const PIE_COLORS = [
  '#5c6bc0', '#42a5f5', '#26a69a', '#66bb6a', '#ffa726', '#ab47bc',
  '#ec407a', '#8d6e63',
];

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss',
})
export class DashboardHomeComponent implements OnInit {
  /** KPI stats from dashboard API (or dummy fallback). */
  stats: DashboardSummaryData = {
    totalUsers: 0,
    totalMerchants: 0,
    totalSubMerchants: 0,
    totalItems: 0,
    totalCustomers: 0,
    totalOutlets: 0,
    totalCategories: 0,
    pendingApprovals: 0,
    activeDiscounts: 0,
  };

  /** Monthly income chart data (last 6 months, value in LKR). */
  monthlyIncomeData: MonthlyIncomePoint[] = [];

  /** Recent notifications (from NotificationService, max 5). */
  recentNotifications: Notification[] = [];

  /** Merchant summary from GET /dashboard/merchant-summary (or dummy fallback). */
  merchantSummary: MerchantSummaryData = {};

  /** Outlet pie chart slices (from merchantSummary.outletDistribution with colors). */
  outletPieData: OutletPieSlice[] = [];

  username = '';

  private readonly cdr = inject(ChangeDetectorRef);

  constructor(
    private readonly authService: AuthService,
    private readonly dashboardApi: DashboardApiService,
    private readonly notificationService: NotificationService,
  ) {
    this.username = this.authService.user()?.username ?? 'Admin';
  }

  ngOnInit(): void {
    this.dashboardApi.getSummary().subscribe((data) => {
      this.stats = { ...data };
      this.cdr.detectChanges();
    });
    this.dashboardApi.getMonthlyIncome(6).subscribe((data) => {
      this.monthlyIncomeData = data.map((d, i) => ({
        ...d,
        color: d.color ?? CHART_COLORS[i % CHART_COLORS.length],
      }));
      this.cdr.detectChanges();
    });
    this.notificationService.fetchAllNotifications().subscribe((list) => {
      this.recentNotifications = list.slice(0, 5);
      this.cdr.detectChanges();
    });
    this.dashboardApi.getMerchantSummary().subscribe((data) => {
      this.merchantSummary = data;
      const dist = data?.outletDistribution ?? [];
      this.outletPieData = dist.map((d, i) => ({
        ...d,
        color: d.color ?? PIE_COLORS[i % PIE_COLORS.length],
      }));
      this.cdr.detectChanges();
    });
  }

  /** Max value for monthly income bar chart scale. */
  get monthlyIncomeMax(): number {
    return Math.max(...this.monthlyIncomeData.map((d) => d?.value ?? 0), 1);
  }

  trackByIncomeLabel(_index: number, d: MonthlyIncomePoint): string | number {
    return d?.label ?? _index;
  }

  /** Total of outlet pie values (for segment %). */
  get outletPieTotal(): number {
    return this.outletPieData.reduce((s, d) => s + d.value, 0) || 1;
  }

  /** Cumulative offset (0–1) for each pie slice. */
  getOutletPieOffset(index: number): number {
    let sum = 0;
    for (let i = 0; i < index; i++) sum += this.outletPieData[i]?.value ?? 0;
    return sum / this.outletPieTotal;
  }

  /** Length (0–1) of pie slice. */
  getOutletPieLength(index: number): number {
    const v = this.outletPieData[index]?.value ?? 0;
    return v / this.outletPieTotal;
  }

  /** SVG path for one pie slice (full circle when all slices drawn). Center 50,50 radius 45; angle 0 = top, clockwise. */
  formatNotificationTime(date: Date): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  }

  getNotificationTypeIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
    };
    return icons[type] ?? 'info';
  }

  getOutletPieSlicePath(index: number): string {
    const cx = 50;
    const cy = 50;
    const r = 45;
    const start = this.getOutletPieOffset(index);
    const len = this.getOutletPieLength(index);
    const startAngle = -Math.PI / 2 + start * 2 * Math.PI;
    const endAngle = startAngle + len * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = len > 0.5 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }
}
