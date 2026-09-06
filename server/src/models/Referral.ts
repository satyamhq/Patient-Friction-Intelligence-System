import { createSQLModel } from '../database/sqlModel.js';

export type ReferralStatus =
  | 'initiated'
  | 'pending_acceptance'
  | 'accepted'
  | 'rejected'
  | 'in_transit'
  | 'arrived'
  | 'consulted'
  | 'completed'
  | 'counter_referred'
  | 'cancelled';

export type ReferralPriority = 'routine' | 'urgent' | 'emergency';

export interface IReferralTimeline {
  status: ReferralStatus;
  timestamp: string | Date;
  facility?: string;
  note: string;
  actor: string;
  actorRole?: string;
}

export interface IReferralFrictionFlags {
  transitAssistance?: boolean;
  escortRequired?: boolean;
  languageBarrier?: string;
  dailyWageVoucher?: boolean;
  mobilityIssues?: boolean;
}

export interface IReferral {
  _id?: any;
  id?: any;
  referralCode: string;
  patientId: any;
  referringDoctorId?: any;
  referringFacilityId?: any;
  receivingFacilityId?: any;
  // Names (denormalized for display)
  patientName: string;
  referringDoctorName?: string;
  referringFacilityName: string;
  receivingFacilityName: string;
  receivingDepartment: string;
  // Clinical
  reason: string;
  clinicalSummary?: string;
  priority: ReferralPriority;
  urgencyNotes?: string;
  vitals?: any;
  diagnoses?: any[];
  attachedDocumentIds?: any[];
  // Friction / social flags
  frictionFlags?: IReferralFrictionFlags | any;
  // Tracking
  status: ReferralStatus;
  timeline: IReferralTimeline[] | any[];
  // Linkage
  appointmentId?: any;
  medicalRecordId?: any;
  counterReferralNotes?: string;
  followUpPlan?: string;
  // Status timestamps
  acceptedAt?: string | Date;
  rejectedAt?: string | Date;
  rejectionReason?: string;
  arrivedAt?: string | Date;
  completedAt?: string | Date;
  // ABHA
  abhaNumber?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const Referral: any = createSQLModel<IReferral>('referrals');
