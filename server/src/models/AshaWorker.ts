import { createSQLModel } from '../database/sqlModel.js';

export interface IAshaWorker {
  _id?: string;
  id?: string;
  userId: string;
  workerId: string;
  name: string;
  email: string;
  phone: string;
  assignedVillage?: string;
  assignedWard?: string;
  district: string;
  state: string;
  primaryHealthCenter: string;
  communityPopulation?: number;
  assignedPatientsCount?: number;
  activeCases?: number;
  languagesSpoken?: string[];
  isFieldActive?: boolean;
  // New fields
  verificationStatus?: 'pending' | 'verified' | 'rejected' | 'suspended';
  verificationNotes?: string;
  verifiedAt?: string | Date;
  verifiedBy?: string;
  isProfileComplete?: boolean;
  trainingLevel?: 'basic' | 'intermediate' | 'advanced';
  certifications?: string[];
  supervisorName?: string;
  supervisorPhone?: string;
  subCenter?: string;
  blockName?: string;
  dateOfJoining?: string | Date;
  gender?: 'male' | 'female' | 'other';
  profileImageUrl?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const AshaWorker: any = createSQLModel<IAshaWorker>('asha_workers');
