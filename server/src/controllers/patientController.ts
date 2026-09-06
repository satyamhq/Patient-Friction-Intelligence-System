import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Patient, IPatient } from '../models/Patient.js';
import { FrictionProfile } from '../models/FrictionProfile.js';
import { CareRisk } from '../models/CareRisk.js';
import { FrictionInteraction } from '../models/FrictionInteraction.js';
import { CareJourney } from '../models/CareJourney.js';
import { HospitalRequest } from '../models/HospitalRequest.js';
import { Hospital } from '../models/Hospital.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { Appointment } from '../models/Appointment.js';
import { FrictionEngine } from '../intelligence/friction/frictionEngine.js';
import { FrictionInteractionEngine } from '../intelligence/causal/frictionInteractionEngine.js';
import { RiskEngine } from '../intelligence/risk/riskEngine.js';
import { AuditService } from '../services/auditService.js';
import crypto from 'crypto';

async function calculateRealFrictionForPatient(patientObj: any) {
  let nearestHosp: any = null;
  let minDistance = 2.7;
  const pLat = patientObj.location?.latitude;
  const pLng = patientObj.location?.longitude;

  if (pLat && pLng) {
    const allHospitals = await Hospital.find({});
    if (allHospitals && allHospitals.length > 0) {
      let lowest = 999999;
      for (const h of allHospitals) {
        const d = FrictionEngine.calculateHaversineDistance(pLat, pLng, h.latitude, h.longitude);
        if (d < lowest) {
          lowest = d;
          nearestHosp = h;
        }
      }
      if (lowest < 999999) {
        minDistance = Math.round(lowest * 10) / 10;
      }
    }
  }

  return FrictionEngine.calculate(patientObj, nearestHosp, minDistance);
}

export class PatientController {
  /**
   * GET /api/patients/me
   * Returns the authenticated patient's profile only.
   * SECURITY: Never falls through to another patient's record.
   */
  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const patient = await Patient.findOne({ userId })
        .populate('preferredHospitalId')
        .populate('activeFrictionProfileId')
        .populate('activeCareRiskId');

      if (!patient) {
        // Profile not yet created — prompt onboarding
        res.status(404).json({
          success: false,
          message: 'Patient profile not found. Please complete your profile setup.',
          needsOnboarding: true,
        });
        return;
      }

      const activeRequests = await HospitalRequest.find({
        patientId: patient._id || patient.id,
        status: { $nin: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
      })
        .populate('hospitalId', 'name address phone emergencyAvailable')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        patient,
        activeRequests,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch patient.' });
    }
  }

  /**
   * POST /api/patients/profile
   * Creates a new patient profile for the authenticated user.
   */
  public static async createProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      // Don't allow duplicate profiles
      const existing = await Patient.findOne({ userId });
      if (existing) {
        res.status(409).json({ success: false, message: 'Patient profile already exists. Use the update endpoint.' });
        return;
      }

      const {
        age, dateOfBirth, gender, bloodGroup, abhaNumber,
        phone, emergencyContactName, emergencyContactPhone, emergencyContactRelation,
        preferredLanguage, preferredDialect, simpleLanguageMode,
        location,
        transportAvailability, digitalAccessLevel, familySupport,
        documentationStatus, financialAccessibility, appointmentFlexibility,
        residenceType, allergies, chronicConditions, currentMedications,
        preferredHospitalId, consentGiven,
      } = req.body;

      if (!age || !gender || !location?.address || !preferredLanguage) {
        res.status(400).json({
          success: false,
          message: 'Age, gender, address, and preferred language are required.',
        });
        return;
      }

      const patientCode = 'PAT-' + crypto.randomBytes(3).toString('hex').toUpperCase();

      const patient = await Patient.create({
        userId,
        patientCode,
        age: Number(age),
        dateOfBirth,
        gender,
        bloodGroup: bloodGroup || 'Unknown',
        abhaNumber,
        preferredLanguage,
        preferredDialect,
        simpleLanguageMode: simpleLanguageMode || false,
        phone,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelation,
        location,
        transportAvailability: transportAvailability || 'moderate',
        digitalAccessLevel: digitalAccessLevel || 'basic',
        familySupport: familySupport || 'moderate',
        documentationStatus: documentationStatus || 'partial',
        financialAccessibility: financialAccessibility || 'moderate_budget',
        appointmentFlexibility: appointmentFlexibility || 'moderate',
        residenceType: residenceType || 'semi_urban',
        allergies: allergies || [],
        chronicConditions: chronicConditions || [],
        currentMedications: currentMedications || [],
        preferredHospitalId,
        isProfileComplete: true,
        consentGiven: consentGiven || false,
        consentDate: consentGiven ? new Date().toISOString() : undefined,
      });

      // Calculate initial friction profile
      try {
        const frictionResult = await calculateRealFrictionForPatient(patient);
        if (frictionResult) {
          const fp = await FrictionProfile.create({
            patientId: patient._id || patient.id,
            ...frictionResult,
          });
          await Patient.updateOne(
            { _id: patient._id || patient.id },
            { activeFrictionProfileId: fp._id || fp.id }
          );
          const riskResult = RiskEngine.evaluate(frictionResult);
          if (riskResult) {
            const cr = await CareRisk.create({
              patientId: patient._id || patient.id,
              ...riskResult,
            });
            await Patient.updateOne(
              { _id: patient._id || patient.id },
              { activeCareRiskId: cr._id || cr.id }
            );
          }
        }
      } catch (fpErr: any) {
        console.warn('[PatientController] Friction calculation failed (non-critical):', fpErr.message);
      }

      await AuditService.log('PATIENT_PROFILE_CREATED', 'Patient', req, {
        userId,
        actorRole: 'patient',
        details: { patientCode, gender, residenceType },
      });

      res.status(201).json({ success: true, message: 'Patient profile created successfully.', patient });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create patient profile.' });
    }
  }

  /**
   * PUT /api/patients/profile
   * Updates the authenticated patient's own profile.
   */
  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const patient = await Patient.findOne({ userId });
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient profile not found. Please create your profile first.' });
        return;
      }

      const allowedUpdates = [
        'age', 'dateOfBirth', 'gender', 'bloodGroup', 'abhaNumber',
        'phone', 'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation',
        'preferredLanguage', 'preferredDialect', 'simpleLanguageMode', 'voiceEnabled', 'textToSpeechEnabled',
        'location', 'transportAvailability', 'digitalAccessLevel', 'familySupport',
        'documentationStatus', 'financialAccessibility', 'appointmentFlexibility', 'residenceType',
        'allergies', 'chronicConditions', 'currentMedications', 'surgicalHistory', 'familyHistory',
        'preferredHospitalId', 'consentGiven',
      ];

      const updates: Record<string, any> = {};
      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }
      updates.updatedAt = new Date().toISOString();

      Object.assign(patient, updates);
      await patient.save();

      // Recalculate friction if location/accessibility changed
      const accessibilityFields = ['location', 'transportAvailability', 'digitalAccessLevel', 'familySupport', 'residenceType'];
      if (accessibilityFields.some((f) => updates[f] !== undefined)) {
        try {
          const frictionResult = await calculateRealFrictionForPatient(patient);
          if (frictionResult && patient.activeFrictionProfileId) {
            await FrictionProfile.updateOne(
              { _id: patient.activeFrictionProfileId },
              { $set: frictionResult }
            );
          }
        } catch (fpErr: any) {
          console.warn('[PatientController] Friction recalculation skipped:', fpErr.message);
        }
      }

      await AuditService.log('PATIENT_PROFILE_UPDATED', 'Patient', req, {
        userId,
        actorRole: 'patient',
        details: { updatedFields: Object.keys(updates) },
      });

      res.status(200).json({ success: true, message: 'Profile updated successfully.', patient });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update profile.' });
    }
  }

  /**
   * GET /api/patients/medical-history
   * Returns the authenticated patient's longitudinal medical records.
   */
  public static async getMedicalHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const patient = await Patient.findOne({ userId });
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient profile not found.' });
        return;
      }

      const patientId = patient._id || patient.id;
      const page = parseInt(String(req.query.page || '1'));
      const limit = Math.min(parseInt(String(req.query.limit || '20')), 50);
      const skip = (page - 1) * limit;

      const records = await MedicalRecord.find({ patientId })
        .sort({ visitDate: -1 })
        .skip(skip)
        .limit(limit);

      const total = await MedicalRecord.countDocuments({ patientId });

      await AuditService.log('PATIENT_MEDICAL_HISTORY_VIEWED', 'MedicalRecord', req, {
        userId,
        actorRole: 'patient',
        details: { patientId },
      });

      res.status(200).json({
        success: true,
        records,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch medical history.' });
    }
  }

  /**
   * GET /api/patients/appointments
   * Returns appointments for the authenticated patient.
   */
  public static async getAppointments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const patient = await Patient.findOne({ userId });
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient profile not found.' });
        return;
      }

      const patientId = patient._id || patient.id;
      const { status, upcoming } = req.query;

      const filter: any = { patientId };
      if (status) filter.status = status;
      if (upcoming === 'true') {
        filter.appointmentDate = { $gte: new Date().toISOString() };
        filter.status = { $in: ['scheduled', 'confirmed', 'checked_in'] };
      }

      const appointments = await Appointment.find(filter)
        .sort({ appointmentDate: upcoming === 'true' ? 1 : -1 })
        .limit(50);

      res.status(200).json({ success: true, appointments, count: appointments.length });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch appointments.' });
    }
  }

  /**
   * GET /api/patients (admin only)
   * Admin endpoint to search patients.
   */
  public static async getAllPatients(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Admin access required.' });
        return;
      }

      const page = parseInt(String(req.query.page || '1'));
      const limit = Math.min(parseInt(String(req.query.limit || '20')), 100);
      const skip = (page - 1) * limit;
      const search = String(req.query.search || '');

      let filter: any = {};
      if (search) {
        filter = {
          $or: [
            { patientCode: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
          ],
        };
      }

      const patients = await Patient.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
      const total = await Patient.countDocuments(filter);

      res.status(200).json({
        success: true,
        patients,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch patients.' });
    }
  }

  // ── Legacy endpoints preserved for compatibility ─────────────────────────

  public static async getFrictionProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const patient = await Patient.findOne({ userId });
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient profile not found.' });
        return;
      }

      const patientId = patient._id || patient.id;
      let frictionProfile = patient.activeFrictionProfileId
        ? await FrictionProfile.findById(patient.activeFrictionProfileId)
        : await FrictionProfile.findOne({ patientId });

      if (!frictionProfile) {
        const result = await calculateRealFrictionForPatient(patient);
        if (result) {
          frictionProfile = await FrictionProfile.create({ patientId, ...result });
          await Patient.updateOne({ _id: patientId }, { activeFrictionProfileId: frictionProfile._id || frictionProfile.id });
        }
      }

      if (!frictionProfile) {
        res.status(404).json({ success: false, message: 'Friction profile not yet calculated.' });
        return;
      }

      await AuditService.log('FRICTION_PROFILE_VIEWED', 'FrictionProfile', req, {
        userId,
        actorRole: 'patient',
        details: { patientId },
      });

      res.status(200).json({ success: true, frictionProfile });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch friction profile.' });
    }
  }

  public static async getCareRisk(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const patient = await Patient.findOne({ userId });
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient profile not found.' });
        return;
      }

      const patientId = patient._id || patient.id;
      const careRisk = await CareRisk.findOne({ patientId });

      if (!careRisk) {
        res.status(404).json({ success: false, message: 'Care risk assessment not yet available.' });
        return;
      }

      res.status(200).json({ success: true, careRisk });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch care risk.' });
    }
  }

  public static async getCareJourneys(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const patient = await Patient.findOne({ userId });
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient profile not found.' });
        return;
      }

      const patientId = patient._id || patient.id;
      const journeys = await CareJourney.find({ patientId }).sort({ createdAt: -1 });

      res.status(200).json({ success: true, journeys });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch care journeys.' });
    }
  }

  public static async getDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const patient = await Patient.findOne({ userId });
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient profile not found.' });
        return;
      }

      const { PatientDocument } = await import('../models/PatientDocument.js');
      const docs = await PatientDocument.find({ patientId: patient._id || patient.id }).sort({ createdAt: -1 });

      res.status(200).json({ success: true, documents: docs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch documents.' });
    }
  }

  public static async logFrictionInteraction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const patient = await Patient.findOne({ userId });
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient profile not found.' });
        return;
      }

      const { barrierType, severity, contextNote, location } = req.body;
      if (!barrierType) {
        res.status(400).json({ success: false, message: 'barrierType is required.' });
        return;
      }

      const interaction = await FrictionInteraction.create({
        patientId: patient._id || patient.id,
        barrierType,
        severity: severity || 'moderate',
        contextNote,
        location,
        reportedAt: new Date().toISOString(),
      });

      res.status(201).json({ success: true, message: 'Friction interaction logged.', interaction });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to log interaction.' });
    }
  }

  public static async getInteractions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const patient = await Patient.findOne({ userId });
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient profile not found.' });
        return;
      }

      const interactions = await FrictionInteraction.find({ patientId: patient._id || patient.id })
        .sort({ createdAt: -1 })
        .limit(50);

      res.status(200).json({ success: true, interactions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch interactions.' });
    }
  }

  // Aliases for route compatibility
  public static getAccessibilityRisk = PatientController.getCareRisk;
  public static getCareJourney = PatientController.getCareJourneys;
}
