import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import {
  OutletScheduleEntry,
  ScheduleType,
  DayOfWeek,
  SCHEDULE_TYPE_OPTIONS,
  DAY_OF_WEEK_OPTIONS,
} from './outlet-schedule.model';

export interface ScheduleFormDialogData {
  outletId: number;
  entry?: OutletScheduleEntry | null;
}

/** Time regex HH:mm (00:00 - 23:59). */
const TIME_PATTERN = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({ value: i, label: String(i).padStart(2, '0') }));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => ({ value: i, label: String(i).padStart(2, '0') }));

function parseTimeHHmm(val: string | null): { h: number; m: number } {
  if (!val || !TIME_PATTERN.test(val)) return { h: 9, m: 0 };
  const [h, m] = val.split(':').map(Number);
  return { h: Math.min(23, Math.max(0, h)), m: Math.min(59, Math.max(0, m)) };
}
function toHHmm(h: number, m: number): string {
  return `${String(Math.min(23, Math.max(0, h))).padStart(2, '0')}:${String(Math.min(59, Math.max(0, m))).padStart(2, '0')}`;
}

@Component({
  selector: 'app-schedule-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './schedule-form.dialog.html',
  styleUrl: './schedule-form.dialog.scss',
})
export class ScheduleFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ScheduleFormDialogComponent>);
  readonly data: ScheduleFormDialogData = inject(MAT_DIALOG_DATA, { optional: true }) ?? {
    outletId: 0,
    entry: null,
  };

  readonly scheduleTypeOptions = SCHEDULE_TYPE_OPTIONS;
  readonly dayOfWeekOptions = DAY_OF_WEEK_OPTIONS;
  readonly hourOptions = HOUR_OPTIONS;
  readonly minuteOptions = MINUTE_OPTIONS;
  readonly isEdit = !!this.data.entry;

  form: FormGroup = this.fb.group({
    scheduleType: [this.data.entry?.scheduleType ?? 'NORMAL', Validators.required],
    dayOfWeek: [this.data.entry?.dayOfWeek ?? null],
    /** NORMAL add: multiple days; NORMAL edit: single day in array. */
    daysOfWeek: [this.data.entry?.dayOfWeek ? [this.data.entry.dayOfWeek] : []],
    date: [this.data.entry?.date ? new Date(this.data.entry.date) : null],
    startDate: [this.data.entry?.startDate ? new Date(this.data.entry.startDate) : null],
    endDate: [this.data.entry?.endDate ? new Date(this.data.entry.endDate) : null],
    openTime: [
      this.data.entry?.openTime ?? '09:00',
      [Validators.required, Validators.pattern(TIME_PATTERN)],
    ],
    closeTime: [
      this.data.entry?.closeTime ?? '18:00',
      [Validators.required, Validators.pattern(TIME_PATTERN)],
    ],
    isClosed: [this.data.entry?.isClosed ?? false],
    reason: [this.data.entry?.reason ?? null],
  });

  get scheduleType(): ScheduleType {
    return this.form.get('scheduleType')?.value ?? 'NORMAL';
  }

  get showDayOfWeek(): boolean {
    return this.scheduleType === 'NORMAL';
  }

  get showSingleDate(): boolean {
    return this.scheduleType === 'EMERGENCY' || this.scheduleType === 'DAILY';
  }

  get showDateRange(): boolean {
    return this.scheduleType === 'TEMPORARY';
  }

  get showReason(): boolean {
    return ['EMERGENCY', 'DAILY', 'TEMPORARY'].includes(this.scheduleType);
  }

  get openHour(): number {
    return parseTimeHHmm(this.form.get('openTime')?.value).h;
  }
  get openMinute(): number {
    return parseTimeHHmm(this.form.get('openTime')?.value).m;
  }
  get closeHour(): number {
    return parseTimeHHmm(this.form.get('closeTime')?.value).h;
  }
  get closeMinute(): number {
    return parseTimeHHmm(this.form.get('closeTime')?.value).m;
  }

  setOpenTime(h: number, m: number): void {
    this.form.get('openTime')?.setValue(toHHmm(h, m));
  }
  setCloseTime(h: number, m: number): void {
    this.form.get('closeTime')?.setValue(toHHmm(h, m));
  }

  ngOnInit(): void {
    this.onScheduleTypeChange();
  }

  onScheduleTypeChange(clearConditionalValues = false): void {
    const type = this.form.get('scheduleType')?.value;
    if (clearConditionalValues) {
      this.form.patchValue({
        dayOfWeek: null,
        daysOfWeek: [],
        date: null,
        startDate: null,
        endDate: null,
      });
    }
    const dayOfWeek = this.form.get('dayOfWeek');
    const daysOfWeek = this.form.get('daysOfWeek');
    const date = this.form.get('date');
    const startDate = this.form.get('startDate');
    const endDate = this.form.get('endDate');
    dayOfWeek?.clearValidators();
    daysOfWeek?.clearValidators();
    date?.clearValidators();
    startDate?.clearValidators();
    endDate?.clearValidators();
    if (type === 'NORMAL') {
      if (this.isEdit) {
        dayOfWeek?.setValidators(Validators.required);
      } else {
        daysOfWeek?.setValidators([Validators.required, (c) => (Array.isArray(c.value) && c.value.length > 0 ? null : { required: true })]);
      }
    }
    if (type === 'EMERGENCY' || type === 'DAILY') date?.setValidators(Validators.required);
    if (type === 'TEMPORARY') {
      startDate?.setValidators(Validators.required);
      endDate?.setValidators(Validators.required);
    }
    dayOfWeek?.updateValueAndValidity();
    daysOfWeek?.updateValueAndValidity();
    date?.updateValueAndValidity();
    startDate?.updateValueAndValidity();
    endDate?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.value;
    const baseEntry: Omit<OutletScheduleEntry, 'dayOfWeek'> = {
      id: this.data.entry?.id,
      outletId: this.data.outletId,
      scheduleType: v.scheduleType,
      date: this.showSingleDate && v.date ? this.toISODate(v.date) : null,
      startDate: this.showDateRange && v.startDate ? this.toISODate(v.startDate) : null,
      endDate: this.showDateRange && v.endDate ? this.toISODate(v.endDate) : null,
      openTime: v.openTime,
      closeTime: v.closeTime,
      isClosed: !!v.isClosed,
      reason: this.showReason ? (v.reason || null) : null,
    };
    if (this.showDayOfWeek && this.scheduleType === 'NORMAL') {
      if (this.isEdit) {
        const entry: OutletScheduleEntry = { ...baseEntry, dayOfWeek: v.dayOfWeek ?? null };
        this.dialogRef.close(entry);
      } else {
        const days = (v.daysOfWeek ?? []) as DayOfWeek[];
        if (days.length === 0) return;
        const entries: OutletScheduleEntry[] = days.map((day) => ({ ...baseEntry, dayOfWeek: day }));
        this.dialogRef.close({ multiple: true, entries });
      }
    } else {
      const entry: OutletScheduleEntry = { ...baseEntry, dayOfWeek: null };
      this.dialogRef.close(entry);
    }
  }

  private toISODate(d: Date): string {
    return d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);
  }
}
