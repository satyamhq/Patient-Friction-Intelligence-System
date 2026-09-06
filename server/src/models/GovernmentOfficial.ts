import { createSQLModel } from '../database/sqlModel.js';

export interface IGovernmentOfficial {
  _id?: string;
  id?: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  officialDesignation: string;
  department: string;
  jurisdictionLevel: 'DISTRICT' | 'STATE' | 'NATIONAL';
  district?: string;
  jurisdictionDistricts?: string[];
  state: string;
  officeAddress?: string;
  clearanceLevel?: string;
  // New fields
  verificationStatus?: 'pending' | 'verified' | 'rejected' | 'suspended';
  verificationNotes?: string;
  verifiedAt?: string | Date;
  verifiedBy?: string;
  isProfileComplete?: boolean;
  employeeId?: string;
  ministryOrDept?: string;
  authorizedReports?: string[];
  profileImageUrl?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const GovernmentOfficial: any = createSQLModel<IGovernmentOfficial>('government_officials');
