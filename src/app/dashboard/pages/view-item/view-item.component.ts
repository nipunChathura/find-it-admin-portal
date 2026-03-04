import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { AdminItemsApiService, ViewItemRow } from '../../../core/api/admin-items.api';
import { AdminCategoriesApiService } from '../../../core/api/admin-categories.api';
import { AdminOutletsApiService } from '../../../core/api/admin-outlets.api';
import { DeleteItemConfirmDialogComponent, DeleteItemConfirmData } from './delete-item-confirm.dialog';
import { EditItemDialogComponent, EditItemDialogResult } from './edit-item.dialog';
import { AddItemDialogComponent, AddItemDialogResult } from './add-item.dialog';
import { ItemDetailDialogComponent } from './item-detail.dialog';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'true', label: 'Available' },
  { value: 'false', label: 'Unavailable' },
];

@Component({
  selector: 'app-view-item',
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
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './view-item.component.html',
  styleUrl: './view-item.component.scss',
})
export class ViewItemComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly statusOptions = STATUS_OPTIONS;
  readonly availabilityOptions = AVAILABILITY_OPTIONS;
  readonly displayedColumns: string[] = [
    'actions',
    'id',
    'name',
    'categoryName',
    'outletName',
    'price',
    'status',
    'availability',
    'discountAvailability',
  ];

  statusFilter = 'all';
  availabilityFilter = 'all';
  searchText = '';
  /** Category filter: '' = all, number = category id. Search dropdown shows 5 results. */
  categoryIdFilter: number | '' = '';
  categorySearchText = '';
  /** Category dropdown options from get categories API (max 5). */
  categoryOptions: { id: number; name: string }[] = [];
  private categorySearchTimeout: ReturnType<typeof setTimeout> | null = null;
  /** Outlet filter: '' = all, number = outlet id. Search dropdown shows 5 results. */
  outletIdFilter: number | '' = '';
  outletSearchText = '';
  /** Outlet dropdown options from get outlets API (max 5). */
  outletOptions: { outletId: number; outletName: string }[] = [];
  private outletSearchTimeout: ReturnType<typeof setTimeout> | null = null;
  dataSource = new MatTableDataSource<ViewItemRow>([]);
  private allData: ViewItemRow[] = [];

  constructor(
    private readonly dialog: MatDialog,
    private readonly adminItemsApi: AdminItemsApiService,
    private readonly adminCategoriesApi: AdminCategoriesApiService,
    private readonly adminOutletsApi: AdminOutletsApiService,
    private readonly snackbar: SnackbarService,
  ) {
    this.loadDefaultCategoryOptions();
    this.loadDefaultOutletOptions();
    this.loadItems();
  }

  /** Load first 5 categories (no search) for default dropdown options. */
  private loadDefaultCategoryOptions(): void {
    this.adminCategoriesApi.getCategories({}).subscribe({
      next: (rows) => {
        this.categoryOptions = rows.slice(0, 5).map((r) => ({ id: r.id, name: r.name }));
      },
      error: () => {
        this.categoryOptions = [];
      },
    });
  }

  /** Load first 5 outlets (no search) for default dropdown options. */
  private loadDefaultOutletOptions(): void {
    this.adminOutletsApi
      .getOutlets({ search: '', status: '', outletType: '' })
      .subscribe({
        next: (items) => {
          this.outletOptions = items
            .slice(0, 5)
            .map((item) => ({
              outletId: item.row.outletId,
              outletName: item.row.outletName || `Outlet ${item.row.outletId}`,
            }));
        },
        error: () => {
          this.outletOptions = [];
        },
      });
  }

  /** Called when user types in category search; debounced, then calls get categories API and shows 5 results. */
  onCategorySearchInput(): void {
    if (this.categorySearchTimeout != null) {
      clearTimeout(this.categorySearchTimeout);
    }
    const q = this.categorySearchText?.trim() ?? '';
    if (!q) {
      this.loadDefaultCategoryOptions();
      return;
    }
    this.categorySearchTimeout = setTimeout(() => {
      this.categorySearchTimeout = null;
      this.adminCategoriesApi.getCategories({ search: q }).subscribe({
        next: (rows) => {
          this.categoryOptions = rows.slice(0, 5).map((r) => ({ id: r.id, name: r.name }));
        },
        error: () => {
          this.categoryOptions = [];
        },
      });
    }, 300);
  }

  onCategoryOptionSelected(opt: { id: number; name: string }): void {
    this.categoryIdFilter = opt.id;
    this.categorySearchText = opt.name;
  }

  clearCategoryFilter(): void {
    this.categoryIdFilter = '';
    this.categorySearchText = '';
    this.loadDefaultCategoryOptions();
  }

  /** Called when user types in outlet search; debounced, then calls get outlets API and shows 5 results. */
  onOutletSearchInput(): void {
    if (this.outletSearchTimeout != null) {
      clearTimeout(this.outletSearchTimeout);
    }
    const q = this.outletSearchText?.trim() ?? '';
    if (!q) {
      this.loadDefaultOutletOptions();
      return;
    }
    this.outletSearchTimeout = setTimeout(() => {
      this.outletSearchTimeout = null;
      this.adminOutletsApi
        .getOutlets({ search: q, status: '', outletType: '' })
        .subscribe({
          next: (items) => {
            this.outletOptions = items
              .slice(0, 5)
              .map((item) => ({
                outletId: item.row.outletId,
                outletName: item.row.outletName || `Outlet ${item.row.outletId}`,
              }));
          },
          error: () => {
            this.outletOptions = [];
          },
        });
    }, 300);
  }

  onOutletOptionSelected(opt: { outletId: number; outletName: string }): void {
    this.outletIdFilter = opt.outletId;
    this.outletSearchText = opt.outletName;
  }

  clearOutletFilter(): void {
    this.outletIdFilter = '';
    this.outletSearchText = '';
    this.loadDefaultOutletOptions();
  }


  onAddItem(): void {
    const dialogRef = this.dialog.open(AddItemDialogComponent, {
      width: '420px',
      data: {},
    });
    dialogRef.afterClosed().subscribe((result: AddItemDialogResult | undefined) => {
      if (result) {
        this.addItem(result);
      }
    });
  }

  private addItem(newItem: AddItemDialogResult): void {
    const body = {
      itemName: newItem.itemName,
      itemDescription: newItem.itemDescription,
      categoryId: newItem.categoryId,
      outletId: newItem.outletId,
      price: newItem.price,
      availability: newItem.availability,
      itemImage: newItem.itemImage,
      status: newItem.status,
    };
    this.adminItemsApi.createItem(body).subscribe({
      next: () => {
        this.snackbar.showSuccess('Item added successfully.');
        this.loadItems();
      },
      error: () => {
        this.snackbar.showError('Failed to add item.');
        this.loadItems();
      },
    });
  }

  onRowClick(row: ViewItemRow): void {
    this.dialog.open(ItemDetailDialogComponent, {
      width: '480px',
      data: { ...row },
    });
  }

  onEdit(row: ViewItemRow): void {
    const dialogRef = this.dialog.open(EditItemDialogComponent, {
      width: '480px',
      data: {
        id: row.id,
        name: row.name,
        description: row.description,
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        outletId: row.outletId,
        outletName: row.outletName,
        price: row.price,
        availability: row.availability,
        itemImage: row.itemImage,
        status: row.status,
        createdDate: '',
      },
    });
    dialogRef.afterClosed().subscribe((result: EditItemDialogResult | undefined) => {
      if (result) {
        this.updateItem(result);
      }
    });
  }

  private updateItem(result: EditItemDialogResult): void {
    const body = {
      itemName: result.itemName,
      itemDescription: result.itemDescription,
      categoryId: result.categoryId,
      outletId: result.outletId,
      price: result.price,
      availability: result.availability,
      itemImage: result.itemImage,
      status: result.status,
    };
    this.adminItemsApi.updateItem(result.id, body).subscribe({
      next: () => {
        this.snackbar.showSuccess('Item updated successfully.');
        this.loadItems();
      },
      error: () => {
        this.snackbar.showError('Failed to update item.');
        this.loadItems();
      },
    });
  }

  onDelete(row: ViewItemRow): void {
    const data: DeleteItemConfirmData = { itemName: row.name };
    const dialogRef = this.dialog.open(DeleteItemConfirmDialogComponent, {
      width: '400px',
      data,
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteItem(row);
      }
    });
  }

  private deleteItem(row: ViewItemRow): void {
    this.adminItemsApi.deleteItem(row.id).subscribe({
      next: () => {
        this.snackbar.showSuccess('Item deleted successfully.');
        this.loadItems();
      },
      error: () => {
        this.snackbar.showError('Failed to delete item.');
        this.loadItems();
      },
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
      switch (prop) {
        case 'id': return row.id;
        case 'name': return row.name.toLowerCase();
        case 'categoryName': return row.categoryName.toLowerCase();
        case 'outletName': return row.outletName.toLowerCase();
        case 'price': return row.price;
        case 'status': return row.status;
        case 'availability': return row.availability ? 1 : 0;
        case 'discountAvailability': return (row.discountAvailability ?? row.discountAvailable) ? 1 : 0;
        default: return '';
      }
    };
  }

  onSearch(): void {
    this.loadItems();
  }

  onClear(): void {
    this.statusFilter = 'all';
    this.availabilityFilter = 'all';
    this.searchText = '';
    this.clearCategoryFilter();
    this.clearOutletFilter();
    this.loadItems();
  }

  private loadItems(): void {
    const status =
      this.statusFilter === 'all' || this.statusFilter === '' ? '' : this.statusFilter;
    const availability =
      this.availabilityFilter === 'all' || this.availabilityFilter === '' ? '' : this.availabilityFilter;
    const search = this.searchText?.trim() ?? '';
    const categoryId =
      this.categoryIdFilter === '' || this.categoryIdFilter == null
        ? undefined
        : this.categoryIdFilter;
    const outletId =
      this.outletIdFilter === '' || this.outletIdFilter == null
        ? undefined
        : String(this.outletIdFilter);
    this.adminItemsApi.getItems({ search, categoryId, outletId, status, availability }).subscribe({
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
