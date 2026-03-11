import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { from } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AdminOutletsApiService } from '../../../core/api/admin-outlets.api';
import {
  OutletSchedulesApiService,
  CreateSchedulePayload,
  ScheduleApiItem,
} from '../../../core/api/outlet-schedules.api';
import {
  OutletScheduleEntry,
  OutletScheduleRow,
  ScheduleType,
  DayOfWeek,
  SCHEDULE_TYPE_LABELS,
  DAY_OF_WEEK_OPTIONS,
} from './outlet-schedule.model';
import { ScheduleFormDialogComponent } from './schedule-form.dialog';
import { DeleteScheduleConfirmDialogComponent } from './delete-schedule-confirm.dialog';

type TabType = 'NORMAL' | 'EMERGENCY' | 'TEMPORARY';

function toRow(entry: OutletScheduleEntry): OutletScheduleRow {
  let dayOrDateLabel = '—';
  if (entry.scheduleType === 'NORMAL' && entry.dayOfWeek) {
    const day = DAY_OF_WEEK_OPTIONS.find((d) => d.value === entry.dayOfWeek);
    dayOrDateLabel = day?.label ?? entry.dayOfWeek;
  } else if (entry.date) {
    dayOrDateLabel = entry.date;
  } else if (entry.startDate && entry.endDate) {
    dayOrDateLabel = `${entry.startDate} to ${entry.endDate}`;
  } else if (entry.startDate) {
    dayOrDateLabel = entry.startDate;
  }
  return { ...entry, dayOrDateLabel };
}

/** Map API response item to our entry (specialDate -> date). Handles isClosed as "Y"/"N" or boolean. */
function apiItemToEntry(item: ScheduleApiItem, outletId: number): OutletScheduleEntry {
  const specialOrDate = item.specialDate ?? item['date'];
  const dateVal = typeof specialOrDate === 'string' ? specialOrDate : null;
  const rawClosed = item.isClosed as boolean | string | undefined;
  const isClosed =
    rawClosed === true ||
    (typeof rawClosed === 'string' && rawClosed.toUpperCase() === 'Y');
  const priority = typeof item.priority === 'number' ? item.priority : undefined;
  const active = item.active === true || item.active === false ? item.active : true;
  return {
    id: item.id,
    outletId: item.outletId ?? outletId,
    scheduleType: (item.scheduleType as ScheduleType) ?? 'NORMAL',
    dayOfWeek: (item.dayOfWeek as DayOfWeek | null) ?? null,
    date: dateVal,
    startDate: typeof item.startDate === 'string' ? item.startDate : null,
    endDate: typeof item.endDate === 'string' ? item.endDate : null,
    openTime: typeof item.openTime === 'string' ? item.openTime : '09:00',
    closeTime: typeof item.closeTime === 'string' ? item.closeTime : '18:00',
    isClosed,
    reason: typeof item.reason === 'string' ? item.reason : (item.reason == null ? null : String(item.reason)),
    priority,
    active,
  };
}

/** Build API create payload from dialog entry (date -> specialDate). */
function entryToCreatePayload(entry: OutletScheduleEntry): CreateSchedulePayload {
  return {
    scheduleType: entry.scheduleType,
    dayOfWeek: entry.dayOfWeek ?? null,
    specialDate: entry.date ?? null,
    startDate: entry.startDate ?? null,
    endDate: entry.endDate ?? null,
    openTime: entry.openTime,
    closeTime: entry.closeTime,
    isClosed: entry.isClosed,
    reason: entry.reason ?? null,
  };
}

/** Build API update payload including priority and active from row. */
function entryToUpdatePayload(entry: OutletScheduleEntry, row: OutletScheduleRow): CreateSchedulePayload {
  return {
    ...entryToCreatePayload(entry),
    priority: row.priority ?? 1,
    active: row.active ?? true,
  };
}

@Component({
  selector: 'app-outlet-schedule',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './outlet-schedule.component.html',
  styleUrl: './outlet-schedule.component.scss',
})
export class OutletScheduleComponent implements OnInit {
  readonly displayedColumns: string[] = [
    'actions',
    'dayOrDate',
    'openTime',
    'closeTime',
    'isClosed',
    'reason',
  ];
  readonly dayOfWeekFilterOptions = [
    { value: '', label: 'All days' },
    ...DAY_OF_WEEK_OPTIONS.map((d) => ({ value: d.value, label: d.label })),
  ];
  readonly tabTypes: { key: TabType; label: string }[] = [
    { key: 'NORMAL', label: SCHEDULE_TYPE_LABELS.NORMAL },
    { key: 'EMERGENCY', label: SCHEDULE_TYPE_LABELS.EMERGENCY },
    { key: 'TEMPORARY', label: SCHEDULE_TYPE_LABELS.TEMPORARY },
  ];

  outletOptions: { outletId: number; outletName: string }[] = [];
  selectedOutletId: number | null = null;
  searchText = '';
  /** Optional API filter: date (calendar picker). */
  filterDate: Date | null = null;
  /** Optional API filter: day of week (e.g. MONDAY). */
  filterDayOfWeek = '';
  dataSource = new MatTableDataSource<OutletScheduleRow>([]);
  private allSchedules: OutletScheduleRow[] = [];

  constructor(
    private readonly dialog: MatDialog,
    private readonly injector: Injector,
    private readonly outletsApi: AdminOutletsApiService,
    private readonly schedulesApi: OutletSchedulesApiService,
    private readonly snackbar: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.loadOutlets();
  }

  private loadOutlets(): void {
    this.outletsApi.getOutlets({ search: '', status: '', outletType: '' }).subscribe({
      next: (items) => {
        this.outletOptions = items.map((item) => ({
          outletId: item.row.outletId,
          outletName: item.row.outletName || `Outlet ${item.row.outletId}`,
        }));
        if (this.outletOptions.length && !this.selectedOutletId) {
          this.selectedOutletId = this.outletOptions[0].outletId;
          this.loadSchedules();
        }
      },
      error: () => (this.outletOptions = []),
    });
  }

  onOutletChange(): void {
    this.loadSchedules();
  }

  selectedTabIndex = 0;

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.filterByTabAndSearch(this.tabTypes[index].key);
  }

  private get activeTabKey(): TabType {
    return this.tabTypes[this.selectedTabIndex]?.key ?? 'NORMAL';
  }

  loadSchedules(): void {
    if (this.selectedOutletId == null) {
      this.allSchedules = [];
      this.dataSource.data = [];
      return;
    }
    const outletId = this.selectedOutletId;
    const dateStr = this.filterDate
      ? formatDate(this.filterDate, 'yyyy-MM-dd', 'en')
      : undefined;
    const params = {
      date: dateStr,
      dayOfWeek: this.filterDayOfWeek?.trim() || undefined,
    };
    this.schedulesApi.getSchedules(outletId, params).subscribe({
      next: (items) => {
        this.allSchedules = items.map((item) => toRow(apiItemToEntry(item, outletId)));
        this.filterByTabAndSearch(this.tabTypes[this.selectedTabIndex]?.key ?? 'NORMAL');
      },
      error: () => {
        this.allSchedules = [];
        this.dataSource.data = [];
      },
    });
  }

  private filterByTabAndSearch(tabKey: TabType): void {
    let list = this.allSchedules.filter((row) => {
      if (tabKey === 'NORMAL') return row.scheduleType === 'NORMAL';
      if (tabKey === 'TEMPORARY') return row.scheduleType === 'TEMPORARY';
      return row.scheduleType === 'EMERGENCY' || row.scheduleType === 'DAILY';
    });
    const q = this.searchText?.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (row) =>
          row.dayOrDateLabel.toLowerCase().includes(q) ||
          (row.reason ?? '').toLowerCase().includes(q),
      );
    }
    this.dataSource.data = list;
  }

  private getFilteredData(): OutletScheduleRow[] {
    return this.dataSource.data;
  }

  onSearch(): void {
    this.filterByTabAndSearch(this.activeTabKey);
  }

  onClearFilters(): void {
    this.searchText = '';
    this.filterDate = null;
    this.filterDayOfWeek = '';
    this.loadSchedules();
  }

  /** Reload schedules from API with current date/day filters. */
  onLoadSchedules(): void {
    this.loadSchedules();
  }

  onAdd(): void {
    if (this.selectedOutletId == null) {
      this.snackbar.showError('Please select an outlet first.');
      return;
    }
    const outletId = this.selectedOutletId;
    const ref = this.dialog.open(ScheduleFormDialogComponent, {
      width: '460px',
      data: { outletId, entry: null },
      injector: this.injector,
    });
    ref.afterClosed().subscribe((result: OutletScheduleEntry | { multiple: true; entries: OutletScheduleEntry[] } | undefined) => {
      if (!result) return;
      if ('multiple' in result && result.multiple && result.entries?.length) {
        from(result.entries)
          .pipe(
            concatMap((entry) => this.schedulesApi.createSchedule(outletId, entryToCreatePayload(entry))),
            toArray(),
          )
          .subscribe({
            next: () => {
              this.snackbar.showSuccess('Schedules added successfully.');
              this.loadSchedules();
            },
            error: () => {
              this.snackbar.showError('Failed to add one or more schedules.');
              this.loadSchedules();
            },
          });
      } else {
        const entry = result as OutletScheduleEntry;
        const payload = entryToCreatePayload(entry);
        this.schedulesApi.createSchedule(outletId, payload).subscribe({
          next: () => {
            this.snackbar.showSuccess('Schedule added successfully.');
            this.loadSchedules();
          },
          error: () => {
            this.snackbar.showError('Failed to add schedule.');
          },
        });
      }
    });
  }

  onEdit(row: OutletScheduleRow): void {
    if (this.selectedOutletId == null || row.id == null) {
      this.snackbar.showError('Cannot edit: outlet or schedule id missing.');
      return;
    }
    const outletId = this.selectedOutletId;
    const ref = this.dialog.open(ScheduleFormDialogComponent, {
      width: '460px',
      data: { outletId: row.outletId, entry: row },
      injector: this.injector,
    });
    ref.afterClosed().subscribe((entry: OutletScheduleEntry | undefined) => {
      if (!entry) return;
      const payload = entryToUpdatePayload(entry, row);
      const scheduleId = row.id!;
      this.schedulesApi.updateSchedule(outletId, scheduleId, payload).subscribe({
        next: () => {
          this.snackbar.showSuccess('Schedule updated successfully.');
          this.loadSchedules();
        },
        error: () => {
          this.snackbar.showError('Failed to update schedule.');
        },
      });
    });
  }

  onDelete(row: OutletScheduleRow): void {
    if (this.selectedOutletId == null || row.id == null) {
      this.snackbar.showError('Cannot delete: outlet or schedule id missing.');
      return;
    }
    const outletId = this.selectedOutletId;
    const ref = this.dialog.open(DeleteScheduleConfirmDialogComponent, {
      width: '360px',
      data: {
        dayOrDateLabel: row.dayOrDateLabel,
        openTime: row.openTime,
        closeTime: row.closeTime,
      },
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      const scheduleId = row.id!;
      this.schedulesApi.deleteSchedule(outletId, scheduleId).subscribe({
        next: () => {
          this.snackbar.showSuccess('Schedule deleted successfully.');
          this.loadSchedules();
        },
        error: () => {
          this.snackbar.showError('Failed to delete schedule.');
        },
      });
    });
  }

  getRowClass(row: OutletScheduleRow): string {
    return row.isClosed ? 'schedule-row--closed' : 'schedule-row--open';
  }
}
