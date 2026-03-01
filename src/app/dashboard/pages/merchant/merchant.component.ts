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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminMerchantsApiService, MerchantRow } from '../../../core/api/admin-merchants.api';
import { DeleteMerchantConfirmDialogComponent } from './delete-merchant-confirm.dialog';
import { EditMerchantDialogComponent, EditMerchantDialogResult } from './edit-merchant.dialog';
import { AddMerchantDialogComponent, AddMerchantDialogResult } from './add-merchant.dialog';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

const MERCHANT_TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'FREE', label: 'FREE' },
  { value: 'SILVER', label: 'SILVER' },
  { value: 'GOLD', label: 'GOLD' },
  { value: 'PLATINUM', label: 'PLATINUM' },
  { value: 'DIAMOND', label: 'DIAMOND' },
];

@Component({
  selector: 'app-merchant',
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
    MatSnackBarModule,
  ],
  templateUrl: './merchant.component.html',
  styleUrl: './merchant.component.scss',
})
export class MerchantComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly statusOptions = STATUS_OPTIONS;
  readonly merchantTypeOptions = MERCHANT_TYPE_OPTIONS;
  readonly displayedColumns: string[] = [
    'actions',
    'merchantId',
    'merchantName',
    'merchantEmail',
    'merchantPhoneNumber',
    'merchantType',
    'mainOrSub',
    'merchantStatus',
    'parentMerchantName',
  ];

  statusFilter = 'all';
  merchantTypeFilter = 'all';
  searchText = '';
  dataSource = new MatTableDataSource<MerchantRow>([]);
  private allData: MerchantRow[] = [];

  constructor(
    private readonly dialog: MatDialog,
    private readonly merchantsApi: AdminMerchantsApiService,
    private readonly snackBar: MatSnackBar,
  ) {
    this.loadMerchants();
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['snackbar-success'],
      verticalPosition: 'top',
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['snackbar-error'],
      verticalPosition: 'top',
    });
  }

  onAddMerchant(): void {
    const dialogRef = this.dialog.open(AddMerchantDialogComponent, {
      width: '420px',
      maxHeight: '90vh',
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe((result: AddMerchantDialogResult | undefined) => {
      if (!result) return;
      this.merchantsApi.createMerchant(result).subscribe({
        next: () => {
          this.showSuccess('Merchant added successfully.');
          this.loadMerchants();
        },
        error: () => this.showError('Failed to add merchant.'),
      });
    });
  }

  onEdit(row: MerchantRow): void {
    const dialogRef = this.dialog.open(EditMerchantDialogComponent, {
      width: '420px',
      maxHeight: '90vh',
      data: { ...row },
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe((result: EditMerchantDialogResult | undefined) => {
      if (!result || result.merchantId == null) return;
      const { merchantId, ...body } = result;
      this.merchantsApi.updateMerchant(merchantId, body).subscribe({
        next: () => {
          this.showSuccess('Merchant updated successfully.');
          this.loadMerchants();
        },
        error: () => this.showError('Failed to update merchant.'),
      });
    });
  }

  onDelete(row: MerchantRow): void {
    const dialogRef = this.dialog.open(DeleteMerchantConfirmDialogComponent, {
      width: '360px',
      data: { merchantName: row.merchantName },
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.merchantsApi.deleteMerchant(row.merchantId).subscribe({
        next: () => {
          this.showSuccess('Merchant deleted successfully.');
          this.loadMerchants();
        },
        error: () => this.showError('Failed to delete merchant.'),
      });
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'active',
      INACTIVE: 'inactive',
    };
    return map[status] ?? 'default';
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (row, prop) => {
      switch (prop) {
        case 'merchantId':
          return row.merchantId;
        case 'merchantName':
          return (row.merchantName ?? '').toLowerCase();
        case 'merchantEmail':
          return (row.merchantEmail ?? '').toLowerCase();
        case 'merchantPhoneNumber':
          return row.merchantPhoneNumber ?? '';
        case 'merchantType':
          return row.merchantType ?? '';
        case 'mainOrSub':
          return (row.parentMerchantName ?? '').trim() ? 'SUB' : 'MAIN';
        case 'merchantStatus':
          return row.merchantStatus ?? '';
        case 'parentMerchantName':
          return (row.parentMerchantName ?? '').toLowerCase();
        default:
          return '';
      }
    };
  }

  onSearch(): void {
    this.loadMerchants();
  }

  onClear(): void {
    this.statusFilter = 'all';
    this.merchantTypeFilter = 'all';
    this.searchText = '';
    this.loadMerchants();
  }

  private loadMerchants(): void {
    const status =
      this.statusFilter === 'all' || this.statusFilter === '' ? '' : this.statusFilter;
    const merchantType =
      this.merchantTypeFilter === 'all' || this.merchantTypeFilter === ''
        ? ''
        : this.merchantTypeFilter;
    const search = this.searchText?.trim() ?? '';
    this.merchantsApi.getMerchants({ status, merchantType, search }).subscribe({
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
