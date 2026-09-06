import { api } from './api';

export interface GovernmentProfile {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  officialDesignation: string;
  department: string;
  jurisdictionLevel: 'DISTRICT' | 'STATE' | 'NATIONAL';
  district?: string;
  state: string;
  officeAddress?: string;
  clearanceLevel?: string;
}

export const governmentService = {
  getProfile: async (): Promise<{ official: GovernmentProfile }> => {
    const res = await api.get('/government/profile');
    return res.data;
  },

  getDistrictOverview: async (): Promise<any> => {
    const res = await api.get('/government/overview');
    return res.data;
  },

  getCareLeakageFunnel: async (): Promise<any> => {
    const res = await api.get('/government/leakage-funnel');
    return res.data;
  },

  getFrictionHeatmap: async (): Promise<any> => {
    const res = await api.get('/government/friction-heatmap');
    return res.data;
  },

  getPopulationBarriers: async (): Promise<any> => {
    const res = await api.get('/government/barriers');
    return res.data;
  },

  triggerResourceAllocation: async (data: {
    blockName: string;
    interventionType: string;
    targetAllocation?: string;
    justification?: string;
  }): Promise<any> => {
    const res = await api.post('/government/allocate-resources', data);
    return res.data;
  },
};
