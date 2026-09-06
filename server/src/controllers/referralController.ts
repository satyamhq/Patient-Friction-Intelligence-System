import { Request, Response } from 'express';
import crypto from 'crypto';
import { getDB } from '../database/db.js';

export interface ReferralRecord {
  id: string;
  patientId: string;
  patientName: string;
  abhaNumber: string;
  referringFacility: string;
  referringDoctor: string;
  targetFacility: string;
  targetDepartment: string;
  reason: string;
  priority: 'routine' | 'urgent' | 'emergency';
  status: 'initiated' | 'accepted' | 'in-transit' | 'consulted' | 'completed' | 'counter-referred';
  clinicalSummary: string;
  vitals?: any;
  frictionFlags?: {
    transitAssistance?: boolean;
    escortRequired?: boolean;
    languageBarrier?: string;
    dailyWageVoucher?: boolean;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
    facility: string;
    note: string;
    actor: string;
  }>;
  counterReferralNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory or database referral store
const referralsStore: Map<string, ReferralRecord> = new Map();

// Initialize realistic seeded demo referrals
const seedInitialReferrals = () => {
  if (referralsStore.size > 0) return;

  const demoRef: ReferralRecord = {
    id: 'ref-demo-101',
    patientId: 'pat-sunita-devi',
    patientName: 'Sunita Devi',
    abhaNumber: '91-4829-1029-4821',
    referringFacility: 'Angara Primary Health Centre',
    referringDoctor: 'Dr. Alok Verma (MO, Angara PHC)',
    targetFacility: 'Ranchi District Hospital',
    targetDepartment: 'Obstetrics & High-Risk Pregnancy Clinic',
    reason: '32 Weeks Gestation with Persistent Hypertension (150/98) & Pedal Edema',
    priority: 'urgent',
    status: 'initiated',
    clinicalSummary: 'G3P2 with 32 weeks gestation. Mild proteinuria, pedal edema ++. Requires ultrasound Doppler and obstetric specialist staging.',
    vitals: { systolicBP: 150, diastolicBP: 98, fetalHeartRate: 142, hb: 9.4 },
    frictionFlags: {
      transitAssistance: true,
      escortRequired: true,
      languageBarrier: 'Santali / Rural Hindi',
      dailyWageVoucher: true,
    },
    timeline: [
      {
        status: 'initiated',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        facility: 'Angara Primary Health Centre',
        note: 'Referral packet created. Non-clinical transport assistance flag raised.',
        actor: 'Dr. Alok Verma',
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  };

  referralsStore.set(demoRef.id, demoRef);
};

seedInitialReferrals();

export const createReferral = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      patientName,
      abhaNumber,
      referringFacility,
      referringDoctor,
      targetFacility,
      targetDepartment,
      reason,
      priority = 'routine',
      clinicalSummary,
      vitals,
      frictionFlags,
    } = req.body;

    if (!patientName || !targetFacility || !reason) {
      res.status(400).json({ success: false, message: 'Missing required referral fields (patientName, targetFacility, reason).' });
      return;
    }

    const id = 'ref-' + crypto.randomBytes(4).toString('hex');
    const now = new Date().toISOString();

    const newReferral: ReferralRecord = {
      id,
      patientId: patientId || 'pat-' + crypto.randomBytes(3).toString('hex'),
      patientName,
      abhaNumber: abhaNumber || '91-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
      referringFacility: referringFacility || 'Angara Primary Health Centre',
      referringDoctor: referringDoctor || (req as any).user?.name || 'Medical Officer',
      targetFacility,
      targetDepartment: targetDepartment || 'General Medicine & Specialist OPD',
      reason,
      priority,
      status: 'initiated',
      clinicalSummary: clinicalSummary || reason,
      vitals: vitals || {},
      frictionFlags: frictionFlags || { transitAssistance: false, escortRequired: false },
      timeline: [
        {
          status: 'initiated',
          timestamp: now,
          facility: referringFacility || 'Referring PHC',
          note: `Referral initiated for ${targetDepartment}. Priority: ${priority.toUpperCase()}.`,
          actor: referringDoctor || 'Medical Officer',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    referralsStore.set(id, newReferral);

    res.status(201).json({
      success: true,
      message: 'Stateful cross-facility referral initiated successfully.',
      referral: newReferral,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReferrals = async (req: Request, res: Response): Promise<void> => {
  try {
    seedInitialReferrals();
    const { patientId, targetFacility, status, abhaNumber } = req.query;

    let list = Array.from(referralsStore.values());

    if (patientId) {
      list = list.filter((r) => r.patientId === patientId);
    }
    if (abhaNumber) {
      list = list.filter((r) => r.abhaNumber.includes(abhaNumber as string));
    }
    if (targetFacility) {
      list = list.filter((r) => r.targetFacility.toLowerCase().includes((targetFacility as string).toLowerCase()));
    }
    if (status) {
      list = list.filter((r) => r.status === status);
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      count: list.length,
      referrals: list,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReferralById = async (req: Request, res: Response): Promise<void> => {
  try {
    seedInitialReferrals();
    const id = String(req.params.id);
    const referral = referralsStore.get(id);

    if (!referral) {
      res.status(404).json({ success: false, message: 'Referral record not found.' });
      return;
    }

    res.json({
      success: true,
      referral,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReferralStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    seedInitialReferrals();
    const id = String(req.params.id);
    const { status, note, facility, actor } = req.body;

    const referral = referralsStore.get(id);
    if (!referral) {
      res.status(404).json({ success: false, message: 'Referral record not found.' });
      return;
    }

    const validStatuses = ['initiated', 'accepted', 'in-transit', 'consulted', 'completed', 'counter-referred'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    referral.status = status;
    referral.updatedAt = new Date().toISOString();
    referral.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      facility: facility || referral.targetFacility,
      note: note || `Referral state updated to ${status}.`,
      actor: actor || (req as any).user?.name || 'Facility Coordinator',
    });

    referralsStore.set(id, referral);

    res.json({
      success: true,
      message: `Referral state transitioned to ${status}.`,
      referral,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const counterReferPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { instructions, medicationsPrescribed, followUpSchedule } = req.body;

    const referral = referralsStore.get(id);
    if (!referral) {
      res.status(404).json({ success: false, message: 'Referral record not found.' });
      return;
    }

    referral.status = 'counter-referred';
    referral.counterReferralNotes = instructions;
    referral.updatedAt = new Date().toISOString();
    referral.timeline.push({
      status: 'counter-referred',
      timestamp: new Date().toISOString(),
      facility: referral.targetFacility,
      note: `Specialist consultation complete. Counter-referred back to ${referral.referringFacility} with local follow-up protocol.`,
      actor: (req as any).user?.name || 'Receiving Specialist',
    });

    referralsStore.set(id, referral);

    res.json({
      success: true,
      message: 'Patient counter-referred back to primary care with complete follow-up protocol.',
      referral,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
