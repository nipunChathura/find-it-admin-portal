import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const CATEGORIES_URL = 'http://localhost:9090/find-it/api/categories';

export type CategoryType = 'ITEM' | 'SERVICE';

export interface CategoryRow {
  id: number;
  name: string;
  categoryType: CategoryType;
  status: string;
  createdDate: string;
}

/** Raw category item from GET categories API. */
export interface CategoryApiItem {
  categoryId?: number;
  categoryName?: string;
  categoryStatus?: string;
  categoryType?: string;
  createdDatetime?: string;
  responseCode?: string;
  status?: string;
  createdDate?: string;
  created_date?: string;
  [key: string]: unknown;
}

function mapApiItemToRow(item: CategoryApiItem): CategoryRow {
  const id = item.categoryId ?? 0;
  const created =
    item.createdDatetime ?? item.createdDate ?? item.created_date ?? '';
  const categoryType = (item.categoryType ?? 'ITEM') as CategoryType;
  const createdStr = created ? String(created).slice(0, 10) : '';
  return {
    id: Number(id),
    name: String(item.categoryName ?? ''),
    categoryType: categoryType === 'SERVICE' ? 'SERVICE' : 'ITEM',
    status: String(item.categoryStatus ?? item.status ?? 'ACTIVE'),
    createdDate: createdStr,
  };
}

@Injectable({ providedIn: 'root' })
export class AdminCategoriesApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  /**
   * GET all categories with optional filters.
   * Query params: name (search), categoryType, status.
   * Uses Bearer token from AuthService.
   */
  getCategories(params: {
    status?: string;
    categoryType?: string;
    search?: string;
  }): Observable<CategoryRow[]> {
    const token = this.auth.token();
    if (!token) {
      return of([]);
    }

    let httpParams = new HttpParams();
    const name = params.search?.trim() ?? '';
    const categoryType =
      params.categoryType === 'all' || !params.categoryType ? '' : params.categoryType;
    const status = params.status === 'all' || !params.status ? '' : params.status;

    if (name) httpParams = httpParams.set('name', name);
    if (categoryType) httpParams = httpParams.set('categoryType', categoryType);
    if (status) httpParams = httpParams.set('status', status);

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    return this.http
      .get<CategoryApiItem[] | { content?: CategoryApiItem[]; data?: CategoryApiItem[] }>(
        CATEGORIES_URL,
        { params: httpParams, headers }
      )
      .pipe(
        map((body) => {
          const list = Array.isArray(body)
            ? body
            : (body?.content ?? body?.data ?? []);
          return (list as CategoryApiItem[]).map(mapApiItemToRow);
        }),
      );
  }

  /**
   * POST create category. Replace with real endpoint when backend provides it.
   */
  createCategory(body: {
    name: string;
    categoryType: CategoryType;
    status: string;
  }): Observable<CategoryRow> {
    const token = this.auth.token();
    if (!token) {
      return of({} as CategoryRow);
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return this.http
      .post<CategoryApiItem>(CATEGORIES_URL, body, { headers })
      .pipe(map(mapApiItemToRow));
  }

  /**
   * PUT update category by id. Replace with real endpoint when backend provides it.
   */
  updateCategory(
    id: number,
    body: { name: string; categoryType: CategoryType; status: string }
  ): Observable<CategoryRow> {
    const token = this.auth.token();
    if (!token) {
      return of({} as CategoryRow);
    }
    const url = `${CATEGORIES_URL}/${id}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return this.http
      .put<CategoryApiItem>(url, body, { headers })
      .pipe(map(mapApiItemToRow));
  }

  /**
   * DELETE category by id. Replace with real endpoint when backend provides it.
   */
  deleteCategory(id: number): Observable<void> {
    const token = this.auth.token();
    if (!token) {
      return of(undefined);
    }
    const url = `${CATEGORIES_URL}/${id}`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.delete<void>(url, { headers });
  }
}
