import { createSQLModel } from '../database/sqlModel.js';

export type TransportLevel = 'none' | 'low' | 'moderate' | 'high';
export type DigitalAccessLevel = 'none' | 'basic' | 'moderate' | 'advanced';
export type FamilySupportLevel = 'none' | 'low' | 'moderate' | 'high';
export type DocumentationLevel = 'incomplete' | 'partial' | 'complete';
export type FinancialAccessLevel = 'severely_constrained' | 'moderate_budget' | 'adequate' | 'insured';
export type AppointmentFlexibility = 'inflexible_daily_wage' | 'rigid_hours' | 'moderate' | 'flexible';
export type ResidenceType = 'rural_remote' | 'semi_urban' | 'urban_slum' | 'urban_metro';

export interface IPatientLocation {
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  geoJSON?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface IAllergy {
  substance: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface ICurrentMedication {
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy?: string;
  startDate?: string;
}

export interface IPatient {
  _id?: any;
  id?: any;
  userId: any;
  patientCode: string;
  // Personal info
  dateOfBirth?: string | Date;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
  abhaNumber?: string;
  // Contact & accessibility
  preferredLanguage: string;
  preferredDialect?: string;
  simpleLanguageMode?: boolean;
  voiceEnabled?: boolean;
  textToSpeechEnabled?: boolean;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  location: IPatientLocation | any;
  // Health info
  allergies?: IAllergy[] | any[];
  chronicConditions?: string[];
  currentMedications?: ICurrentMedication[] | any[];
  surgicalHistory?: string[];
  familyHistory?: string[];
  // Friction / accessibility factors
  transportAvailability: TransportLevel;
  digitalAccessLevel: DigitalAccessLevel;
  familySupport: FamilySupportLevel;
  documentationStatus: DocumentationLevel;
  financialAccessibility: FinancialAccessLevel;
  appointmentFlexibility: AppointmentFlexibility;
  residenceType: ResidenceType;
  // Care linkage
  preferredHospitalId?: any;
  assignedAshaWorkerId?: any;
  activeFrictionProfileId?: any;
  activeCareRiskId?: any;
  currentJourneyStage?: string;
  // Profile status
  isProfileComplete?: boolean;
  consentGiven?: boolean;
  consentDate?: string | Date;
  // Timestamps
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const Patient: any = createSQLModel<IPatient>('patient_profiles');
