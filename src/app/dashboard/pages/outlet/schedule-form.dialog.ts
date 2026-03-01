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
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import {
  OutletScheduleEntry,
  ScheduleType,
  SCHEDULE_TYPE_OPTIONS,
  DAY_OF_WEEK_OPTIONS,
} from './outlet-schedule.model';

export interface ScheduleFormDialogData {
  outletId: number;
  entry?: OutletScheduleEntry | null;
}

/** Time regex HH:mm (00:00 - 23:59). */
const TIME_PATTERN = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

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
  readonly isEdit = !!this.data.entry;

  form: FormGroup = this.fb.group({
    scheduleType: [this.data.entry?.scheduleType ?? 'NORMAL', Validators.required],
    dayOfWeek: [this.data.entry?.dayOfWeek ?? null],
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

  ngOnInit(): void {
    this.onScheduleTypeChange();
  }

  onScheduleTypeChange(clearConditionalValues = false): void {
    const type = this.form.get('scheduleType')?.value;
    if (clearConditionalValues) {
      this.form.patchValue({
        dayOfWeek: null,
        date: null,
        startDate: null,
        endDate: null,
      });
    }
    const dayOfWeek = this.form.get('dayOfWeek');
    const date = this.form.get('date');
    const startDate = this.form.get('startDate');
    const endDate = this.form.get('endDate');
    dayOfWeek?.clearValidators();
    date?.clearValidators();
    startDate?.clearValidators();
    endDate?.clearValidators();
    if (type === 'NORMAL') dayOfWeek?.setValidators(Validators.required);
    if (type === 'EMERGENCY' || type === 'DAILY') date?.setValidators(Validators.required);
    if (type === 'TEMPORARY') {
      startDate?.setValidators(Validators.required);
      endDate?.setValidators(Validators.required);
    }
    dayOfWeek?.updateValueAndValidity();
    date?.updateValueAndValidity();
    startDate?.updateValueAndValidity();
    endDate?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.value;
    const entry: OutletScheduleEntry = {
      id: this.data.entry?.id,
      outletId: this.data.outletId,
      scheduleType: v.scheduleType,
      dayOfWeek: this.showDayOfWeek ? v.dayOfWeek : null,
      date: this.showSingleDate && v.date ? this.toISODate(v.date) : null,
      startDate: this.showDateRange && v.startDate ? this.toISODate(v.startDate) : null,
      endDate: this.showDateRange && v.endDate ? this.toISODate(v.endDate) : null,
      openTime: v.openTime,
      closeTime: v.closeTime,
      isClosed: !!v.isClosed,
      reason: this.showReason ? (v.reason || null) : null,
    };
    this.dialogRef.close(entry);
  }

  private toISODate(d: Date): string {
    return d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);
  }
}
