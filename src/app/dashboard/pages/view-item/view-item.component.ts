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
import { AdminItemsApiService, ViewItemRow } from '../../../core/api/admin-items.api';
import { DeleteItemConfirmDialogComponent, DeleteItemConfirmData } from './delete-item-confirm.dialog';
import { EditItemDialogComponent, EditItemDialogResult } from './edit-item.dialog';
import { AddItemDialogComponent, AddItemDialogResult } from './add-item.dialog';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'PENDING', label: 'PENDING' },
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
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './view-item.component.html',
  styleUrl: './view-item.component.scss',
})
export class ViewItemComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly statusOptions = STATUS_OPTIONS;
  readonly displayedColumns: string[] = ['actions', 'id', 'name', 'description', 'status', 'createdDate'];

  statusFilter = 'all';
  searchText = '';
  dataSource = new MatTableDataSource<ViewItemRow>([]);
  private allData: ViewItemRow[] = [];

  constructor(
    private readonly dialog: MatDialog,
    private readonly adminItemsApi: AdminItemsApiService,
    private readonly snackBar: MatSnackBar,
  ) {
    this.loadItems();
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
      name: newItem.name,
      description: newItem.description,
      status: newItem.status,
    };
    this.adminItemsApi.createItem(body).subscribe({
      next: () => {
        this.showSuccess('Item added successfully.');
        this.loadItems();
      },
      error: () => {
        this.showError('Failed to add item.');
        this.loadItems();
      },
    });
  }

  onEdit(row: ViewItemRow): void {
    const dialogRef = this.dialog.open(EditItemDialogComponent, {
      width: '420px',
      data: {
        id: row.id,
        name: row.name,
        description: row.description,
        status: row.status,
        createdDate: row.createdDate,
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
      name: result.name,
      description: result.description,
      status: result.status,
    };
    this.adminItemsApi.updateItem(result.id, body).subscribe({
      next: () => {
        this.showSuccess('Item updated successfully.');
        this.loadItems();
      },
      error: () => {
        this.showError('Failed to update item.');
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
        this.showSuccess('Item deleted successfully.');
        this.loadItems();
      },
      error: () => {
        this.showError('Failed to delete item.');
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
      if (prop === 'createdDate') return new Date(row.createdDate).getTime();
      switch (prop) {
        case 'id': return row.id;
        case 'name': return row.name.toLowerCase();
        case 'description': return (row.description ?? '').toLowerCase();
        case 'status': return row.status;
        default: return '';
      }
    };
  }

  onSearch(): void {
    this.loadItems();
  }

  onClear(): void {
    this.statusFilter = 'all';
    this.searchText = '';
    this.loadItems();
  }

  private loadItems(): void {
    const status =
      this.statusFilter === 'all' || this.statusFilter === ''
        ? ''
        : this.statusFilter;
    const search = this.searchText?.trim() ?? '';
    this.adminItemsApi.getItems({ status, search }).subscribe({
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
