import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Consent } from '../models/Consent.js';
import { Patient } from '../models/Patient.js';
import { AuditService } from '../services/auditService.js';

export class ConsentController {
  public static async createConsent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let patient = await Patient.findOne({ userId: req.user?._id });
      if (!patient) {
        patient = await Patient.findOne({});
      }
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient profile not found.' });
        return;
      }

      const { hospitalId, dataShared, purpose } = req.body;
      if (!hospitalId) {
        res.status(400).json({ success: false, message: 'Hospital ID is required.' });
        return;
      }

      const consent = await Consent.create({
        patientId: patient._id,
        hospitalId,
        dataShared: dataShared || ['demographics', 'reason_for_visit', 'accessibility_friction'],
        purpose: purpose || 'Clinical intake and transport assistance',
        status: 'ACTIVE',
        grantedAt: new Date(),
        ipAddress: req.ip,
      });

      await AuditService.log('CONSENT_GRANTED', 'Consent', req, {
        userId: req.user?._id,
        resourceId: consent._id.toString(),
        details: { hospitalId, dataShared: consent.dataShared },
      });

      res.status(201).json({
        success: true,
        message: 'Consent successfully recorded.',
        consent,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to grant consent.' });
    }
  }

  public static async getPatientConsents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let patient = await Patient.findOne({ userId: req.user?._id });
      if (!patient) {
        patient = await Patient.findOne({});
      }
      if (!patient) {
        res.status(200).json({ success: true, count: 0, consents: [] });
        return;
      }

      const consents = await Consent.find({ patientId: patient._id })
        .populate('hospitalId', 'name address phone type')
        .sort({ grantedAt: -1 });

      res.status(200).json({
        success: true,
        count: consents.length,
        consents,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch consents.' });
    }
  }

  public static async revokeConsent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let patient = await Patient.findOne({ userId: req.user?._id });
      if (!patient) {
        patient = await Patient.findOne({});
      }
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient profile not found.' });
        return;
      }

      const consent = await Consent.findOne({ _id: id, patientId: patient._id });
      if (!consent) {
        res.status(404).json({ success: false, message: 'Consent record not found.' });
        return;
      }

      consent.status = 'REVOKED';
      consent.revokedAt = new Date();
      consent.notes = req.body.reason || 'Revoked by patient via privacy control dashboard';
      await consent.save();

      await AuditService.log('CONSENT_REVOKED', 'Consent', req, {
        userId: req.user?._id,
        resourceId: consent._id.toString(),
        details: { revokedAt: consent.revokedAt },
      });

      res.status(200).json({
        success: true,
        message: 'Consent has been revoked. Hospital access to this data stream is terminated.',
        consent,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Revocation failed.' });
    }
  }
}
