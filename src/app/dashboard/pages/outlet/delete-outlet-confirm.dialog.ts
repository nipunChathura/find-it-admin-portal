import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface DeleteOutletConfirmData {
  outletName: string;
}

@Component({
  selector: 'app-delete-outlet-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Delete Outlet</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete <strong>{{ data.outletName }}</strong>?</p>
      <p class="delete-outlet-confirm__hint">This action cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button mat-dialog-close type="button" class="dialog-cancel-btn">Cancel</button>
      <button mat-raised-button color="warn" (click)="onConfirm()" type="button">Delete</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content { min-width: 280px; margin-bottom: 0.5rem; }
      .delete-outlet-confirm__hint { margin-top: 0.5rem; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); }
      mat-dialog-actions { padding-top: 0.5rem; gap: 0.5rem; }
      mat-dialog-actions button { border: 1px solid var(--mat-sys-outline-variant); }
      .dialog-cancel-btn { color: #c62828; }
    `,
  ],
})
export class DeleteOutletConfirmDialogComponent {
  readonly data: DeleteOutletConfirmData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DeleteOutletConfirmDialogComponent>);

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
