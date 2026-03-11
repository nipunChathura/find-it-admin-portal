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
import { AdminMerchantsApiService, MerchantRow } from '../../../core/api/admin-merchants.api';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { DeleteMerchantConfirmDialogComponent } from './delete-merchant-confirm.dialog';
import { RejectReasonDialogComponent } from './reject-reason.dialog';
import { EditMerchantDialogComponent, EditMerchantDialogResult } from './edit-merchant.dialog';
import { AddMerchantDialogComponent, AddMerchantDialogResult } from './add-merchant.dialog';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'PENDING' },
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'REJECTED', label: 'REJECTED' },
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
    private readonly snackbar: SnackbarService,
  ) {
    this.loadMerchants();
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
          this.snackbar.showSuccess('Merchant added successfully.');
          this.loadMerchants();
        },
        error: () => this.snackbar.showError('Failed to add merchant.'),
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
          this.snackbar.showSuccess('Merchant updated successfully.');
          this.loadMerchants();
        },
        error: () => this.snackbar.showError('Failed to update merchant.'),
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
          this.snackbar.showSuccess('Merchant deleted successfully.');
          this.loadMerchants();
        },
        error: () => this.snackbar.showError('Failed to delete merchant.'),
      });
    });
  }

  onApprove(row: MerchantRow): void {
    this.merchantsApi.approveMerchant(row.merchantId).subscribe({
      next: () => {
        this.snackbar.showSuccess('Merchant approved successfully.');
        const index = this.allData.findIndex((m) => m.merchantId === row.merchantId);
        if (index !== -1) {
          this.allData[index] = { ...row, merchantStatus: 'ACTIVE' };
          this.dataSource.data = [...this.allData];
        } else {
          this.loadMerchants();
        }
      },
      error: () => {
        this.snackbar.showError('Failed to approve merchant.');
        this.loadMerchants();
      },
    });
  }

  onReject(row: MerchantRow): void {
    const dialogRef = this.dialog.open(RejectReasonDialogComponent, {
      width: '420px',
      data: { merchantName: row.merchantName || 'Merchant' },
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe((reason: string | undefined) => {
      if (reason == null) return;

      const isSubMerchant = !!(row.parentMerchantName ?? '').trim() && row.subMerchantId != null;
      const request$ = isSubMerchant
        ? this.merchantsApi.rejectSubMerchant(row.merchantId, row.subMerchantId!, reason)
        : this.merchantsApi.rejectMerchant(row.merchantId, reason);

      request$.subscribe({
        next: () => {
          this.snackbar.showSuccess('Merchant rejected successfully.');
          const index = this.allData.findIndex((m) => m.merchantId === row.merchantId);
          if (index !== -1) {
            this.allData[index] = { ...row, merchantStatus: 'REJECTED' };
            this.dataSource.data = [...this.allData];
          } else {
            this.loadMerchants();
          }
        },
        error: () => {
          this.snackbar.showError('Failed to reject merchant.');
          this.loadMerchants();
        },
      });
    });
  }

  /** Show Approve button only for main merchants (no parent) with PENDING status. */
  canShowApprove(row: MerchantRow): boolean {
    const isPending = (row.merchantStatus ?? '').toUpperCase() === 'PENDING';
    const isMainMerchant = !(row.parentMerchantName ?? '').trim();
    return isPending && isMainMerchant;
  }

  /** Show Reject button only for main merchants (not sub-merchant) with PENDING status. */
  canShowReject(row: MerchantRow): boolean {
    const isSubMerchant =
      (row.recordType ?? '').toUpperCase() === 'SUB_MERCHANT' ||
      !!(row.parentMerchantName ?? '').trim() ||
      row.subMerchantId != null;
    if (isSubMerchant) return false;
    const status = (row.merchantStatus ?? '').trim().toUpperCase();
    return status === 'PENDING' || status === 'SUB_PENDING' || status === 'PENDING_APPROVAL';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'active',
      INACTIVE: 'inactive',
      PENDING: 'pending',
      SUB_PENDING: 'pending',
      REJECTED: 'rejected',
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
