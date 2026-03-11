import { Component, ViewChild, AfterViewInit, computed } from '@angular/core';
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
import { AuthService } from '../../../core/auth/auth.service';
import { AdminUsersApiService, ViewUserRow } from '../../../core/api/admin-users.api';
import { getApiErrorMessage } from '../../../core/api/api-error.util';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { DeleteUserConfirmDialogComponent, DeleteUserConfirmData } from './delete-user-confirm.dialog';
import { RejectUserReasonDialogComponent } from './reject-user-reason.dialog';
import { EditUserDialogComponent, EditUserDialogResult } from './edit-user.dialog';
import { AddUserDialogComponent, AddUserDialogResult } from './add-user.dialog';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'PENDING', label: 'PENDING' },
  { value: 'APPROVED', label: 'APPROVED' },
  { value: 'REJECTED', label: 'REJECTED' },
  { value: 'FORGOT_PASSWORD_PENDING', label: 'FORGOT_PASSWORD_PENDING' },
];

@Component({
  selector: 'app-view-user',
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
  templateUrl: './view-user.component.html',
  styleUrl: './view-user.component.scss',
})
export class ViewUserComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly statusOptions = STATUS_OPTIONS;
  readonly displayedColumns: string[] = ['actions', 'id', 'name', 'email', 'status', 'createdDate'];

  /** True when logged-in user role (from login API, saved in state) can edit user status. */
  get canEditUserStatus(): boolean {
    return this.auth.canEditUserStatus();
  }

  statusFilter = 'all';
  searchText = '';
  dataSource = new MatTableDataSource<ViewUserRow>([]);
  private allData: ViewUserRow[] = [];

  constructor(
    private readonly auth: AuthService,
    private readonly dialog: MatDialog,
    private readonly adminUsersApi: AdminUsersApiService,
    private readonly snackbar: SnackbarService,
  ) {
    this.loadUsers();
  }

  onAddUser(): void {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '420px',
      data: { isSysAdmin: this.canEditUserStatus },
    });
    dialogRef.afterClosed().subscribe((result: AddUserDialogResult | undefined) => {
      if (result) {
        this.addUser(result);
      }
    });
  }

  private addUser(newUser: AddUserDialogResult): void {
    const body = {
      username: newUser.username.trim(),
      password: newUser.password,
      email: newUser.email?.trim() ?? '',
      role: 'ADMIN',
      status: newUser.status,
    };
    this.adminUsersApi.createUser(body).subscribe({
      next: () => {
        this.snackbar.showSuccess('User added successfully.');
        this.loadUsers();
      },
      error: (err) => {
        const message = getApiErrorMessage(err, 'Failed to add user.');
        this.snackbar.showError(message);
        this.loadUsers();
      },
    });
  }

  onEdit(row: ViewUserRow): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '420px',
      data: {
        id: row.id,
        name: row.name,
        email: row.email,
        status: row.status,
        createdDate: row.createdDate,
        role: row.role,
        canEditStatus: this.canEditUserStatus,
      },
    });
    dialogRef.afterClosed().subscribe((result: EditUserDialogResult | undefined) => {
      if (result) {
        this.updateUser(result);
      }
    });
  }

  private updateUser(result: EditUserDialogResult): void {
    const body = {
      username: result.username.trim(),
      email: result.email?.trim() ?? '',
      password: result.password ?? '',
      role: 'ADMIN',
      status: result.status,
      merchantId: null as number | null,
      subMerchantId: null as number | null,
    };
    this.adminUsersApi.updateUser(result.id, body).subscribe({
      next: () => {
        this.snackbar.showSuccess('User updated successfully.');
        this.loadUsers();
      },
      error: (err) => {
        this.snackbar.showError(getApiErrorMessage(err, 'Failed to update user.'));
        this.loadUsers();
      },
    });
  }

  onDelete(row: ViewUserRow): void {
    const data: DeleteUserConfirmData = { userName: row.name };
    const dialogRef = this.dialog.open(DeleteUserConfirmDialogComponent, {
      width: '400px',
      data,
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteUser(row);
      }
    });
  }

  private deleteUser(row: ViewUserRow): void {
    this.adminUsersApi.updateUserStatus(row.id, 'DELETED').subscribe({
      next: () => {
        this.snackbar.showSuccess('User deleted successfully.');
        this.loadUsers();
      },
      error: (err) => {
        this.snackbar.showError(getApiErrorMessage(err, 'Failed to delete user.'));
        this.loadUsers();
      },
    });
  }

  onApprove(row: ViewUserRow): void {
    this.adminUsersApi.approveUser(row.id).subscribe({
      next: () => {
        this.snackbar.showSuccess('User approved successfully.');
        const index = this.allData.findIndex((u) => u.id === row.id);
        if (index !== -1) {
          this.allData[index] = { ...row, status: 'APPROVED' };
          this.dataSource.data = [...this.allData];
        } else {
          this.loadUsers();
        }
      },
      error: (err) => {
        this.snackbar.showError(getApiErrorMessage(err, 'Failed to approve user.'));
        this.loadUsers();
      },
    });
  }

  onReject(row: ViewUserRow): void {
    const dialogRef = this.dialog.open(RejectUserReasonDialogComponent, {
      width: '420px',
      data: { userName: row.name || 'User' },
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe((reason: string | undefined) => {
      if (reason == null) return;
      this.adminUsersApi.rejectUser(row.id, reason).subscribe({
        next: () => {
          this.snackbar.showSuccess('User rejected successfully.');
          const index = this.allData.findIndex((u) => u.id === row.id);
          if (index !== -1) {
            this.allData[index] = { ...row, status: 'REJECTED' };
            this.dataSource.data = [...this.allData];
          } else {
            this.loadUsers();
          }
        },
        error: (err) => {
          this.snackbar.showError(getApiErrorMessage(err, 'Failed to reject user.'));
          this.loadUsers();
        },
      });
    });
  }

  /** Show approve icon only for sysAdmin and when user status is PENDING. */
  canShowApprove(row: ViewUserRow): boolean {
    return this.canEditUserStatus && row.status === 'PENDING';
  }

  /** Show reject icon only for sysAdmin and when user status is PENDING. */
  canShowReject(row: ViewUserRow): boolean {
    return this.canEditUserStatus && (row.status ?? '').toUpperCase() === 'PENDING';
  }

  /** Hide Edit/Delete/Approve for rows whose user has SysAdmin role. */
  canShowActions(row: ViewUserRow): boolean {
    const r = (row.role ?? '').trim().toLowerCase();
    return r !== 'sysadmin';
  }

  /** CSS class suffix for status badge (status-wise color). */
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'active',
      INACTIVE: 'inactive',
      PENDING: 'pending',
      APPROVED: 'approved',
      REJECTED: 'rejected',
      FORGOT_PASSWORD_PENDING: 'forgot-password-pending',
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
        case 'name': return row.name;
        case 'email': return (row.email ?? '').toLowerCase();
        case 'status': return row.status;
        default: return '';
      }
    };
  }

  onSearch(): void {
    this.loadUsers();
  }

  onClear(): void {
    this.statusFilter = 'all';
    this.searchText = '';
    this.loadUsers();
  }

  private loadUsers(): void {
    const status =
      this.statusFilter === 'all' || this.statusFilter === ''
        ? ''
        : this.statusFilter;
    const search = this.searchText?.trim() ?? '';
    this.adminUsersApi.getUsers({ status, search }).subscribe({
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
