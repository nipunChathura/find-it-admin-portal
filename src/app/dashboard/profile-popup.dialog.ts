import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ChangeProfileImageDialogComponent } from './change-profile-image.dialog';
import { ChangePasswordDialogComponent } from './change-password.dialog';

@Component({
  selector: 'app-profile-popup-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Profile</h2>
    <mat-dialog-content class="profile-popup__content">
      <div class="profile-popup__user">
        <div class="profile-popup__avatar" (click)="openChangeImage()">
          @if (profileImageUrl()) {
            <img [src]="profileImageUrl()" alt="Profile" />
          } @else {
            <mat-icon>account_circle</mat-icon>
          }
          <span class="profile-popup__avatar-hint">Change</span>
        </div>
        <div class="profile-popup__details">
          <p class="profile-popup__name">{{ user()?.username }}</p>
          <p class="profile-popup__meta">Role: {{ user()?.role }}</p>
          <p class="profile-popup__meta">User ID: {{ user()?.userId }}</p>
          <p class="profile-popup__meta">Status: {{ user()?.userStatus }}</p>
        </div>
      </div>
      <div class="profile-popup__actions">
        <button mat-stroked-button (click)="openChangeImage()" class="profile-popup__btn">
          <mat-icon>photo_camera</mat-icon>
          Change profile image
        </button>
        <button mat-stroked-button (click)="openChangePassword()" class="profile-popup__btn">
          <mat-icon>lock</mat-icon>
          Change password
        </button>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .profile-popup__content {
      min-width: 320px;
      padding-top: 0.5rem;
    }
    .profile-popup__user {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .profile-popup__avatar {
      position: relative;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--mat-sys-surface-container-high);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
      flex-shrink: 0;
    }
    .profile-popup__avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .profile-popup__avatar .mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--mat-sys-on-surface-variant);
    }
    .profile-popup__avatar-hint {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0,0,0,0.5);
      color: #fff;
      font-size: 0.7rem;
      text-align: center;
      padding: 2px 0;
    }
    .profile-popup__details {
      flex: 1;
      min-width: 0;
    }
    .profile-popup__name {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
    }
    .profile-popup__meta {
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
      margin: 0.125rem 0;
    }
    .profile-popup__actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .profile-popup__btn {
      justify-content: flex-start;
    }
    .profile-popup__btn .mat-icon {
      margin-right: 0.5rem;
    }
  `],
})
export class ProfilePopupDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ProfilePopupDialogComponent>);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly user = this.auth.user;

  /** Profile image URL from sessionStorage (key: findit_profile_image). */
  profileImageUrl = this.auth.profileImageUrl;

  openChangeImage(): void {
    this.dialog.open(ChangeProfileImageDialogComponent, {
      width: '400px',
      data: { currentUrl: this.profileImageUrl() },
    }).afterClosed().subscribe((result?: string) => {
      if (result !== undefined) this.auth.setProfileImageUrl(result);
    });
  }

  openChangePassword(): void {
    this.dialog.open(ChangePasswordDialogComponent, { width: '400px' });
  }
}
