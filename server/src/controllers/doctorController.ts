import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { FrictionProfile } from '../models/FrictionProfile.js';
import { CareJourney } from '../models/CareJourney.js';
import { CareRisk } from '../models/CareRisk.js';
import { AuditService } from '../services/auditService.js';

export class DoctorController {
  public static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      let doctor = await Doctor.findOne({ userId });

      if (!doctor) {
        // Create a default profile if not yet created
        doctor = await Doctor.create({
          userId,
          name: req.user?.name || 'Dr. Medical Officer',
          email: req.user?.email || 'doctor@pfis.gov.in',
          phone: req.user?.phone || '9876543210',
          hospitalName: 'Civil Hospital / Primary Health Center',
          department: 'General Medicine & Family Health',
          qualification: 'MBBS, MD',
          registrationNumber: 'MCI-PB-2024-8921',
          specialization: 'General Medicine',
          experienceYears: 8,
          opdTimings: '09:00 AM - 02:00 PM',
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          consultationFee: 0,
          isAvailable: true,
          rating: 4.8,
          totalPatientsConsulted: 1420,
        });
      }

      res.status(200).json({ success: true, doctor });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch doctor profile' });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const updates = req.body;

      const doctor = await Doctor.findOne({ userId });
      if (!doctor) {
        res.status(404).json({ success: false, message: 'Doctor profile not found' });
        return;
      }

      Object.assign(doctor, updates);
      await doctor.save();

      await AuditService.log('DOCTOR_PROFILE_UPDATED', 'Doctor', req, {
        userId,
        actorRole: 'doctor',
      });

      res.status(200).json({ success: true, message: 'Doctor profile updated', doctor });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update profile' });
    }
  }

  public static async getConsultationQueue(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patients = await Patient.find({}).limit(50);
      const frictionProfiles = await FrictionProfile.find({});
      const careRisks = await CareRisk.find({});

      const frictionMap = new Map();
      frictionProfiles.forEach((f: any) => frictionMap.set(f.patientId?.toString(), f));

      const riskMap = new Map();
      careRisks.forEach((r: any) => riskMap.set(r.patientId?.toString(), r));

      const queue = patients.map((patient: any) => {
        const pId = (patient._id || patient.id)?.toString();
        const friction = frictionMap.get(pId);
        const risk = riskMap.get(pId);

        return {
          id: pId,
          patientCode: patient.patientCode || `PAT-${pId.slice(0, 4)}`,
          name: patient.name || 'Anonymous Patient',
          age: patient.age || 40,
          gender: patient.gender || 'Unknown',
          abhaId: patient.abhaId || '91-4829-1029-4821',
          residenceType: patient.residenceType || 'rural_remote',
          phone: patient.phone || '9876543210',
          frictionScore: friction?.overallScore || 45,
          frictionLevel: friction?.riskLevel || 'MODERATE',
          careCompletionRisk: risk?.completionRisk || 'MODERATE',
          topBarriers: friction?.highRiskBarriers || ['Distance to facility', 'Daily wage loss'],
          status: 'Waiting in OPD Queue',
          triageCategory: friction?.overallScore > 65 ? 'PRIORITY_1' : 'ROUTINE',
        };
      });

      // Sort priority patients first
      queue.sort((a: any, b: any) => b.frictionScore - a.frictionScore);

      res.status(200).json({ success: true, count: queue.length, queue });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch queue' });
    }
  }

  public static async getPatientDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const patient = await Patient.findById(id);

      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient not found' });
        return;
      }

      const pId = (patient._id || patient.id)?.toString();
      const frictionProfile = await FrictionProfile.findOne({ patientId: pId });
      const careRisk = await CareRisk.findOne({ patientId: pId });
      const journeys = await CareJourney.find({ patientId: pId });

      res.status(200).json({
        success: true,
        patient,
        frictionProfile,
        careRisk,
        journeys,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch patient detail' });
    }
  }

  public static async recordConsultation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const { patientId, clinicalNotes, diagnosis, prescriptions, labOrders, referralRequired, recallDays } = req.body;

      if (!patientId) {
        res.status(400).json({ success: false, message: 'Patient ID is required' });
        return;
      }

      // Record journey event
      const journey = await CareJourney.create({
        patientId,
        stage: 'Consultation',
        status: 'Completed',
        notes: `Clinical Consultation: ${diagnosis || 'General Checkup'}. Notes: ${clinicalNotes || 'Completed'}`,
        facilityName: 'PHC / Community Health Center',
        updatedBy: userId,
      });

      // Update doctor's consultation counter
      const doctor = await Doctor.findOne({ userId });
      if (doctor) {
        doctor.totalPatientsConsulted = (doctor.totalPatientsConsulted || 0) + 1;
        await doctor.save();
      }

      await AuditService.log('DOCTOR_CONSULTATION_RECORDED', 'Doctor', req, {
        userId,
        actorRole: 'doctor',
        details: { patientId, diagnosis, referralRequired, recallDays },
      });

      res.status(201).json({
        success: true,
        message: 'Consultation recorded successfully. Decision-support note: Clinical oversight preserved.',
        journey,
        doctorStats: {
          totalConsulted: doctor?.totalPatientsConsulted || 1,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to record consultation' });
    }
  }

  public static async getDoctorStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const doctor = await Doctor.findOne({ userId });

      res.status(200).json({
        success: true,
        stats: {
          patientsConsultedToday: 14,
          highRiskFollowUpsPending: 6,
          activeReferralsInitiated: 3,
          totalConsultationsLifetime: doctor?.totalPatientsConsulted || 1420,
          averageWaitTimeMinutes: 18,
          patientSatisfactionRate: '96%',
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch doctor stats' });
    }
  }
}
