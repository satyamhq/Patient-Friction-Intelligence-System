import Dexie, { Table } from 'dexie';

export interface LocalPatient {
  id: string;
  name: string;
  gender: string;
  age: number;
  phone: string;
  village: string;
  abhaNumber?: string;
  abhaAddress?: string;
  synced: boolean;
  createdAt: string;
}

export interface LocalTriageAssessment {
  id: string;
  patientName: string;
  urgency: 'EMERGENCY_108' | 'PHC_VISIT' | 'TELECONSULT' | 'SELF_CARE';
  chiefComplaint: string;
  recommendation: string;
  facilityLevel: string;
  synced: boolean;
  createdAt: string;
}

export interface LocalRevisitTask {
  id: string;
  patientName: string;
  protocolType: string;
  missedMilestone: string;
  daysOverdue: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED_REBOOKED' | 'UNRESOLVED_ESCALATED';
  resolutionNotes?: string;
  synced: boolean;
  createdAt: string;
}

export interface SyncQueueItem {
  id: string;
  type: 'PATIENT_REGISTRATION' | 'TRIAGE_ASSESSMENT' | 'REVISIT_COMPLETION' | 'REFERRAL_INITIATION';
  timestamp: string;
  payload: any;
  status: 'QUEUED' | 'SYNCING' | 'SYNCED' | 'FAILED';
  retryCount: number;
}

export class PfisOfflineDatabase extends Dexie {
  patients!: Table<LocalPatient, string>;
  triageAssessments!: Table<LocalTriageAssessment, string>;
  revisitTasks!: Table<LocalRevisitTask, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super('PfisOfflineDB');
    this.version(1).stores({
      patients: 'id, name, phone, synced, createdAt',
      triageAssessments: 'id, patientName, urgency, synced, createdAt',
      revisitTasks: 'id, patientName, severity, status, synced',
      syncQueue: 'id, type, status, timestamp',
    });
  }
}

export const offlineDb = new PfisOfflineDatabase();
