import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject, Observable, of } from 'rxjs';
import { debounceTime, switchMap, map, takeUntil } from 'rxjs/operators';
import { AdminCategoriesApiService } from '../../../core/api/admin-categories.api';
import { CategoryRow } from '../../../core/api/admin-categories.api';

export interface EditItemDialogData {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  outletId: number;
  outletName: string;
  price: number;
  availability: boolean;
  itemImage: string | null;
  status: string;
  createdDate?: string;
}

export interface EditItemDialogResult {
  id: number;
  itemName: string;
  itemDescription: string;
  categoryId: number;
  outletId: number;
  price: number;
  availability: boolean;
  itemImage: string | null;
  status: string;
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'PENDING', label: 'PENDING' },
];

const CATEGORY_SEARCH_LIMIT = 10;

@Component({
  selector: 'app-edit-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  templateUrl: './edit-item.dialog.html',
  styles: [
    'mat-dialog-content { min-width: 320px; margin-bottom: 0.5rem; }',
    '.edit-item-dialog__readonly { margin: 0 0 1rem 0; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }',
    '.edit-item-dialog__field { width: 100%; display: block; margin-bottom: 0.5rem; }',
    '.edit-item-dialog__checkbox { margin-bottom: 0.5rem; }',
    'mat-dialog-actions { padding-top: 0.5rem; gap: 0.5rem; }',
    'mat-dialog-actions button { border: 1px solid var(--mat-sys-outline-variant); }',
    '.dialog-cancel-btn { color: #c62828; }',
  ],
})
export class EditItemDialogComponent implements OnInit, OnDestroy {
  readonly data: EditItemDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditItemDialogComponent>);
  private readonly categoriesApi = inject(AdminCategoriesApiService);
  private readonly categorySearchTerm$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  readonly statusOptions = STATUS_OPTIONS;
  categorySearchResults$!: Observable<CategoryRow[]>;

  name: string;
  description: string;
  categoryId: number;
  categorySearchText: string;
  price: number;
  availability: boolean;
  itemImage: string;
  status: string;

  constructor() {
    this.name = this.data.name;
    this.description = this.data.description;
    this.categoryId = this.data.categoryId;
    this.categorySearchText = this.data.categoryName ?? '';
    this.price = this.data.price;
    this.availability = this.data.availability;
    this.itemImage = this.data.itemImage ?? '';
    this.status = this.data.status;
  }

  ngOnInit(): void {
    this.categorySearchResults$ = this.categorySearchTerm$.pipe(
      debounceTime(250),
      switchMap((q) => {
        const term = (q ?? '').trim();
        if (!term) return of([]);
        return this.categoriesApi.getCategories({ search: term }).pipe(
          map((list) => list.slice(0, CATEGORY_SEARCH_LIMIT)),
        );
      }),
      takeUntil(this.destroy$),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCategorySearchChange(value: string): void {
    this.categorySearchTerm$.next(value ?? '');
  }

  onCategorySelected(cat: CategoryRow): void {
    this.categoryId = cat.id;
    this.categorySearchText = cat.name ?? '';
  }

  onUpdate(): void {
    const img = (this.itemImage ?? '').trim();
    this.dialogRef.close({
      id: this.data.id,
      itemName: this.name.trim(),
      itemDescription: this.description.trim(),
      categoryId: this.categoryId,
      outletId: this.data.outletId,
      price: Number(this.price),
      availability: this.availability,
      itemImage: img || null,
      status: this.status,
    } as EditItemDialogResult);
  }
}
