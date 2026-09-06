import { Request, Response } from 'express';
import crypto from 'crypto';
import { Referral, IReferral } from '../models/Referral.js';

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
  status: string;
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

    const code = 'REF-' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const now = new Date().toISOString();

    const referralData = {
      referralCode: code,
      patientId: patientId || 'pat-' + crypto.randomBytes(3).toString('hex'),
      patientName,
      abhaNumber: abhaNumber || '91-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
      referringFacilityName: referringFacility || 'Referring Health Centre',
      referringDoctorName: referringDoctor || (req as any).user?.name || 'Medical Officer',
      receivingFacilityName: targetFacility,
      receivingDepartment: targetDepartment || 'General Medicine & Specialist OPD',
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
          facility: referringFacility || 'Referring Health Centre',
          note: `Referral initiated for ${targetDepartment || 'Specialist OPD'}. Priority: ${priority.toUpperCase()}.`,
          actor: referringDoctor || (req as any).user?.name || 'Medical Officer',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const newReferral = await Referral.create(referralData);

    // Normalize representation for client compatibility
    const normalized = {
      ...newReferral,
      id: newReferral.id || newReferral._id,
      referringFacility: newReferral.referringFacilityName,
      referringDoctor: newReferral.referringDoctorName,
      targetFacility: newReferral.receivingFacilityName,
      targetDepartment: newReferral.receivingDepartment,
    };

    res.status(201).json({
      success: true,
      message: 'Stateful cross-facility referral initiated successfully.',
      referral: normalized,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReferrals = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, targetFacility, status, abhaNumber } = req.query;

    let filter: any = {};
    if (patientId) filter.patientId = patientId;
    if (status) filter.status = status;

    let records: any[] = await Referral.find(filter).sort({ createdAt: -1 });

    if (abhaNumber) {
      records = records.filter((r) => r.abhaNumber && r.abhaNumber.includes(abhaNumber as string));
    }
    if (targetFacility) {
      records = records.filter((r) =>
        (r.receivingFacilityName || r.targetFacility || '')
          .toLowerCase()
          .includes((targetFacility as string).toLowerCase())
      );
    }

    const normalized = records.map((r) => ({
      ...r,
      id: r.id || r._id,
      referringFacility: r.referringFacilityName || r.referringFacility,
      referringDoctor: r.referringDoctorName || r.referringDoctor,
      targetFacility: r.receivingFacilityName || r.targetFacility,
      targetDepartment: r.receivingDepartment || r.targetDepartment,
    }));

    res.json({
      success: true,
      count: normalized.length,
      referrals: normalized,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReferralById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const referral = await Referral.findOne({ $or: [{ id }, { _id: id }, { referralCode: id }] });

    if (!referral) {
      res.status(404).json({ success: false, message: 'Referral record not found.' });
      return;
    }

    const normalized = {
      ...referral,
      id: referral.id || referral._id,
      referringFacility: referral.referringFacilityName || referral.referringFacility,
      referringDoctor: referral.referringDoctorName || referral.referringDoctor,
      targetFacility: referral.receivingFacilityName || referral.targetFacility,
      targetDepartment: referral.receivingDepartment || referral.targetDepartment,
    };

    res.json({
      success: true,
      referral: normalized,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReferralStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status, note, facility, actor } = req.body;

    const referral = await Referral.findOne({ $or: [{ id }, { _id: id }, { referralCode: id }] });
    if (!referral) {
      res.status(404).json({ success: false, message: 'Referral record not found.' });
      return;
    }

    const validStatuses = ['initiated', 'accepted', 'in-transit', 'in_transit', 'consulted', 'completed', 'counter-referred', 'counter_referred', 'rejected'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: `Invalid status: ${status}` });
      return;
    }

    const now = new Date().toISOString();
    const updatedTimeline = Array.isArray(referral.timeline) ? [...referral.timeline] : [];
    updatedTimeline.push({
      status,
      timestamp: now,
      facility: facility || referral.receivingFacilityName || referral.targetFacility || 'Target Facility',
      note: note || `Referral state updated to ${status}.`,
      actor: actor || (req as any).user?.name || 'Facility Coordinator',
    });

    const updated = await Referral.findByIdAndUpdate(
      referral.id || referral._id,
      {
        status,
        timeline: updatedTimeline,
        updatedAt: now,
      },
      { new: true }
    );

    const normalized = {
      ...(updated || referral),
      id: referral.id || referral._id,
      status,
      timeline: updatedTimeline,
      referringFacility: referral.referringFacilityName || referral.referringFacility,
      referringDoctor: referral.referringDoctorName || referral.referringDoctor,
      targetFacility: referral.receivingFacilityName || referral.targetFacility,
      targetDepartment: referral.receivingDepartment || referral.targetDepartment,
    };

    res.json({
      success: true,
      message: `Referral state transitioned to ${status}.`,
      referral: normalized,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const counterReferPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { instructions, medicationsPrescribed, followUpSchedule } = req.body;

    const referral = await Referral.findOne({ $or: [{ id }, { _id: id }, { referralCode: id }] });
    if (!referral) {
      res.status(404).json({ success: false, message: 'Referral record not found.' });
      return;
    }

    const now = new Date().toISOString();
    const updatedTimeline = Array.isArray(referral.timeline) ? [...referral.timeline] : [];
    updatedTimeline.push({
      status: 'counter-referred',
      timestamp: now,
      facility: referral.receivingFacilityName || referral.targetFacility,
      note: `Specialist consultation complete. Counter-referred with local follow-up protocol.`,
      actor: (req as any).user?.name || 'Receiving Specialist',
    });

    const updated = await Referral.findByIdAndUpdate(
      referral.id || referral._id,
      {
        status: 'counter-referred',
        counterReferralNotes: instructions,
        timeline: updatedTimeline,
        updatedAt: now,
      },
      { new: true }
    );

    const normalized = {
      ...(updated || referral),
      id: referral.id || referral._id,
      status: 'counter-referred',
      counterReferralNotes: instructions,
      timeline: updatedTimeline,
      referringFacility: referral.referringFacilityName || referral.referringFacility,
      referringDoctor: referral.referringDoctorName || referral.referringDoctor,
      targetFacility: referral.receivingFacilityName || referral.targetFacility,
      targetDepartment: referral.receivingDepartment || referral.targetDepartment,
    };

    res.json({
      success: true,
      message: 'Patient counter-referred back to primary care with complete follow-up protocol.',
      referral: normalized,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
