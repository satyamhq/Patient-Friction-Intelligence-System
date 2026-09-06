import { Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Appointment, IAppointment } from '../models/Appointment.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { Hospital } from '../models/Hospital.js';
import { AuditService } from '../services/auditService.js';

export class AppointmentController {
  /**
   * Book a new appointment
   */
  public static async createAppointment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const {
        patientId: explicitPatientId,
        doctorId,
        hospitalId,
        departmentName,
        appointmentDate,
        timeSlot,
        type = 'OPD',
        reasonForVisit,
        symptoms = [],
        urgencyLevel = 'routine',
        patientNotes,
      } = req.body;

      // Determine patientId: if patient, derive from user profile; if ASHA/Doctor/Admin, allow explicit patientId
      let finalPatientId = explicitPatientId;
      if (!finalPatientId) {
        const patient = await Patient.findOne({ userId });
        if (patient) {
          finalPatientId = patient.id || patient._id;
        } else {
          finalPatientId = userId;
        }
      }

      if (!doctorId && !hospitalId) {
        res.status(400).json({ success: false, message: 'Doctor or Hospital ID is required to schedule an appointment.' });
        return;
      }

      const dateStr = appointmentDate ? new Date(appointmentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      // Calculate queue number for the day
      const existingToday = await Appointment.countDocuments({
        appointmentDate: { $regex: dateStr },
        doctorId: doctorId || undefined,
        hospitalId: hospitalId || undefined,
      });
      const queueNumber = (existingToday || 0) + 1;

      const code = 'APT-' + crypto.randomBytes(3).toString('hex').toUpperCase();
      const now = new Date().toISOString();

      const newAppointment = await Appointment.create({
        appointmentCode: code,
        patientId: finalPatientId,
        doctorId: doctorId || null,
        hospitalId: hospitalId || null,
        departmentName: departmentName || 'General OPD',
        appointmentDate: dateStr,
        timeSlot: timeSlot || '09:00 - 10:00 AM',
        type,
        status: 'scheduled',
        queueNumber,
        estimatedWaitMinutes: Math.max(0, (queueNumber - 1) * 15),
        reasonForVisit: reasonForVisit || 'General Health Consultation',
        symptoms: Array.isArray(symptoms) ? symptoms : [],
        urgencyLevel,
        patientNotes,
        createdAt: now,
        updatedAt: now,
      });

      await AuditService.log('APPOINTMENT_BOOKED', 'Appointment', req, {
        userId,
        actorRole: req.user?.role || 'patient',
        details: { appointmentId: newAppointment.id || newAppointment._id, doctorId, hospitalId, queueNumber },
      });

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully.',
        appointment: newAppointment,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create appointment.' });
    }
  }

  /**
   * Get appointments for the authenticated patient or doctor
   */
  public static async getMyAppointments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const role = req.user?.role;

      let filter: any = {};

      if (role === 'doctor') {
        const doc = await Doctor.findOne({ userId });
        const docId = doc ? doc.id || doc._id : userId;
        filter = { doctorId: docId };
      } else if (role === 'hospital') {
        const hosp = await Hospital.findOne({ userId });
        const hospId = hosp ? hosp.id || hosp._id : userId;
        filter = { hospitalId: hospId };
      } else {
        // Patient role
        const patient = await Patient.findOne({ userId });
        const patientId = patient ? patient.id || patient._id : userId;
        filter = { patientId };
      }

      const appointments: any[] = await Appointment.find(filter).sort({ appointmentDate: -1, queueNumber: 1 });

      // Enrich with doctor and hospital names
      const enriched = await Promise.all(
        appointments.map(async (apt) => {
          let doctorName = 'Attending Physician';
          let hospitalName = 'District Health Facility';

          if (apt.doctorId) {
            const doc = await Doctor.findOne({ $or: [{ id: apt.doctorId }, { _id: apt.doctorId }] });
            if (doc) doctorName = doc.name;
          }
          if (apt.hospitalId) {
            const hosp = await Hospital.findOne({ $or: [{ id: apt.hospitalId }, { _id: apt.hospitalId }] });
            if (hosp) hospitalName = hosp.name;
          }

          return {
            ...apt,
            id: apt.id || apt._id,
            doctorName,
            hospitalName,
          };
        })
      );

      res.status(200).json({
        success: true,
        count: enriched.length,
        appointments: enriched,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch appointments.' });
    }
  }

  /**
   * Update appointment status (e.g. check-in, complete, cancel)
   */
  public static async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, doctorNotes, cancellationReason } = req.body;

      const validStatuses = ['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ success: false, message: `Invalid status. Valid values: ${validStatuses.join(', ')}` });
        return;
      }

      const appointment = await Appointment.findOne({ $or: [{ id }, { _id: id }, { appointmentCode: id }] });
      if (!appointment) {
        res.status(404).json({ success: false, message: 'Appointment not found.' });
        return;
      }

      const now = new Date().toISOString();
      const updates: any = { status, updatedAt: now };

      if (status === 'checked_in') updates.checkedInAt = now;
      if (status === 'completed') updates.completedAt = now;
      if (status === 'cancelled') {
        updates.cancelledAt = now;
        updates.cancellationReason = cancellationReason || 'Cancelled by user';
        updates.cancelledBy = req.user?.role || 'patient';
      }
      if (doctorNotes) updates.doctorNotes = doctorNotes;

      const updated = await Appointment.findByIdAndUpdate(appointment.id || appointment._id, updates, { new: true });

      res.status(200).json({
        success: true,
        message: `Appointment status updated to ${status}.`,
        appointment: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update appointment.' });
    }
  }

  /**
   * Real-time queue for today
   */
  public static async getTodayQueue(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { doctorId, hospitalId } = req.query;
      const todayStr = new Date().toISOString().split('T')[0];

      let filter: any = {
        appointmentDate: { $regex: todayStr },
      };

      if (doctorId) filter.doctorId = doctorId;
      if (hospitalId) filter.hospitalId = hospitalId;

      const appointments = await Appointment.find(filter).sort({ queueNumber: 1 });

      const currentServing = appointments.find((a: any) => a.status === 'in_progress');
      const waiting = appointments.filter((a: any) => a.status === 'checked_in' || a.status === 'scheduled');
      const completed = appointments.filter((a: any) => a.status === 'completed');

      res.status(200).json({
        success: true,
        today: todayStr,
        totalQueue: appointments.length,
        currentQueueNumber: currentServing ? currentServing.queueNumber : waiting.length > 0 ? waiting[0].queueNumber : null,
        waitingCount: waiting.length,
        completedCount: completed.length,
        appointments,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch queue status.' });
    }
  }
}
