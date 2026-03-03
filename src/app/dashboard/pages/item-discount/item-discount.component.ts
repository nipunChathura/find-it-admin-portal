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
import { AdminDiscountsApiService, CreateDiscountBody, DiscountRow, UpdateDiscountBody } from '../../../core/api/admin-discounts.api';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { AdminItemsApiService } from '../../../core/api/admin-items.api';
import { DiscountDetailDialogComponent } from './discount-detail.dialog';
import { AddDiscountDialogComponent } from './add-discount.dialog';
import { EditDiscountDialogComponent } from './edit-discount.dialog';
import { DeleteDiscountConfirmDialogComponent } from './delete-discount-confirm.dialog';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

@Component({
  selector: 'app-item-discount',
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
  templateUrl: './item-discount.component.html',
  styleUrl: './item-discount.component.scss',
})
export class ItemDiscountComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly statusOptions = STATUS_OPTIONS;
  readonly displayedColumns: string[] = [
    'actions',
    'discountId',
    'discountImage',
    'discountName',
    'discountType',
    'discountValue',
    'discountStatus',
    'startDate',
    'endDate',
  ];

  /** Selected row (for highlight and popup). */
  selectedRow: DiscountRow | null = null;

  dataSource = new MatTableDataSource<DiscountRow>([]);

  statusFilter = 'all';
  /** Item filter: '' = all, number = item id. Search dropdown for item name. */
  itemIdFilter: number | '' = '';
  itemSearchText = '';
  itemOptions: { id: number; name: string }[] = [];
  private itemSearchTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly adminDiscountsApi: AdminDiscountsApiService,
    private readonly adminItemsApi: AdminItemsApiService,
    private readonly dialog: MatDialog,
    private readonly snackbar: SnackbarService,
  ) {
    this.loadDiscounts();
    this.loadDefaultItemOptions();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadDefaultItemOptions(): void {
    this.adminItemsApi.getItems({}).subscribe({
      next: (rows) => {
        this.itemOptions = rows.slice(0, 5).map((r) => ({ id: r.id, name: r.name }));
      },
      error: () => {
        this.itemOptions = [];
      },
    });
  }

  onItemSearchInput(): void {
    if (this.itemSearchTimeout != null) clearTimeout(this.itemSearchTimeout);
    this.itemSearchTimeout = setTimeout(() => {
      const search = this.itemSearchText?.trim() ?? '';
      if (search.length === 0) {
        this.adminItemsApi.getItems({}).subscribe({
          next: (rows) => {
            this.itemOptions = rows.slice(0, 5).map((r) => ({ id: r.id, name: r.name }));
          },
          error: () => {
            this.itemOptions = [];
          },
        });
        return;
      }
      this.adminItemsApi.getItems({ search }).subscribe({
        next: (rows) => {
          this.itemOptions = rows.slice(0, 5).map((r) => ({ id: r.id, name: r.name }));
        },
        error: () => {
          this.itemOptions = [];
        },
      });
    }, 300);
  }

  onItemOptionSelected(item: { id: number; name: string }): void {
    this.itemIdFilter = item.id;
    this.itemSearchText = item.name;
  }

  clearItemFilter(): void {
    this.itemIdFilter = '';
    this.itemSearchText = '';
    this.loadDefaultItemOptions();
    this.loadDiscounts();
  }

  loadDiscounts(): void {
    const status = this.statusFilter === 'all' ? '' : this.statusFilter;
    const itemId = this.itemIdFilter === '' ? '' : this.itemIdFilter;
    this.adminDiscountsApi.getDiscounts({ status, itemId }).subscribe({
      next: (rows) => {
        this.dataSource.data = rows;
      },
      error: () => {
        this.dataSource.data = [];
      },
    });
  }

  isSelected(row: DiscountRow): boolean {
    return this.selectedRow?.discountId === row.discountId;
  }

  onRowClick(row: DiscountRow): void {
    this.selectedRow = row;
    this.openDetailDialog(row);
  }

  openDetailDialog(row: DiscountRow): void {
    this.selectedRow = row;
    this.dialog.open(DiscountDetailDialogComponent, {
      width: '440px',
      data: { discount: row },
    });
  }

  onAddDiscount(): void {
    this.dialog
      .open(AddDiscountDialogComponent, { width: '420px' })
      .afterClosed()
      .subscribe((result: CreateDiscountBody | undefined) => {
        if (result == null) return;
        this.adminDiscountsApi.createDiscount(result).subscribe({
          next: () => {
            this.snackbar.showSuccess('Discount added successfully.');
            this.loadDiscounts();
          },
          error: () => {
            this.snackbar.showError('Failed to add discount.');
          },
        });
      });
  }

  onEdit(row: DiscountRow): void {
    this.selectedRow = row;
    this.dialog
      .open(EditDiscountDialogComponent, {
        width: '420px',
        data: { discount: row },
      })
      .afterClosed()
      .subscribe((result: UpdateDiscountBody | undefined) => {
        if (result == null) return;
        this.adminDiscountsApi.updateDiscount(row.discountId, result).subscribe({
          next: () => {
            this.snackbar.showSuccess('Discount updated successfully.');
            this.loadDiscounts();
          },
          error: () => {
            this.snackbar.showError('Failed to update discount.');
          },
        });
      });
  }

  onDelete(row: DiscountRow): void {
    this.selectedRow = row;
    this.dialog
      .open(DeleteDiscountConfirmDialogComponent, {
        width: '360px',
        data: { discountName: row.discountName },
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (!confirmed) return;
        this.adminDiscountsApi.deleteDiscount(row.discountId).subscribe({
          next: () => {
            this.snackbar.showSuccess('Discount deleted successfully.');
            this.loadDiscounts();
          },
          error: () => {
            this.snackbar.showError('Failed to delete discount.');
          },
        });
      });
  }

  onSearch(): void {
    this.loadDiscounts();
  }

  onClear(): void {
    this.statusFilter = 'all';
    this.itemIdFilter = '';
    this.itemSearchText = '';
    this.loadDefaultItemOptions();
    this.loadDiscounts();
  }

  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'active';
    if (s === 'inactive') return 'inactive';
    return 'default';
  }
}
