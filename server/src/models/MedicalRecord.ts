import { createSQLModel } from '../database/sqlModel.js';

export interface IVitalSigns {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRateBpm?: number;
  temperatureCelsius?: number;
  spo2Percent?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  bloodGlucoseMgdl?: number;
  respiratoryRatePerMin?: number;
}

export interface IPrescriptionItem {
  medicineName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
  substitutionAllowed?: boolean;
}

export interface ILabOrder {
  testName: string;
  testCode?: string;
  urgency?: 'routine' | 'urgent';
  instructions?: string;
  status?: 'ordered' | 'sample_collected' | 'in_progress' | 'resulted' | 'reviewed';
  resultSummary?: string;
  resultFileId?: string;
  orderedAt?: string | Date;
  resultedAt?: string | Date;
}

export interface IDiagnosis {
  code?: string; // ICD-10 code
  description: string;
  type: 'primary' | 'secondary' | 'differential';
  notes?: string;
}

export interface IMedicalRecord {
  _id?: any;
  id?: any;
  recordCode?: string;
  patientId: any;
  doctorId: any;
  appointmentId?: any;
  referralId?: any;
  hospitalId?: any;
  // Visit info
  visitDate: string | Date;
  visitType: 'OPD' | 'Emergency' | 'Teleconsult' | 'Follow_up' | 'IPD' | 'Referral_consultation';
  chiefComplaint: string;
  // Clinical data
  historyOfPresentIllness?: string;
  pastMedicalHistory?: string;
  vitalSigns?: IVitalSigns | any;
  clinicalFindings?: string;
  // Diagnosis & treatment
  diagnoses?: IDiagnosis[] | any[];
  treatmentPlan?: string;
  prescriptions?: IPrescriptionItem[] | any[];
  labOrders?: ILabOrder[] | any[];
  imagingOrders?: any[];
  proceduresPerformed?: string[];
  // Follow-up
  followUpDate?: string | Date;
  followUpInstructions?: string;
  followUpRequired?: boolean;
  referralRequired?: boolean;
  referralReason?: string;
  // Discharge (for IPD)
  dischargeDate?: string | Date;
  dischargeSummary?: string;
  dischargeInstructions?: string;
  // Document attachments
  attachedDocumentIds?: any[];
  // Audit
  isEdited?: boolean;
  editHistory?: Array<{ editedAt: string | Date; editedBy: string; reason: string }>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const MedicalRecord: any = createSQLModel<IMedicalRecord>('medical_records');
