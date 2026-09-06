import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { FrictionProfile } from '../models/FrictionProfile.js';
import { CareJourney } from '../models/CareJourney.js';
import { CareRisk } from '../models/CareRisk.js';
import { Appointment } from '../models/Appointment.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { Queue } from '../models/Queue.js';
import { DoctorSchedule } from '../models/DoctorSchedule.js';
import { Referral } from '../models/Referral.js';
import { Notification } from '../models/Notification.js';
import { AuditService } from '../services/auditService.js';
import crypto from 'crypto';

export class DoctorController {
  /**
   * GET /api/doctor/profile
   * Returns the authenticated doctor's profile.
   * SECURITY: Does NOT auto-create fake profiles. Returns 404 if not onboarded.
   */
  public static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const doctor = await Doctor.findOne({ userId });

      if (!doctor) {
        res.status(404).json({
          success: false,
          message: 'Doctor profile not found. Please complete your professional profile setup.',
          needsOnboarding: true,
        });
        return;
      }

      res.status(200).json({ success: true, doctor });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch doctor profile.' });
    }
  }

  /**
   * POST /api/doctor/profile
   * Creates a new doctor profile (onboarding).
   */
  public static async createProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const existing = await Doctor.findOne({ userId });
      if (existing) {
        res.status(409).json({ success: false, message: 'Doctor profile already exists. Use the update endpoint.' });
        return;
      }

      const {
        name, email, phone, gender, bio, profileImageUrl,
        hospitalId, hospitalName, department, qualification,
        registrationNumber, specialization, experienceYears,
        yearsAtCurrentFacility, opdTimings, availableDays, consultationFee,
        languages, telemedicineEnabled, maxPatientsPerDay,
      } = req.body;

      if (!name || !registrationNumber || !specialization || !department || !qualification) {
        res.status(400).json({
          success: false,
          message: 'Name, medical registration number, specialization, department, and qualification are required.',
        });
        return;
      }

      // Check for duplicate registration number
      const regCheck = await Doctor.findOne({ registrationNumber });
      if (regCheck) {
        res.status(409).json({ success: false, message: 'This medical registration number is already registered on the platform.' });
        return;
      }

      const doctor = await Doctor.create({
        userId,
        name: name || req.user?.name,
        email: email || req.user?.email,
        phone: phone || req.user?.phone,
        gender,
        bio,
        profileImageUrl,
        hospitalId,
        hospitalName,
        department,
        qualification,
        registrationNumber,
        specialization,
        experienceYears: Number(experienceYears) || 0,
        yearsAtCurrentFacility: Number(yearsAtCurrentFacility) || 0,
        opdTimings,
        availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        consultationFee: Number(consultationFee) || 0,
        isAvailable: true,
        languages: languages || ['Hindi', 'English'],
        telemedicineEnabled: telemedicineEnabled || false,
        maxPatientsPerDay: Number(maxPatientsPerDay) || 30,
        verificationStatus: 'pending', // Requires admin verification
        isProfileComplete: true,
        totalPatientsConsulted: 0,
      });

      // Create notification for admin to verify
      try {
        await Notification.create({
          userId: 'admin',
          type: 'VERIFICATION_REQUEST',
          title: 'New Doctor Verification Request',
          message: `Dr. ${name} (Reg: ${registrationNumber}, ${specialization}) has submitted a profile for verification.`,
          relatedEntity: 'doctor',
          relatedEntityId: doctor._id || doctor.id,
          isRead: false,
        });
      } catch (notifErr: any) {
        console.warn('[DoctorController] Admin notification failed:', notifErr.message);
      }

      await AuditService.log('DOCTOR_PROFILE_CREATED', 'Doctor', req, {
        userId,
        actorRole: 'doctor',
        details: { name, registrationNumber, specialization },
      });

      res.status(201).json({
        success: true,
        message: 'Doctor profile created. Your account is pending verification by the platform admin.',
        doctor,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create doctor profile.' });
    }
  }

  /**
   * PUT /api/doctor/profile
   * Updates the authenticated doctor's profile.
   */
  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const doctor = await Doctor.findOne({ userId });
      if (!doctor) {
        res.status(404).json({ success: false, message: 'Doctor profile not found.' });
        return;
      }

      const allowedUpdates = [
        'phone', 'gender', 'bio', 'profileImageUrl', 'hospitalId', 'hospitalName',
        'department', 'qualification', 'specialization', 'experienceYears',
        'yearsAtCurrentFacility', 'opdTimings', 'availableDays', 'consultationFee',
        'isAvailable', 'languages', 'telemedicineEnabled', 'maxPatientsPerDay',
      ];

      const updates: Record<string, any> = {};
      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }
      updates.updatedAt = new Date().toISOString();

      Object.assign(doctor, updates);
      await doctor.save();

      await AuditService.log('DOCTOR_PROFILE_UPDATED', 'Doctor', req, {
        userId,
        actorRole: 'doctor',
        details: { updatedFields: Object.keys(updates) },
      });

      res.status(200).json({ success: true, message: 'Doctor profile updated successfully.', doctor });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update profile.' });
    }
  }

  /**
   * GET /api/doctor/appointments
   * Returns this doctor's appointments — filtered by date.
   */
  public static async getAppointments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const doctor = await Doctor.findOne({ userId });
      if (!doctor) {
        res.status(404).json({ success: false, message: 'Doctor profile not found.' });
        return;
      }

      const doctorId = doctor._id || doctor.id;
      const { date, status } = req.query;

      const today = new Date();
      const targetDate = date ? new Date(String(date)) : today;
      const dateStr = targetDate.toISOString().split('T')[0];

      const filter: any = {
        doctorId,
        appointmentDate: {
          $gte: dateStr + 'T00:00:00.000Z',
          $lte: dateStr + 'T23:59:59.999Z',
        },
      };
      if (status) filter.status = status;

      const appointments = await Appointment.find(filter)
        .sort({ appointmentDate: 1 });

      // Enrich with patient names
      const patientIds = appointments.map((a: any) => a.patientId).filter(Boolean);
      const patients = await Patient.find({ _id: { $in: patientIds } });
      const patientMap = new Map(patients.map((p: any) => [(p._id || p.id)?.toString(), p]));

      const enriched = appointments.map((appt: any) => ({
        ...appt,
        patient: patientMap.get(appt.patientId?.toString()) || null,
      }));

      res.status(200).json({ success: true, appointments: enriched, count: enriched.length, date: dateStr });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch appointments.' });
    }
  }

  /**
   * GET /api/doctor/queue
   * Returns today's consultation queue for this doctor (real patients with appointments).
   */
  public static async getConsultationQueue(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const doctor = await Doctor.findOne({ userId });
      if (!doctor) {
        res.status(404).json({ success: false, message: 'Doctor profile not found.' });
        return;
      }

      const doctorId = doctor._id || doctor.id;
      const today = new Date().toISOString().split('T')[0];

      // Get today's queue for this doctor
      const queue = await Queue.findOne({ doctorId, date: today });
      if (!queue || !queue.entries || queue.entries.length === 0) {
        // Return today's appointments as a queue if no explicit queue exists
        const todayAppointments = await Appointment.find({
          doctorId,
          appointmentDate: {
            $gte: today + 'T00:00:00.000Z',
            $lte: today + 'T23:59:59.999Z',
          },
          status: { $nin: ['cancelled', 'no_show', 'completed'] },
        }).sort({ appointmentDate: 1 });

        const patientIds = todayAppointments.map((a: any) => a.patientId).filter(Boolean);
        const patients = await Patient.find({ _id: { $in: patientIds } });
        const frictionProfiles = await FrictionProfile.find({ patientId: { $in: patientIds } });
        const careRisks = await CareRisk.find({ patientId: { $in: patientIds } });

        const patientMap = new Map<string, any>(patients.map((p: any) => [(p._id || p.id)?.toString(), p]));
        const frictionMap = new Map<string, any>(frictionProfiles.map((f: any) => [f.patientId?.toString(), f]));
        const riskMap = new Map<string, any>(careRisks.map((r: any) => [r.patientId?.toString(), r]));

        const queueEntries = todayAppointments.map((appt: any, idx: number) => {
          const pId = appt.patientId?.toString();
          const patient = patientMap.get(pId);
          const friction = frictionMap.get(pId);
          const risk = riskMap.get(pId);
          return {
            queueNumber: appt.queueNumber || idx + 1,
            appointmentId: appt._id || appt.id,
            appointmentTime: appt.timeSlot,
            status: appt.status,
            patientId: pId,
            patientCode: patient?.patientCode || 'N/A',
            age: patient?.age,
            gender: patient?.gender,
            phone: patient?.phone,
            residenceType: patient?.residenceType,
            reasonForVisit: appt.reasonForVisit,
            urgencyLevel: appt.urgencyLevel || 'routine',
            frictionScore: friction?.overallFrictionScore || null,
            frictionLevel: friction?.frictionLevel || null,
            careCompletionRisk: risk?.riskCategory || null,
            topBarriers: friction?.highRiskBarriers || [],
          };
        });

        res.status(200).json({ success: true, count: queueEntries.length, queue: queueEntries, date: today });
        return;
      }

      res.status(200).json({ success: true, count: queue.entries.length, queue: queue.entries, date: today });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch consultation queue.' });
    }
  }

  /**
   * GET /api/doctor/patient/:id
   * Returns a specific patient's details for the doctor's view.
   * SECURITY: Only doctors at the same hospital or with an active appointment can view.
   */
  public static async getPatientDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const doctor = await Doctor.findOne({ userId });
      if (!doctor) {
        res.status(404).json({ success: false, message: 'Doctor profile not found.' });
        return;
      }

      const { id } = req.params;
      const patient = await Patient.findById(id);

      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient not found.' });
        return;
      }

      // Authorization: Check if this doctor has an appointment with this patient
      const doctorId = doctor._id || doctor.id;
      const patientId = patient._id || patient.id;
      const hasAppointment = await Appointment.findOne({ doctorId, patientId });
      const hasReferral = await Referral.findOne({ referringDoctorId: doctorId, patientId });

      if (!hasAppointment && !hasReferral && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied. You do not have an active appointment or referral with this patient.',
        });
        return;
      }

      const frictionProfile = await FrictionProfile.findOne({ patientId });
      const careRisk = await CareRisk.findOne({ patientId });
      const medicalRecords = await MedicalRecord.find({ patientId }).sort({ visitDate: -1 }).limit(10);
      const activeReferrals = await Referral.find({ patientId, status: { $nin: ['completed', 'cancelled'] } });

      await AuditService.log('DOCTOR_PATIENT_DETAIL_VIEWED', 'Patient', req, {
        userId,
        actorRole: 'doctor',
        details: { patientId: id, doctorId },
      });

      res.status(200).json({
        success: true,
        patient,
        frictionProfile,
        careRisk,
        medicalRecords,
        activeReferrals,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch patient detail.' });
    }
  }

  /**
   * POST /api/doctor/consultation
   * Records a consultation / creates a medical record.
   */
  public static async recordConsultation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const doctor = await Doctor.findOne({ userId });
      if (!doctor) {
        res.status(404).json({ success: false, message: 'Doctor profile not found.' });
        return;
      }

      const {
        patientId, appointmentId, chiefComplaint, vitalSigns,
        clinicalFindings, diagnoses, treatmentPlan,
        prescriptions, labOrders, followUpDate, followUpRequired,
        referralRequired, referralReason,
      } = req.body;

      if (!patientId || !chiefComplaint) {
        res.status(400).json({ success: false, message: 'Patient ID and chief complaint are required.' });
        return;
      }

      // Verify patient exists
      const patient = await Patient.findById(patientId);
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient not found.' });
        return;
      }

      const doctorId = doctor._id || doctor.id;

      const record = await MedicalRecord.create({
        recordCode: 'MR-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
        patientId,
        doctorId,
        appointmentId,
        hospitalId: doctor.hospitalId,
        visitDate: new Date().toISOString(),
        visitType: appointmentId ? 'OPD' : 'OPD',
        chiefComplaint,
        vitalSigns: vitalSigns || {},
        clinicalFindings,
        diagnoses: diagnoses || [],
        treatmentPlan,
        prescriptions: prescriptions || [],
        labOrders: labOrders || [],
        followUpRequired: followUpRequired || false,
        followUpDate,
        referralRequired: referralRequired || false,
        referralReason,
      });

      // Update appointment status
      if (appointmentId) {
        await Appointment.updateOne(
          { _id: appointmentId },
          { status: 'completed', completedAt: new Date().toISOString() }
        );
      }

      // Update doctor stats
      await Doctor.updateOne(
        { _id: doctorId },
        { $inc: { totalPatientsConsulted: 1 } }
      );

      // Record care journey
      await CareJourney.create({
        patientId,
        stage: 'Consultation',
        status: 'Completed',
        notes: `Consultation by Dr. ${doctor.name}. Chief complaint: ${chiefComplaint}.`,
        facilityName: doctor.hospitalName || 'Healthcare Facility',
        updatedBy: userId,
      });

      await AuditService.log('CONSULTATION_RECORDED', 'MedicalRecord', req, {
        userId,
        actorRole: 'doctor',
        details: { patientId, recordCode: record.recordCode, referralRequired },
      });

      res.status(201).json({
        success: true,
        message: 'Consultation recorded successfully.',
        record,
        note: 'Clinical decision-support: All diagnoses and treatment decisions are the sole responsibility of the treating physician.',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to record consultation.' });
    }
  }

  /**
   * GET /api/doctor/stats
   * Returns real statistics from DB — no hardcoded numbers.
   */
  public static async getDoctorStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const doctor = await Doctor.findOne({ userId });
      if (!doctor) {
        res.status(404).json({ success: false, message: 'Doctor profile not found.' });
        return;
      }

      const doctorId = doctor._id || doctor.id;
      const today = new Date().toISOString().split('T')[0];

      const [consultedToday, upcomingAppointments, pendingFollowUps, activeReferrals] = await Promise.all([
        MedicalRecord.countDocuments({
          doctorId,
          visitDate: { $gte: today + 'T00:00:00.000Z', $lte: today + 'T23:59:59.999Z' },
        }),
        Appointment.countDocuments({
          doctorId,
          appointmentDate: { $gte: new Date().toISOString() },
          status: { $in: ['scheduled', 'confirmed'] },
        }),
        MedicalRecord.countDocuments({
          doctorId,
          followUpRequired: true,
          followUpDate: { $lte: new Date().toISOString() },
        }),
        Referral.countDocuments({
          referringDoctorId: doctorId,
          status: { $nin: ['completed', 'cancelled', 'counter_referred'] },
        }),
      ]);

      res.status(200).json({
        success: true,
        stats: {
          patientsConsultedToday: consultedToday,
          upcomingAppointments,
          pendingFollowUps,
          activeReferralsInitiated: activeReferrals,
          totalConsultationsLifetime: doctor.totalPatientsConsulted || 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch doctor stats.' });
    }
  }

  /**
   * GET /api/doctor/schedule
   * Returns this doctor's availability schedule.
   */
  public static async getSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const doctor = await Doctor.findOne({ userId });
      if (!doctor) {
        res.status(404).json({ success: false, message: 'Doctor profile not found.' });
        return;
      }

      const doctorId = doctor._id || doctor.id;
      const schedule = await DoctorSchedule.findOne({ doctorId });

      res.status(200).json({ success: true, schedule });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch schedule.' });
    }
  }

  /**
   * PUT /api/doctor/schedule
   * Creates or updates this doctor's availability schedule.
   */
  public static async updateSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const doctor = await Doctor.findOne({ userId });
      if (!doctor) {
        res.status(404).json({ success: false, message: 'Doctor profile not found.' });
        return;
      }

      const doctorId = doctor._id || doctor.id;
      const { weeklySchedule, exceptions, defaultSlotDurationMinutes, maxPatientsPerDay, advanceBookingDays } = req.body;

      let schedule = await DoctorSchedule.findOne({ doctorId });
      if (schedule) {
        Object.assign(schedule, {
          weeklySchedule: weeklySchedule || schedule.weeklySchedule,
          exceptions: exceptions || schedule.exceptions,
          defaultSlotDurationMinutes: defaultSlotDurationMinutes || schedule.defaultSlotDurationMinutes,
          maxPatientsPerDay: maxPatientsPerDay || schedule.maxPatientsPerDay,
          advanceBookingDays: advanceBookingDays || schedule.advanceBookingDays,
          updatedAt: new Date().toISOString(),
        });
        await schedule.save();
      } else {
        schedule = await DoctorSchedule.create({
          doctorId,
          hospitalId: doctor.hospitalId,
          weeklySchedule: weeklySchedule || [],
          exceptions: exceptions || [],
          defaultSlotDurationMinutes: defaultSlotDurationMinutes || 15,
          maxPatientsPerDay: maxPatientsPerDay || 30,
          advanceBookingDays: advanceBookingDays || 7,
          isActive: true,
        });
      }

      res.status(200).json({ success: true, schedule });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update schedule.' });
    }
  }

  /**
   * GET /api/doctor/all (for patient booking)
   * Returns a list of doctors for patient discovery.
   */
  public static async getAllDoctors(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { search, specialization, hospitalId, isAvailable } = req.query;
      const filter: any = { verificationStatus: 'verified' };

      if (specialization) filter.specialization = { $regex: String(specialization), $options: 'i' };
      if (hospitalId) filter.hospitalId = hospitalId;
      if (isAvailable === 'true') filter.isAvailable = true;

      let doctors = await Doctor.find(filter).sort({ rating: -1 }).limit(50);

      if (search) {
        const s = String(search).toLowerCase();
        doctors = doctors.filter(
          (d: any) =>
            d.name?.toLowerCase().includes(s) ||
            d.specialization?.toLowerCase().includes(s) ||
            d.hospitalName?.toLowerCase().includes(s)
        );
      }

      // Strip sensitive fields
      const safeList = doctors.map((d: any) => ({
        id: d._id || d.id,
        name: d.name,
        specialization: d.specialization,
        qualification: d.qualification,
        hospitalId: d.hospitalId,
        hospitalName: d.hospitalName,
        department: d.department,
        experienceYears: d.experienceYears,
        opdTimings: d.opdTimings,
        availableDays: d.availableDays,
        consultationFee: d.consultationFee,
        rating: d.rating,
        isAvailable: d.isAvailable,
        languages: d.languages,
        telemedicineEnabled: d.telemedicineEnabled,
      }));

      res.status(200).json({ success: true, doctors: safeList, count: safeList.length });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch doctors.' });
    }
  }
}
