import { createSQLModel } from '../database/sqlModel.js';

export interface IDoctor {
  _id?: string;
  id?: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  hospitalId?: string;
  hospitalName?: string;
  department: string;
  qualification: string;
  registrationNumber: string;
  specialization: string;
  experienceYears: number;
  opdTimings?: string;
  availableDays?: string[];
  consultationFee?: number;
  isAvailable?: boolean;
  rating?: number;
  totalPatientsConsulted?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const Doctor: any = createSQLModel<IDoctor>('doctors');
