import { createSQLModel } from '../database/sqlModel.js';

export type QueueEntryStatus =
  | 'waiting'
  | 'called'
  | 'in_consultation'
  | 'completed'
  | 'skipped'
  | 'no_show';

export interface IQueueEntry {
  patientId: any;
  patientName?: string;
  appointmentId?: any;
  queueNumber: number;
  tokenNumber?: string;
  status: QueueEntryStatus;
  estimatedWaitMinutes?: number;
  checkedInAt?: string | Date;
  calledAt?: string | Date;
  startedAt?: string | Date;
  completedAt?: string | Date;
  priority?: 'routine' | 'urgent' | 'emergency';
  notes?: string;
}

export interface IQueue {
  _id?: any;
  id?: any;
  hospitalId: any;
  doctorId?: any;
  departmentName?: string;
  date: string; // YYYY-MM-DD
  entries: IQueueEntry[] | any[];
  isActive?: boolean;
  maxCapacity?: number;
  currentNumber?: number;
  averageConsultationMinutes?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const Queue: any = createSQLModel<IQueue>('queues');
