import { createSQLModel } from '../database/sqlModel.js';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export type AppointmentType = 'OPD' | 'Teleconsult' | 'Emergency' | 'Follow_up' | 'Referral';

export interface IAppointment {
  _id?: any;
  id?: any;
  appointmentCode?: string;
  patientId: any;
  doctorId: any;
  hospitalId: any;
  departmentName?: string;
  appointmentDate: string | Date;
  timeSlot: string; // e.g. "09:00-09:30"
  durationMinutes?: number;
  type: AppointmentType;
  status: AppointmentStatus;
  queueNumber?: number;
  estimatedWaitMinutes?: number;
  reasonForVisit?: string;
  symptoms?: string[];
  urgencyLevel?: 'routine' | 'urgent' | 'emergency';
  // For teleconsultation
  meetingLink?: string;
  meetingPin?: string;
  // Notes
  patientNotes?: string;
  doctorNotes?: string;
  hospitalNotes?: string;
  // Follow-up
  followUpRequired?: boolean;
  followUpDate?: string | Date;
  // Referral linkage
  referralId?: any;
  // Status tracking
  confirmedAt?: string | Date;
  checkedInAt?: string | Date;
  completedAt?: string | Date;
  cancelledAt?: string | Date;
  cancellationReason?: string;
  cancelledBy?: 'patient' | 'doctor' | 'hospital' | 'system';
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const Appointment: any = createSQLModel<IAppointment>('appointments');
