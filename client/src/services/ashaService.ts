import { api } from './api';

export interface AshaProfile {
  _id?: string;
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
}

export interface AssignedPatient {
  id: string;
  patientCode: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  village: string;
  frictionScore: number;
  riskLevel: string;
  careCompletionRisk: string;
  highRiskBarriers: string[];
  lastContactDate: string;
  nextFollowUpDue: string;
}

export const ashaService = {
  getProfile: async (): Promise<{ worker: AshaProfile }> => {
    const res = await api.get('/asha/profile');
    return res.data;
  },

  updateProfile: async (profileData: Partial<AshaProfile>): Promise<{ worker: AshaProfile }> => {
    const res = await api.put('/asha/profile', profileData);
    return res.data;
  },

  getPatients: async (): Promise<{ patients: AssignedPatient[]; count: number }> => {
    const res = await api.get('/asha/patients');
    return res.data;
  },

  registerPatient: async (patientData: any): Promise<any> => {
    const res = await api.post('/asha/patient', patientData);
    return res.data;
  },

  recordBarriers: async (data: { patientId: string; barriers: any; notes?: string }): Promise<any> => {
    const res = await api.post('/asha/barriers', data);
    return res.data;
  },

  getRecallTasks: async (): Promise<{ tasks: any[]; count: number }> => {
    const res = await api.get('/asha/recalls');
    return res.data;
  },

  completeRecall: async (data: {
    taskId: string;
    outcome: string;
    notes?: string;
    newAppointmentDate?: string;
  }): Promise<any> => {
    const res = await api.post('/asha/recall/complete', data);
    return res.data;
  },
};
