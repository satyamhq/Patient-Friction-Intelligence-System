import { Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { MedicalRecord, IMedicalRecord } from '../models/MedicalRecord.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { AuditService } from '../services/auditService.js';

export class MedicalRecordController {
  /**
   * Create a new consultation medical record
   */
  public static async createRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const {
        patientId,
        appointmentId,
        referralId,
        hospitalId,
        visitDate,
        visitType = 'OPD',
        chiefComplaint,
        historyOfPresentIllness,
        pastMedicalHistory,
        vitalSigns,
        clinicalFindings,
        diagnoses = [],
        treatmentPlan,
        prescriptions = [],
        labOrders = [],
        followUpDate,
        followUpInstructions,
        followUpRequired,
      } = req.body;

      let finalPatientId = patientId;
      if (!finalPatientId) {
        const patient = await Patient.findOne({ userId });
        finalPatientId = patient ? (patient.id || patient._id) : userId;
      }

      const finalComplaint = chiefComplaint || req.body.diagnosis || req.body.recordType || 'Consultation / Medical Record';

      if (!finalPatientId) {
        res.status(400).json({ success: false, message: 'patientId is required.' });
        return;
      }

      // Find doctor profile if logged in as doctor
      let doctorId = userId;
      let doctorName = req.user?.name || 'Treating Physician';
      const doc = await Doctor.findOne({ userId });
      if (doc) {
        doctorId = doc.id || doc._id;
        doctorName = doc.name;
      }

      const code = 'REC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
      const now = new Date().toISOString();

      const record = await MedicalRecord.create({
        recordCode: code,
        patientId: finalPatientId,
        doctorId,
        appointmentId: appointmentId || null,
        referralId: referralId || null,
        hospitalId: hospitalId || null,
        doctorName,
        visitDate: visitDate || now,
        visitType,
        chiefComplaint: finalComplaint,
        historyOfPresentIllness,
        pastMedicalHistory,
        vitalSigns: vitalSigns || {},
        clinicalFindings,
        diagnoses: Array.isArray(diagnoses) ? diagnoses : [],
        treatmentPlan,
        prescriptions: Array.isArray(prescriptions) ? prescriptions : [],
        labOrders: Array.isArray(labOrders) ? labOrders : [],
        followUpDate: followUpDate || null,
        followUpInstructions,
        followUpRequired: !!followUpRequired,
        createdAt: now,
        updatedAt: now,
      });

      // Update patient's last visit & chronic conditions if any new diagnosed
      try {
        const patient = await Patient.findOne({ $or: [{ id: patientId }, { _id: patientId }] });
        if (patient) {
          const updates: any = { lastVisitDate: now };
          if (prescriptions && prescriptions.length > 0) {
            const currentMeds = patient.currentMedications || [];
            const newMedNames = prescriptions.map((p: any) => p.medicineName);
            updates.currentMedications = Array.from(new Set([...currentMeds, ...newMedNames]));
          }
          await Patient.findByIdAndUpdate(patient.id || patient._id, updates);
        }
      } catch (e: any) {
        console.warn('[MedicalRecord] Patient profile sync skipped:', e.message);
      }

      await AuditService.log('MEDICAL_RECORD_CREATED', 'MedicalRecord', req, {
        userId,
        actorRole: req.user?.role || 'doctor',
        details: { recordId: record.id || record._id, patientId, chiefComplaint },
      });

      res.status(201).json({
        success: true,
        message: 'Medical record recorded successfully.',
        record,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create medical record.' });
    }
  }

  /**
   * Get all medical records for a specific patient
   */
  public static async getPatientRecords(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const records: any[] = await MedicalRecord.find({ patientId }).sort({ visitDate: -1, createdAt: -1 });

      // Enrich with doctor details
      const enriched = await Promise.all(
        records.map(async (r) => {
          let doctorName = 'Treating Doctor';
          if (r.doctorId) {
            const doc = await Doctor.findOne({ $or: [{ id: r.doctorId }, { _id: r.doctorId }] });
            if (doc) doctorName = doc.name;
          }
          return {
            ...r,
            id: r.id || r._id,
            doctorName,
          };
        })
      );

      res.status(200).json({
        success: true,
        count: enriched.length,
        records: enriched,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch medical records.' });
    }
  }

  /**
   * Get records for the authenticated patient
   */
  public static async getMyRecords(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const patient = await Patient.findOne({ userId });
      const patientId = patient ? patient.id || patient._id : userId;

      const records: any[] = await MedicalRecord.find({ patientId }).sort({ visitDate: -1, createdAt: -1 });

      const enriched = await Promise.all(
        records.map(async (r) => {
          let doctorName = 'Treating Doctor';
          if (r.doctorId) {
            const doc = await Doctor.findOne({ $or: [{ id: r.doctorId }, { _id: r.doctorId }] });
            if (doc) doctorName = doc.name;
          }
          return {
            ...r,
            id: r.id || r._id,
            doctorName,
          };
        })
      );

      res.status(200).json({
        success: true,
        count: enriched.length,
        records: enriched,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch your medical records.' });
    }
  }

  /**
   * Get a single medical record by ID
   */
  public static async getRecordById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const record = await MedicalRecord.findOne({ $or: [{ id }, { _id: id }, { recordCode: id }] });

      if (!record) {
        res.status(404).json({ success: false, message: 'Medical record not found.' });
        return;
      }

      let doctorName = 'Treating Doctor';
      if (record.doctorId) {
        const doc = await Doctor.findOne({ $or: [{ id: record.doctorId }, { _id: record.doctorId }] });
        if (doc) doctorName = doc.name;
      }

      res.status(200).json({
        success: true,
        record: {
          ...record,
          id: record.id || record._id,
          doctorName,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch medical record.' });
    }
  }
}
