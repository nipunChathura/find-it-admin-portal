/** Schedule type matching backend enum. */
export type ScheduleType = 'NORMAL' | 'EMERGENCY' | 'DAILY' | 'TEMPORARY';

/** Day of week for NORMAL (weekly) schedule. */
export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

/** Single schedule entry (row in table / API entity). */
export interface OutletScheduleEntry {
  id?: number;
  outletId: number;
  scheduleType: ScheduleType;
  dayOfWeek?: DayOfWeek | null;
  date?: string | null; // ISO date for EMERGENCY/DAILY
  startDate?: string | null; // ISO for TEMPORARY
  endDate?: string | null; // ISO for TEMPORARY
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
  isClosed: boolean;
  reason?: string | null;
  priority?: number;
  active?: boolean;
}

/** Display row for table (computed day/date label). */
export interface OutletScheduleRow extends OutletScheduleEntry {
  dayOrDateLabel: string;
}

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  NORMAL: 'Weekly Schedule',
  EMERGENCY: 'Emergency / Daily',
  DAILY: 'Emergency / Daily',
  TEMPORARY: 'Temporary Date Range',
};

export const DAY_OF_WEEK_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
];

export const SCHEDULE_TYPE_OPTIONS: { value: ScheduleType; label: string }[] = [
  { value: 'NORMAL', label: 'Weekly (NORMAL)' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'TEMPORARY', label: 'Temporary' },
];
