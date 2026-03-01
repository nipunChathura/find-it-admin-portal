import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

/** Optional query params for GET /outlets/:outletId/schedules */
export interface GetSchedulesParams {
  date?: string; // ISO date YYYY-MM-DD
  dayOfWeek?: string; // e.g. MONDAY
}

const BASE_URL = 'http://localhost:9090/find-it/api';

/** Request body for POST /outlets/:outletId/schedules and PUT /outlets/:outletId/schedules/:id */
export interface CreateSchedulePayload {
  scheduleType: string;
  dayOfWeek: string | null;
  specialDate: string | null; // ISO date YYYY-MM-DD for EMERGENCY/DAILY
  startDate: string | null;
  endDate: string | null;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  reason: string | null;
  /** Optional; used on update. */
  priority?: number;
  /** Optional; used on update. */
  active?: boolean;
}

/** Schedule item as returned by GET /outlets/:outletId/schedules (or similar). */
export interface ScheduleApiItem {
  id?: number;
  outletId?: number;
  scheduleType?: string;
  dayOfWeek?: string | null;
  specialDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  openTime?: string;
  closeTime?: string;
  isClosed?: boolean;
  reason?: string | null;
  priority?: number;
  active?: boolean;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class OutletSchedulesApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  getSchedules(outletId: number, params?: GetSchedulesParams): Observable<ScheduleApiItem[]> {
    const token = this.auth.token();
    if (!token || !outletId) return of([]);
    const url = `${BASE_URL}/outlets/${outletId}/schedules`;
    const headers = { Authorization: `Bearer ${token}` };
    let httpParams = new HttpParams();
    if (params?.date?.trim()) httpParams = httpParams.set('date', params.date.trim());
    if (params?.dayOfWeek?.trim()) httpParams = httpParams.set('dayOfWeek', params.dayOfWeek.trim());
    const options = { headers, params: httpParams };
    const scheduleTypeKeys = ['NORMAL', 'EMERGENCY', 'TEMPORARY', 'DAILY'] as const;
    return this.http
      .get<ScheduleApiItem[] | Record<string, ScheduleApiItem[] | undefined>>(url, options)
      .pipe(
        map((res) => {
          if (Array.isArray(res)) return res;
          const body = res as Record<string, ScheduleApiItem[] | undefined>;
          // Response shape: { NORMAL: [], EMERGENCY: [...], TEMPORARY: [], DAILY: [] }
          if (scheduleTypeKeys.some((k) => k in body)) {
            return scheduleTypeKeys.flatMap((scheduleType) => {
              const list = body[scheduleType] ?? [];
              return (list as ScheduleApiItem[]).map((item) => ({
                ...item,
                scheduleType,
              }));
            });
          }
          return (
            body['schedules'] ??
            body['data'] ??
            body['content'] ??
            body['items'] ??
            []
          );
        }),
      );
  }

  createSchedule(outletId: number, body: CreateSchedulePayload): Observable<ScheduleApiItem | unknown> {
    const token = this.auth.token();
    if (!token || !outletId) return of({});
    const url = `${BASE_URL}/outlets/${outletId}/schedules`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return this.http.post<ScheduleApiItem | unknown>(url, body, { headers });
  }

  /**
   * PUT /outlets/:outletId/schedules/:scheduleId
   * Same body shape as create (scheduleType, dayOfWeek, specialDate, startDate, endDate, openTime, closeTime, isClosed, reason).
   */
  updateSchedule(
    outletId: number,
    scheduleId: number,
    body: CreateSchedulePayload,
  ): Observable<ScheduleApiItem | unknown> {
    const token = this.auth.token();
    if (!token || !outletId || !scheduleId) return of({});
    const url = `${BASE_URL}/outlets/${outletId}/schedules/${scheduleId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return this.http.put<ScheduleApiItem | unknown>(url, body, { headers });
  }

  /**
   * DELETE /outlets/:outletId/schedules/:scheduleId
   */
  deleteSchedule(outletId: number, scheduleId: number): Observable<void> {
    const token = this.auth.token();
    if (!token || !outletId || !scheduleId) return of(undefined);
    const url = `${BASE_URL}/outlets/${outletId}/schedules/${scheduleId}`;
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.delete<void>(url, { headers });
  }
}
