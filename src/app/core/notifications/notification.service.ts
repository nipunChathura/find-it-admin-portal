import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subscription, interval, switchMap, catchError, map, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Notification, NotificationApiItem } from './notification.model';

const NOTIFICATIONS_URL = 'http://localhost:9090/find-it/api/notifications';
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function mapApiItemToNotification(item: NotificationApiItem): Notification {
  const id = String(item.id ?? '');
  const createdAt = item.createdAt ?? item.created_at ?? '';
  const date = createdAt ? new Date(createdAt) : new Date();
  const type = (item.type ?? 'info') as Notification['type'];
  const isRead = item.isRead ?? item.is_read ?? false;
  return {
    id,
    title: String(item.title ?? ''),
    message: String(item.message ?? ''),
    type: type === 'info' || type === 'success' || type === 'warning' || type === 'error' ? type : 'info',
    isRead: Boolean(isRead),
    createdAt: date,
  };
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly notifications$ = new BehaviorSubject<Notification[]>([]);
  private pollSubscription: Subscription | null = null;

  /** Observable stream for UI – always current list. */
  readonly notifications = this.notifications$.asObservable();

  /** Unread count derived from current list. */
  get unreadCount(): number {
    return this.notifications$.value.filter((n) => !n.isRead).length;
  }

  /** Current list snapshot. */
  get list(): Notification[] {
    return this.notifications$.value;
  }

  constructor() {
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  /** Fetch unread only: GET .../notifications/unread/{userId} (for dropdown/badge). */
  fetchNotifications(): Observable<Notification[]> {
    const token = this.auth.token();
    const userId = this.auth.user()?.userId;
    if (!token || userId == null) {
      return of([]);
    }
    const url = `${NOTIFICATIONS_URL}/unread/${userId}`;
    const headers = { Authorization: `Bearer ${token}` };
    return this.http
      .get<NotificationApiItem[] | { content?: NotificationApiItem[]; data?: NotificationApiItem[] }>(
        url,
        { headers }
      )
      .pipe(
        map((body) => {
          const raw = Array.isArray(body) ? body : (body?.content ?? body?.data ?? []);
          return (raw as NotificationApiItem[]).map(mapApiItemToNotification);
        }),
        catchError(() => of([]))
      );
  }

  /** Fetch all notifications: GET .../notifications/user/{userId}. */
  fetchAllNotifications(): Observable<Notification[]> {
    const token = this.auth.token();
    const userId = this.auth.user()?.userId;
    if (!token || userId == null) {
      return of([]);
    }
    const url = `${NOTIFICATIONS_URL}/user/${userId}`;
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return this.http
      .get<NotificationApiItem[] | { content?: NotificationApiItem[]; data?: NotificationApiItem[] }>(
        url,
        { headers }
      )
      .pipe(
        map((body) => {
          const raw = Array.isArray(body) ? body : (body?.content ?? body?.data ?? []);
          return (raw as NotificationApiItem[]).map(mapApiItemToNotification);
        }),
        catchError(() => of([]))
      );
  }

  /** Load and push latest notifications (used by polling and manual refresh). */
  load(): void {
    this.fetchNotifications().subscribe((list) => this.notifications$.next(list));
  }

  /** Mark a single notification as read. POST .../notifications/read/{id} */
  markAsRead(id: string): Observable<unknown> {
    const token = this.auth.token();
    if (!token) return of(null);
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    return this.http.post(`${NOTIFICATIONS_URL}/read/${id}`, {}, { headers }).pipe(
      tap(() => this.updateOne(id, (n) => ({ ...n, isRead: true }))),
      catchError(() => of(null))
    );
  }

  /** Mark all notifications as read. */
  markAllAsRead(): Observable<unknown> {
    const token = this.auth.token();
    if (!token) return of(null);
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    return this.http.post(`${NOTIFICATIONS_URL}/read-all`, {}, { headers }).pipe(
      tap(() => {
        const list = this.notifications$.value.map((n) => ({ ...n, isRead: true }));
        this.notifications$.next(list);
      }),
      catchError(() => of(null))
    );
  }

  /** Poll every 10 seconds for real-time updates. */
  startPolling(): void {
    this.stopPolling();
    this.load();
    this.pollSubscription = interval(POLL_INTERVAL_MS)
      .pipe(switchMap(() => this.fetchNotifications()))
      .subscribe((list) => this.notifications$.next(list));
  }

  stopPolling(): void {
    this.pollSubscription?.unsubscribe();
    this.pollSubscription = null;
  }

  private updateOne(id: string, fn: (n: Notification) => Notification): void {
    const list = this.notifications$.value.map((n) => (n.id === id ? fn(n) : n));
    this.notifications$.next(list);
  }
}
