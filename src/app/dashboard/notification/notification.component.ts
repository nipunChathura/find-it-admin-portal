import {
  Component,
  inject,
  HostListener,
  ElementRef,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from '../../core/notifications/notification.service';
import { Notification, NotificationType } from '../../core/notifications/notification.model';

const DROPDOWN_ANIMATION = trigger('dropdown', [
  state(
    'void',
    style({
      opacity: 0,
      transform: 'translateY(-8px)',
    })
  ),
  state(
    'open',
    style({
      opacity: 1,
      transform: 'translateY(0)',
    })
  ),
  transition('void => open', [animate('200ms ease-out')]),
  transition('open => void', [animate('150ms ease-in')]),
]);

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
  animations: [DROPDOWN_ANIMATION],
})
export class NotificationComponent implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private subscription: { unsubscribe(): void } | null = null;

  readonly isOpen = signal(false);
  readonly list = signal<Notification[]>([]);
  readonly unreadCount = computed(() =>
    this.list().filter((n) => !n.isRead).length
  );

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications.subscribe(
      (n) => this.list.set(n)
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const el = this.elementRef.nativeElement;
    if (this.isOpen() && event.target instanceof Node && !el.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
    if (this.isOpen()) this.notificationService.load();
  }

  close(): void {
    this.isOpen.set(false);
  }

  markAsRead(n: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(n.id).subscribe();
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
    this.close();
  }

  viewAll(): void {
    this.close();
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
    return `notification-item--${type}`;
  }
}
