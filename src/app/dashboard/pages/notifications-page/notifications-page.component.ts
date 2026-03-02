import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from '../../../core/notifications/notification.service';
import { Notification, NotificationType } from '../../../core/notifications/notification.model';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule, MatTooltipModule],
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.scss',
})
export class NotificationsPageComponent implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);
  private sub: { unsubscribe(): void } | null = null;

  readonly list = signal<Notification[]>([]);
  readonly unreadCount = computed(() => this.list().filter((n) => !n.isRead).length);

  ngOnInit(): void {
    this.notificationService.load();
    this.sub = this.notificationService.notifications.subscribe((n) => this.list.set(n));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  markAsRead(n: Notification): void {
    this.notificationService.markAsRead(n.id).subscribe();
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }

  formatTime(date: Date): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  }

  getTypeIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
    };
    return icons[type] ?? 'info';
  }

  getTypeColorClass(type: NotificationType): string {
    return `notification-card--${type}`;
  }
}
