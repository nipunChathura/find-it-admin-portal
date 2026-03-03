import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Shared options for all customer alerts (success/error) so they look the same across the app. */
const SNACKBAR_ACTION = 'Close';
const SUCCESS_OPTIONS = {
  duration: 4000,
  verticalPosition: 'top' as const,
  panelClass: ['snackbar-success'],
};
const ERROR_OPTIONS = {
  duration: 5000,
  verticalPosition: 'top' as const,
  panelClass: ['snackbar-error'],
};

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly snackBar = inject(MatSnackBar);

  /** Show a success message to the customer (green bar, top). */
  showSuccess(message: string): void {
    this.snackBar.open(message, SNACKBAR_ACTION, SUCCESS_OPTIONS);
  }

  /** Show an error message to the customer (red bar, top). */
  showError(message: string): void {
    this.snackBar.open(message, SNACKBAR_ACTION, ERROR_OPTIONS);
  }
}
