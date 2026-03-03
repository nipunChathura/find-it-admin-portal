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
import { AdminPaymentsApiService, CreatePaymentBody, PaymentRow } from '../../../core/api/admin-payments.api';
import { AdminOutletsApiService } from '../../../core/api/admin-outlets.api';
import { AddPaymentDialogComponent } from './add-payment.dialog';
import { EditPaymentDialogComponent } from './edit-payment.dialog';
import { DeletePaymentConfirmDialogComponent } from './delete-payment-confirm.dialog';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'PENDING' },
  { value: 'PAID', label: 'PAID' },
  { value: 'FAILED', label: 'FAILED' },
];

@Component({
  selector: 'app-outlet-payment',
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
  templateUrl: './outlet-payment.component.html',
  styleUrl: './outlet-payment.component.scss',
})
export class OutletPaymentComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly statusOptions = STATUS_OPTIONS;
  readonly displayedColumns: string[] = [
    'actions',
    'paymentId',
    'outletName',
    'amount',
    'paymentType',
    'paidMonth',
    'paymentDate',
    'paymentStatus',
  ];

  statusFilter = 'all';
  outletIdFilter: number | '' = '';
  outletSearchText = '';
  outletOptions: { outletId: number; outletName: string }[] = [];
  private outletSearchTimeout: ReturnType<typeof setTimeout> | null = null;

  dataSource = new MatTableDataSource<PaymentRow>([]);

  constructor(
    private readonly adminPaymentsApi: AdminPaymentsApiService,
    private readonly adminOutletsApi: AdminOutletsApiService,
    private readonly dialog: MatDialog,
    private readonly snackbar: SnackbarService,
  ) {
    this.loadPayments();
    this.loadDefaultOutletOptions();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadDefaultOutletOptions(): void {
    this.adminOutletsApi.getOutlets({}).subscribe({
      next: (items) => {
        this.outletOptions = items.slice(0, 5).map((i) => ({
          outletId: i.row.outletId,
          outletName: i.row.outletName,
        }));
      },
      error: () => {
        this.outletOptions = [];
      },
    });
  }

  onOutletSearchInput(): void {
    if (this.outletSearchTimeout != null) clearTimeout(this.outletSearchTimeout);
    this.outletSearchTimeout = setTimeout(() => {
      const search = this.outletSearchText?.trim() ?? '';
      if (search.length === 0) {
        this.adminOutletsApi.getOutlets({}).subscribe({
          next: (items) => {
            this.outletOptions = items.slice(0, 5).map((i) => ({
              outletId: i.row.outletId,
              outletName: i.row.outletName,
            }));
          },
          error: () => {
            this.outletOptions = [];
          },
        });
        return;
      }
      this.adminOutletsApi.getOutlets({ search }).subscribe({
        next: (items) => {
          this.outletOptions = items.slice(0, 5).map((i) => ({
            outletId: i.row.outletId,
            outletName: i.row.outletName,
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
    this.loadPayments();
  }

  loadPayments(): void {
    const outletId = this.outletIdFilter === '' ? '' : this.outletIdFilter;
    const status = this.statusFilter === 'all' ? '' : this.statusFilter;
    this.adminPaymentsApi.getPayments({ outletId, status }).subscribe({
      next: (rows) => {
        this.dataSource.data = rows;
      },
      error: () => {
        this.dataSource.data = [];
      },
    });
  }

  onSearch(): void {
    this.loadPayments();
  }

  onClear(): void {
    this.statusFilter = 'all';
    this.outletIdFilter = '';
    this.outletSearchText = '';
    this.loadDefaultOutletOptions();
    this.loadPayments();
  }


  onAddPayment(): void {
    this.dialog
      .open(AddPaymentDialogComponent, { width: '420px' })
      .afterClosed()
      .subscribe((result: CreatePaymentBody | undefined) => {
        if (result == null) return;
        this.adminPaymentsApi.createPayment(result).subscribe({
          next: () => {
            this.snackbar.showSuccess('Payment added successfully.');
            this.loadPayments();
          },
          error: () => this.snackbar.showError('Failed to add payment.'),
        });
      });
  }

  onEdit(row: PaymentRow): void {
    this.dialog
      .open(EditPaymentDialogComponent, { width: '420px', data: { payment: row } })
      .afterClosed()
      .subscribe((result: CreatePaymentBody | undefined) => {
        if (result == null) return;
        this.adminPaymentsApi.updatePayment(row.paymentId, result).subscribe({
          next: () => {
            this.snackbar.showSuccess('Payment updated successfully.');
            this.loadPayments();
          },
          error: () => this.snackbar.showError('Failed to update payment.'),
        });
      });
  }

  onDelete(row: PaymentRow): void {
    this.dialog
      .open(DeletePaymentConfirmDialogComponent, {
        width: '400px',
        data: { paymentId: row.paymentId, outletName: row.outletName, amount: row.amount },
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (!confirmed) return;
        this.adminPaymentsApi.deletePayment(row.paymentId).subscribe({
          next: () => {
            this.snackbar.showSuccess('Payment deleted successfully.');
            this.loadPayments();
          },
          error: () => this.snackbar.showError('Failed to delete payment.'),
        });
      });
  }

  canShowApprove(row: PaymentRow): boolean {
    return (row.paymentStatus || '').toUpperCase() === 'PENDING';
  }

  onApprove(row: PaymentRow): void {
    this.adminPaymentsApi.approvePayment(row.paymentId).subscribe({
      next: () => {
        this.snackbar.showSuccess('Payment approved successfully.');
        this.loadPayments();
      },
      error: () => this.snackbar.showError('Failed to approve payment.'),
    });
  }

  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'paid') return 'paid';
    if (s === 'pending') return 'pending';
    if (s === 'failed') return 'failed';
    return 'default';
  }
}
