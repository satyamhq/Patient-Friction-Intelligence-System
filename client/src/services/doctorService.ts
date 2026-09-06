import { api } from './api';

export interface DoctorProfile {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  hospitalName?: string;
  department: string;
  qualification: string;
  registrationNumber: string;
  specialization: string;
  experienceYears: number;
  opdTimings?: string;
  isAvailable?: boolean;
  rating?: number;
  totalPatientsConsulted?: number;
}

export interface ConsultationQueueItem {
  id: string;
  patientCode: string;
  name: string;
  age: number;
  gender: string;
  abhaId: string;
  residenceType: string;
  phone: string;
  frictionScore: number;
  frictionLevel: string;
  careCompletionRisk: string;
  topBarriers: string[];
  status: string;
  triageCategory: string;
}

export const doctorService = {
  getProfile: async (): Promise<{ doctor: DoctorProfile }> => {
    const res = await api.get('/doctor/profile');
    return res.data;
  },

  updateProfile: async (data: Partial<DoctorProfile>): Promise<{ doctor: DoctorProfile }> => {
    const res = await api.put('/doctor/profile', data);
    return res.data;
  },

  getQueue: async (): Promise<{ queue: ConsultationQueueItem[]; count: number }> => {
    const res = await api.get('/doctor/queue');
    return res.data;
  },

  getPatientDetail: async (id: string): Promise<any> => {
    const res = await api.get(`/doctor/patient/${id}`);
    return res.data;
  },

  recordConsultation: async (data: {
    patientId: string;
    clinicalNotes: string;
    diagnosis: string;
    prescriptions?: any[];
    labOrders?: string[];
    referralRequired?: boolean;
    recallDays?: number;
  }): Promise<any> => {
    const res = await api.post('/doctor/consultation', data);
    return res.data;
  },

  getStats: async (): Promise<any> => {
    const res = await api.get('/doctor/stats');
    return res.data;
  },
};
