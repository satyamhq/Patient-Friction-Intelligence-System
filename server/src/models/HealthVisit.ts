import { createSQLModel } from '../database/sqlModel.js';

export type VisitType =
  | 'routine_home_visit'
  | 'antenatal_care'
  | 'postnatal_care'
  | 'immunization_follow_up'
  | 'chronic_disease_follow_up'
  | 'newborn_care'
  | 'family_planning'
  | 'nutrition_screening'
  | 'patient_registration'
  | 'referral_followup'
  | 'community_health_activity'
  | 'other';

export type SyncStatus = 'pending' | 'synced' | 'sync_failed';

export interface IHealthVisitFindings {
  chiefComplaint?: string;
  vitalSigns?: {
    weight?: number;
    height?: number;
    bloodPressure?: string;
    temperature?: number;
    spo2?: number;
    fetalHeartRate?: number;
    hemoglobin?: number;
  };
  symptoms?: string[];
  nutritionalStatus?: 'normal' | 'mild_malnutrition' | 'moderate_malnutrition' | 'severe_malnutrition';
  immunizationStatus?: string;
  maternalHealthStatus?: string;
  childHealthStatus?: string;
  notes?: string;
}

export interface IHealthVisit {
  _id?: any;
  id?: any;
  visitCode?: string;
  ashaWorkerId: any;
  patientId: any;
  // Visit info
  visitDate: string | Date;
  visitType: VisitType;
  visitLocation?: string; // Home, PHC, Village health center, etc.
  householdId?: string;
  // Clinical findings
  findings?: IHealthVisitFindings | any;
  // Actions
  actionsPerformed?: string[];
  medicinesProvided?: Array<{ name: string; quantity: string }>;
  educationProvided?: string[];
  // Referral
  referralRequired: boolean;
  referralId?: any;
  referralReason?: string;
  referralUrgency?: 'routine' | 'urgent' | 'emergency';
  // Follow-up
  followUpRequired: boolean;
  nextVisitDate?: string | Date;
  followUpNotes?: string;
  // Offline sync
  syncStatus: SyncStatus;
  syncedAt?: string | Date;
  deviceId?: string;
  offlineCreatedAt?: string | Date;
  // Notes
  generalNotes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const HealthVisit: any = createSQLModel<IHealthVisit>('health_visits');
