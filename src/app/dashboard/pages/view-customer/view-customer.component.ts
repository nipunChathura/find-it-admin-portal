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
import { AdminCustomersApiService, ViewCustomerRow } from '../../../core/api/admin-customers.api';
import { DeleteCustomerConfirmDialogComponent, DeleteCustomerConfirmData } from './delete-customer-confirm.dialog';
import { EditCustomerDialogComponent, EditCustomerDialogResult } from './edit-customer.dialog';
import { AddCustomerDialogComponent, AddCustomerDialogResult } from './add-customer.dialog';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'PENDING', label: 'PENDING' },
];

const MEMBERSHIP_TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'SILVER', label: 'SILVER' },
  { value: 'GOLD', label: 'GOLD' },
  { value: 'PLATINUM', label: 'PLATINUM' },
];

@Component({
  selector: 'app-view-customer',
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
  templateUrl: './view-customer.component.html',
  styleUrl: './view-customer.component.scss',
})
export class ViewCustomerComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly statusOptions = STATUS_OPTIONS;
  readonly membershipTypeOptions = MEMBERSHIP_TYPE_OPTIONS;
  readonly displayedColumns: string[] = ['actions', 'id', 'name', 'email', 'phone', 'membershipType', 'status'];

  statusFilter = 'all';
  membershipTypeFilter = 'all';
  searchText = '';
  dataSource = new MatTableDataSource<ViewCustomerRow>([]);
  private allData: ViewCustomerRow[] = [];

  constructor(
    private readonly dialog: MatDialog,
    private readonly adminCustomersApi: AdminCustomersApiService,
    private readonly snackBar: MatSnackBar,
  ) {
    this.loadCustomers();
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

  onAddCustomer(): void {
    const dialogRef = this.dialog.open(AddCustomerDialogComponent, {
      width: '420px',
      data: {},
    });
    dialogRef.afterClosed().subscribe((result: AddCustomerDialogResult | undefined) => {
      if (result) {
        this.addCustomer(result);
      }
    });
  }

  private addCustomer(newCustomer: AddCustomerDialogResult): void {
    const body = {
      name: newCustomer.name.trim(),
      email: newCustomer.email?.trim() ?? '',
      phone: newCustomer.phone?.trim() ?? '',
      status: newCustomer.status,
    };
    this.adminCustomersApi.createCustomer(body).subscribe({
      next: () => {
        this.showSuccess('Customer added successfully.');
        this.loadCustomers();
      },
      error: () => {
        this.showError('Failed to add customer.');
        this.loadCustomers();
      },
    });
  }

  onEdit(row: ViewCustomerRow): void {
    const dialogRef = this.dialog.open(EditCustomerDialogComponent, {
      width: '480px',
      data: {
        id: row.id,
        firstName: row.firstName ?? row.name.split(' ')[0] ?? '',
        lastName: row.lastName ?? row.name.split(' ').slice(1).join(' ') ?? '',
        email: row.email,
        phoneNumber: row.phone,
        membershipType: row.membershipType || 'SILVER',
        status: row.status,
        nic: row.nic ?? '',
        dob: row.dob ?? '',
        gender: row.gender ?? '',
        country: row.country ?? '',
      },
    });
    dialogRef.afterClosed().subscribe((result: EditCustomerDialogResult | undefined) => {
      if (result) {
        this.updateCustomer(result);
      }
    });
  }

  private updateCustomer(result: EditCustomerDialogResult): void {
    const body = {
      firstName: result.firstName,
      lastName: result.lastName,
      nic: result.nic,
      dob: result.dob,
      gender: result.gender,
      country: result.country,
      profileImage: result.profileImage,
      email: result.email,
      phoneNumber: result.phoneNumber,
      membershipType: result.membershipType,
      status: result.status,
    };
    this.adminCustomersApi.updateCustomer(result.id, body).subscribe({
      next: () => {
        this.showSuccess('Customer updated successfully.');
        this.loadCustomers();
      },
      error: () => {
        this.showError('Failed to update customer.');
        this.loadCustomers();
      },
    });
  }

  onDelete(row: ViewCustomerRow): void {
    const data: DeleteCustomerConfirmData = { customerName: row.name };
    const dialogRef = this.dialog.open(DeleteCustomerConfirmDialogComponent, {
      width: '400px',
      data,
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteCustomer(row);
      }
    });
  }

  private deleteCustomer(row: ViewCustomerRow): void {
    this.adminCustomersApi.deleteCustomer(row.id).subscribe({
      next: () => {
        this.showSuccess('Customer deleted successfully.');
        this.loadCustomers();
      },
      error: () => {
        this.showError('Failed to delete customer.');
        this.loadCustomers();
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
      if (prop === 'createdDate') return row.createdDate ? new Date(row.createdDate).getTime() : 0;
      switch (prop) {
        case 'id': return row.id;
        case 'name': return row.name;
        case 'email': return (row.email ?? '').toLowerCase();
        case 'phone': return (row.phone ?? '').toLowerCase();
        case 'status': return row.status;
        case 'membershipType': return (row.membershipType ?? '').toLowerCase();
        default: return '';
      }
    };
  }

  onSearch(): void {
    this.loadCustomers();
  }

  onClear(): void {
    this.statusFilter = 'all';
    this.membershipTypeFilter = 'all';
    this.searchText = '';
    this.loadCustomers();
  }

  private loadCustomers(): void {
    const status =
      this.statusFilter === 'all' || this.statusFilter === ''
        ? ''
        : this.statusFilter;
    const membershipType =
      this.membershipTypeFilter === 'all' || this.membershipTypeFilter === ''
        ? ''
        : this.membershipTypeFilter;
    const search = this.searchText?.trim() ?? '';
    this.adminCustomersApi.getCustomers({ status, search, membershipType }).subscribe({
      next: (rows) => {
        this.allData = rows;
        this.dataSource.data = [...this.allData];
        this.dataSource.paginator?.firstPage();
      },
      error: () => {
        this.allData = [];
        this.dataSource.data = [];
        this.showError('Failed to load customers. Please check the connection and try again.');
      },
    });
  }
}
