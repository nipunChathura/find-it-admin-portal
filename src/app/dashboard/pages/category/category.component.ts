import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { AdminCategoriesApiService, CategoryRow } from '../../../core/api/admin-categories.api';
import { DeleteCategoryConfirmDialogComponent } from './delete-category-confirm.dialog';
import { EditCategoryDialogComponent, EditCategoryDialogResult } from './edit-category.dialog';
import { AddCategoryDialogComponent, AddCategoryDialogResult } from './add-category.dialog';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

const CATEGORY_TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'ITEM', label: 'ITEM' },
  { value: 'SERVICE', label: 'SERVICE' },
];

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class CategoryComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly statusOptions = STATUS_OPTIONS;
  readonly categoryTypeOptions = CATEGORY_TYPE_OPTIONS;
  readonly displayedColumns: string[] = ['actions', 'id', 'name', 'categoryType', 'status', 'createdDate'];

  statusFilter = 'all';
  categoryTypeFilter = 'all';
  searchText = '';
  dataSource = new MatTableDataSource<CategoryRow>([]);
  private allData: CategoryRow[] = [];

  constructor(
    private readonly dialog: MatDialog,
    private readonly categoriesApi: AdminCategoriesApiService,
    private readonly snackbar: SnackbarService,
  ) {
    this.loadCategories();
  }


  onAddCategory(): void {
    const dialogRef = this.dialog.open(AddCategoryDialogComponent, {
      width: '400px',
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe((result: AddCategoryDialogResult | undefined) => {
      if (!result) return;
      this.categoriesApi.createCategory({ name: result.name, categoryType: result.categoryType, status: result.status }).subscribe({
        next: () => {
          this.snackbar.showSuccess('Category added successfully.');
          this.loadCategories();
        },
        error: () => this.snackbar.showError('Failed to add category.'),
      });
    });
  }

  onEdit(row: CategoryRow): void {
    const dialogRef = this.dialog.open(EditCategoryDialogComponent, {
      width: '420px',
      data: { id: row.id, name: row.name, categoryType: row.categoryType, status: row.status, createdDate: row.createdDate },
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe((result: EditCategoryDialogResult | undefined) => {
      if (!result) return;
      this.categoriesApi.updateCategory(result.id, { name: result.name, categoryType: result.categoryType, status: result.status }).subscribe({
        next: () => {
          this.snackbar.showSuccess('Category updated successfully.');
          this.loadCategories();
        },
        error: () => this.snackbar.showError('Failed to update category.'),
      });
    });
  }

  onDelete(row: CategoryRow): void {
    const dialogRef = this.dialog.open(DeleteCategoryConfirmDialogComponent, {
      width: '360px',
      data: { categoryName: row.name },
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.categoriesApi.deleteCategory(row.id).subscribe({
        next: () => {
          this.snackbar.showSuccess('Category deleted successfully.');
          this.loadCategories();
        },
        error: () => this.snackbar.showError('Failed to delete category.'),
      });
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'active',
      INACTIVE: 'inactive',
      PENDING: 'pending',
    };
    return map[status] ?? 'default';
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (row, prop) => {
      if (prop === 'createdDate') return new Date(row.createdDate).getTime();
      switch (prop) {
        case 'id': return row.id;
        case 'name': return (row.name ?? '').toLowerCase();
        case 'categoryType': return row.categoryType;
        case 'status': return row.status;
        default: return '';
      }
    };
  }

  onSearch(): void {
    this.loadCategories();
  }

  onClear(): void {
    this.statusFilter = 'all';
    this.categoryTypeFilter = 'all';
    this.searchText = '';
    this.loadCategories();
  }

  private loadCategories(): void {
    const status =
      this.statusFilter === 'all' || this.statusFilter === ''
        ? ''
        : this.statusFilter;
    const categoryType =
      this.categoryTypeFilter === 'all' || this.categoryTypeFilter === ''
        ? ''
        : this.categoryTypeFilter;
    const search = this.searchText?.trim() ?? '';
    this.categoriesApi.getCategories({ status, categoryType, search }).subscribe({
      next: (rows) => {
        this.allData = rows;
        this.dataSource.data = [...this.allData];
        this.dataSource.paginator?.firstPage();
      },
      error: () => {
        this.allData = [];
        this.dataSource.data = [];
      },
    });
  }
}
