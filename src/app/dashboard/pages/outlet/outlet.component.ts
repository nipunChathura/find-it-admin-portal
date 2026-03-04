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
import { AdminOutletsApiService, OutletRow, OutletTableItem } from '../../../core/api/admin-outlets.api';
import { DeleteOutletConfirmDialogComponent } from './delete-outlet-confirm.dialog';
import { EditOutletDialogComponent, EditOutletDialogResult } from './edit-outlet.dialog';
import { AddOutletDialogComponent, AddOutletDialogResult } from './add-outlet.dialog';
import { OutletDetailDialogComponent } from './outlet-detail.dialog';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'PENDING', label: 'PENDING' },
];

const OUTLET_TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'PHYSICAL_STORE', label: 'PHYSICAL_STORE' },
  { value: 'ONLINE', label: 'ONLINE' },
  { value: 'KIOSK', label: 'KIOSK' },
];

@Component({
  selector: 'app-outlet',
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
  templateUrl: './outlet.component.html',
  styleUrl: './outlet.component.scss',
})
export class OutletComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly statusOptions = STATUS_OPTIONS;
  readonly outletTypeOptions = OUTLET_TYPE_OPTIONS;
  readonly displayedColumns: string[] = [
    'actions',
    'outletId',
    'outletName',
    'outletAddress',
    'outletPhone',
    'outletType',
    'merchantName',
    'subMerchantName',
    'status',
  ];

  statusFilter = 'all';
  outletTypeFilter = 'all';
  searchText = '';
  dataSource = new MatTableDataSource<OutletTableItem>([]);
  private allData: OutletTableItem[] = [];

  constructor(
    private readonly dialog: MatDialog,
    private readonly outletsApi: AdminOutletsApiService,
    private readonly snackbar: SnackbarService,
  ) {
    this.loadOutlets();
  }

  onAddOutlet(): void {
    const dialogRef = this.dialog.open(AddOutletDialogComponent, {
      width: '540px',
      maxHeight: '90vh',
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe((result: AddOutletDialogResult | undefined) => {
      if (!result) return;
      this.outletsApi.createOutletWithPayload(result).subscribe({
        next: () => {
          this.snackbar.showSuccess('Outlet added successfully.');
          this.loadOutlets();
        },
        error: () => this.snackbar.showError('Failed to add outlet.'),
      });
    });
  }

  onEdit(item: OutletTableItem): void {
    const dialogRef = this.dialog.open(EditOutletDialogComponent, {
      width: '540px',
      maxHeight: '90vh',
      data: { outletId: item.row.outletId, ...item.raw },
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe((result: EditOutletDialogResult | undefined) => {
      if (!result || result.outletId == null) return;
      const { outletId, ...body } = result;
      this.outletsApi.updateOutletWithPayload(outletId, body).subscribe({
        next: () => {
          this.snackbar.showSuccess('Outlet updated successfully.');
          this.loadOutlets();
        },
        error: () => this.snackbar.showError('Failed to update outlet.'),
      });
    });
  }

  onViewDetails(item: OutletTableItem): void {
    this.dialog.open(OutletDetailDialogComponent, {
      width: '520px',
      maxHeight: '90vh',
      data: { item },
      disableClose: false,
    });
  }

  onDelete(item: OutletTableItem): void {
    const dialogRef = this.dialog.open(DeleteOutletConfirmDialogComponent, {
      width: '360px',
      data: { outletName: item.row.outletName },
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.outletsApi.deleteOutlet(item.row.outletId).subscribe({
        next: () => {
          this.snackbar.showSuccess('Outlet deleted successfully.');
          this.loadOutlets();
        },
        error: () => this.snackbar.showError('Failed to delete outlet.'),
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
    this.dataSource.sortingDataAccessor = (item, prop) => {
      const row = item.row;
      switch (prop) {
        case 'outletId':
          return row.outletId;
        case 'outletName':
          return (row.outletName ?? '').toLowerCase();
        case 'outletAddress':
          return (row.outletAddress ?? '').toLowerCase();
        case 'outletPhone':
          return row.outletPhone ?? '';
        case 'outletType':
          return (row.outletType ?? '').toLowerCase();
        case 'merchantName':
          return (row.merchantName ?? '').toLowerCase();
        case 'subMerchantName':
          return (row.subMerchantName ?? '').toLowerCase();
        case 'status':
          return row.status ?? '';
        default:
          return '';
      }
    };
  }

  onSearch(): void {
    this.loadOutlets();
  }

  onClear(): void {
    this.statusFilter = 'all';
    this.outletTypeFilter = 'all';
    this.searchText = '';
    this.loadOutlets();
  }

  private loadOutlets(): void {
    const status =
      this.statusFilter === 'all' || this.statusFilter === '' ? '' : this.statusFilter;
    const outletType =
      this.outletTypeFilter === 'all' || this.outletTypeFilter === ''
        ? ''
        : this.outletTypeFilter;
    const search = this.searchText?.trim() ?? '';
    this.outletsApi.getOutlets({ status, outletType, search }).subscribe({
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
