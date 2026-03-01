import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const BASE_URL = 'http://localhost:9090/find-it/api';
const SEARCH_LIMIT = 5;

export interface ProvinceItem {
  provinceId?: number;
  id?: number;
  provinceName?: string;
  name?: string;
  description?: string;
  [key: string]: unknown;
}

export interface DistrictItem {
  districtId?: number;
  id?: number;
  districtName?: string;
  name?: string;
  provinceId?: number;
  [key: string]: unknown;
}

export interface CityItem {
  cityId?: number;
  id?: number;
  cityName?: string;
  name?: string;
  districtId?: number;
  [key: string]: unknown;
}

function toId(item: ProvinceItem | DistrictItem | CityItem, idKey: string, nameKey: string): number {
  return Number((item as Record<string, unknown>)[idKey] ?? (item as Record<string, unknown>)['id'] ?? 0);
}

function toName(item: ProvinceItem | DistrictItem | CityItem, nameKey: string): string {
  return String((item as Record<string, unknown>)[nameKey] ?? (item as Record<string, unknown>)['name'] ?? '');
}

@Injectable({ providedIn: 'root' })
export class LocationsApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  getProvinces(params: { name?: string; description?: string }): Observable<{ id: number; name: string }[]> {
    const token = this.auth.token();
    if (!token) return of([]);
    const httpParams = new HttpParams()
      .set('name', params.name?.trim() ?? '')
      .set('description', params.description?.trim() ?? '');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http
      .get<ProvinceItem[] | { provinces?: ProvinceItem[]; data?: ProvinceItem[] }>(
        `${BASE_URL}/provinces`,
        { params: httpParams, headers }
      )
      .pipe(
        map((body) => {
          const list = Array.isArray(body)
            ? body
            : (body as { provinces?: ProvinceItem[] }).provinces ??
              (body as { data?: ProvinceItem[] }).data ??
              [];
          return (list as ProvinceItem[])
            .slice(0, SEARCH_LIMIT)
            .map((p) => ({ id: toId(p, 'provinceId', 'provinceName'), name: toName(p, 'provinceName') }));
        }),
      );
  }

  getDistricts(provinceId: number, params: { name?: string }): Observable<{ id: number; name: string }[]> {
    const token = this.auth.token();
    if (!token || !provinceId) return of([]);
    const httpParams = new HttpParams().set('name', params.name?.trim() ?? '');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http
      .get<DistrictItem[] | { districts?: DistrictItem[]; data?: DistrictItem[] }>(
        `${BASE_URL}/provinces/${provinceId}/districts`,
        { params: httpParams, headers }
      )
      .pipe(
        map((body) => {
          const list = Array.isArray(body)
            ? body
            : (body as { districts?: DistrictItem[] }).districts ??
              (body as { data?: DistrictItem[] }).data ??
              [];
          return (list as DistrictItem[])
            .slice(0, SEARCH_LIMIT)
            .map((d) => ({ id: toId(d, 'districtId', 'districtName'), name: toName(d, 'districtName') }));
        }),
      );
  }

  getCities(districtId: number, params: { name?: string }): Observable<{ id: number; name: string }[]> {
    const token = this.auth.token();
    if (!token || !districtId) return of([]);
    const httpParams = new HttpParams().set('name', params.name?.trim() ?? '');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http
      .get<CityItem[] | { cities?: CityItem[]; data?: CityItem[] }>(
        `${BASE_URL}/districts/${districtId}/cities`,
        { params: httpParams, headers }
      )
      .pipe(
        map((body) => {
          const list = Array.isArray(body)
            ? body
            : (body as { cities?: CityItem[] }).cities ??
              (body as { data?: CityItem[] }).data ??
              [];
          return (list as CityItem[])
            .slice(0, SEARCH_LIMIT)
            .map((c) => ({ id: toId(c, 'cityId', 'cityName'), name: toName(c, 'cityName') }));
        }),
      );
  }
}
