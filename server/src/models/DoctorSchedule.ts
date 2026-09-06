import { createSQLModel } from '../database/sqlModel.js';

export interface ITimeSlot {
  startTime: string; // HH:MM (24h)
  endTime: string;   // HH:MM (24h)
  maxPatients: number;
  slotDurationMinutes: number;
  isActive?: boolean;
}

export interface IWeeklySchedule {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday, 6=Saturday
  isWorking: boolean;
  slots: ITimeSlot[];
}

export interface IScheduleException {
  date: string; // YYYY-MM-DD
  isHoliday: boolean;
  reason?: string;
  customSlots?: ITimeSlot[];
}

export interface IDoctorSchedule {
  _id?: any;
  id?: any;
  doctorId: any;
  hospitalId: any;
  departmentName?: string;
  weeklySchedule: IWeeklySchedule[] | any[];
  exceptions?: IScheduleException[] | any[];
  defaultSlotDurationMinutes?: number;
  maxPatientsPerDay?: number;
  advanceBookingDays?: number; // How far in advance patients can book
  isActive?: boolean;
  effectiveFrom?: string | Date;
  effectiveTo?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const DoctorSchedule: any = createSQLModel<IDoctorSchedule>('doctor_schedules');
