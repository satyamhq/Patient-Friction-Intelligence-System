import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AshaWorker } from '../models/AshaWorker.js';
import { Patient } from '../models/Patient.js';
import { FrictionProfile } from '../models/FrictionProfile.js';
import { CareRisk } from '../models/CareRisk.js';
import { CareJourney } from '../models/CareJourney.js';
import { HealthVisit } from '../models/HealthVisit.js';
import { FrictionEngine } from '../intelligence/friction/frictionEngine.js';
import { RiskEngine } from '../intelligence/risk/riskEngine.js';
import { AuditService } from '../services/auditService.js';
import { HighRiskRecallEngine } from '../intelligence/recall/highRiskRecallEngine.js';

export class AshaController {
  public static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      let worker = await AshaWorker.findOne({ userId });

      if (!worker) {
        worker = await AshaWorker.create({
          userId,
          workerId: `ASHA-${Math.floor(1000 + Math.random() * 9000)}`,
          name: req.user?.name || 'Frontline Health Worker',
          email: req.user?.email || '',
          phone: req.user?.phone || '',
          assignedVillage: '',
          assignedWard: '',
          district: '',
          state: '',
          primaryHealthCenter: '',
          communityPopulation: 0,
          assignedPatientsCount: 0,
          activeCases: 0,
          languagesSpoken: ['Hindi'],
          isFieldActive: true,
          verificationStatus: 'pending',
          isProfileComplete: false,
        });
      }

      res.status(200).json({ success: true, worker });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch ASHA profile' });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      let worker = await AshaWorker.findOne({ userId });
      if (!worker) {
        worker = await AshaWorker.create({
          userId,
          workerId: req.body.workerId || `ASHA-PB-${Math.floor(1000 + Math.random() * 9000)}`,
          name: req.body.name || req.user?.name || 'Anita Devi',
          email: req.user?.email || 'asha@pfis.org',
          phone: req.body.phone || '9876501234',
          assignedVillage: req.body.assignedVillage || 'Hesal Village',
          assignedWard: req.body.assignedWard || 'Ward 3',
          district: req.body.district || 'Ranchi',
          state: req.body.state || 'Jharkhand',
          primaryHealthCenter: req.body.primaryHealthCenter || 'Angara PHC',
          communityPopulation: Number(req.body.communityPopulation) || 1200,
          assignedPatientsCount: Number(req.body.assignedPatientsCount) || 150,
          activeCases: Number(req.body.activeCases) || 18,
          languagesSpoken: Array.isArray(req.body.languagesSpoken) ? req.body.languagesSpoken : ['Hindi', 'Santali'],
          isFieldActive: req.body.isFieldActive !== false,
        });
      } else {
        await AshaWorker.updateOne({ userId }, { $set: req.body });
        worker = await AshaWorker.findOne({ userId });
      }
      res.status(200).json({ success: true, worker });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update ASHA profile' });
    }
  }

  public static async getAssignedPatients(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patients = await Patient.find({}).limit(50);
      const frictionProfiles = await FrictionProfile.find({});
      const careRisks = await CareRisk.find({});

      const frictionMap = new Map();
      frictionProfiles.forEach((f: any) => frictionMap.set(f.patientId?.toString(), f));

      const riskMap = new Map();
      careRisks.forEach((r: any) => riskMap.set(r.patientId?.toString(), r));

      const enriched = patients.map((p: any) => {
        const id = (p._id || p.id)?.toString();
        const f = frictionMap.get(id);
        const r = riskMap.get(id);

        return {
          id,
          patientCode: p.patientCode || `PAT-${id.slice(0, 4)}`,
          name: p.name || 'Rural Patient',
          age: p.age || 38,
          gender: p.gender || 'female',
          phone: p.phone || '9876543210',
          village: p.location?.city || 'Khera Village',
          frictionScore: f?.overallScore || 52,
          riskLevel: f?.riskLevel || 'MODERATE',
          careCompletionRisk: r?.completionRisk || 'MODERATE',
          highRiskBarriers: f?.highRiskBarriers || ['Transport accessibility', 'Financial daily wage loss'],
          lastContactDate: '2026-09-02',
          nextFollowUpDue: '2026-09-10',
        };
      });

      res.status(200).json({ success: true, count: enriched.length, patients: enriched });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch assigned patients' });
    }
  }

  public static async registerPatient(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const {
        name,
        age,
        gender,
        phone,
        village,
        transportAvailability,
        financialAccessibility,
        documentationStatus,
        digitalAccessLevel,
        preferredLanguage,
      } = req.body;

      const count = await Patient.countDocuments();
      const patientCode = `PAT-${1000 + count + 1}`;

      const newPatient = await Patient.create({
        patientCode,
        name: name || 'Village Resident',
        age: age || 32,
        gender: gender || 'female',
        phone: phone || '9876500000',
        preferredLanguage: preferredLanguage || 'Punjabi',
        transportAvailability: transportAvailability || 'low',
        financialAccessibility: financialAccessibility || 'severely_constrained',
        documentationStatus: documentationStatus || 'partial',
        digitalAccessLevel: digitalAccessLevel || 'none',
        residenceType: 'rural_remote',
        location: {
          address: village || 'Khera Village',
          city: 'Phagwara',
          state: 'Punjab',
          pincode: '144411',
          latitude: 31.2533,
          longitude: 75.7042,
          geoJSON: { type: 'Point', coordinates: [75.7042, 31.2533] },
        },
      });

      // Calculate initial friction score
      const dummyHosp = { name: 'PHC Chaheru', distance: 6.5, type: 'PHC' };
      const frictionCalc = FrictionEngine.calculate(newPatient.toObject(), dummyHosp, 6.5);
      const frictionProfile = await FrictionProfile.create({
        patientId: newPatient._id,
        ...frictionCalc,
      });

      const riskCalc = RiskEngine.evaluate(frictionCalc);
      const careRisk = await CareRisk.create({
        patientId: newPatient._id,
        frictionProfileId: frictionProfile._id,
        ...riskCalc,
      });

      newPatient.activeFrictionProfileId = frictionProfile._id as any;
      newPatient.activeCareRiskId = careRisk._id as any;
      await newPatient.save();

      // Log care journey inception
      await CareJourney.create({
        patientId: newPatient._id,
        stage: 'Referral',
        status: 'Initiated by Frontline ASHA',
        notes: `ASHA field intake: Initial barriers recorded. Friction score: ${frictionCalc.overallFrictionScore}`,
        facilityName: 'PHC Chaheru',
        updatedBy: userId,
      });

      await AuditService.log('ASHA_PATIENT_REGISTERED', 'AshaWorker', req, {
        userId,
        actorRole: 'asha',
        details: { patientId: newPatient._id, patientCode },
      });

      res.status(201).json({
        success: true,
        message: 'Patient registered successfully in frontline care network.',
        patient: newPatient,
        frictionProfile,
        careRisk,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to register patient' });
    }
  }

  public static async recordBarriers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { patientId, barriers, notes } = req.body;
      const userId = req.user?._id || req.user?.id;

      if (!patientId) {
        res.status(400).json({ success: false, message: 'Patient ID is required' });
        return;
      }

      const patient = await Patient.findById(patientId);
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient not found' });
        return;
      }

      // Update patient profile fields if provided in barriers
      if (barriers?.transportAvailability) patient.transportAvailability = barriers.transportAvailability;
      if (barriers?.financialAccessibility) patient.financialAccessibility = barriers.financialAccessibility;
      if (barriers?.documentationStatus) patient.documentationStatus = barriers.documentationStatus;
      if (barriers?.digitalAccessLevel) patient.digitalAccessLevel = barriers.digitalAccessLevel;
      await patient.save();

      // Recalculate friction
      const dummyHosp = { name: 'PHC Chaheru', distance: 7.2, type: 'PHC' };
      const frictionCalc = FrictionEngine.calculate(patient.toObject(), dummyHosp, 7.2);
      
      let frictionProfile = await FrictionProfile.findOne({ patientId });
      if (frictionProfile) {
        Object.assign(frictionProfile, frictionCalc);
        await frictionProfile.save();
      } else {
        frictionProfile = await FrictionProfile.create({
          patientId,
          ...frictionCalc,
        });
      }

      const riskCalc = RiskEngine.evaluate(frictionCalc);
      let careRisk = await CareRisk.findOne({ patientId });
      if (careRisk) {
        Object.assign(careRisk, riskCalc);
        await careRisk.save();
      } else {
        careRisk = await CareRisk.create({
          patientId,
          frictionProfileId: frictionProfile._id,
          ...riskCalc,
        });
      }

      await CareJourney.create({
        patientId,
        stage: 'Follow-up',
        status: 'Barrier Recorded',
        notes: `ASHA Field Visit: Updated barrier profile. ${notes || ''}`,
        facilityName: 'Frontline Community Care',
        updatedBy: userId,
      });

      await AuditService.log('ASHA_BARRIER_RECORDED', 'AshaWorker', req, {
        userId,
        actorRole: 'asha',
        details: { patientId, newFrictionScore: frictionCalc.overallFrictionScore },
      });

      res.status(200).json({
        success: true,
        message: 'Barriers recorded and patient friction score recalculated.',
        frictionProfile,
        careRisk,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to record barriers' });
    }
  }

  public static async getRecallTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const recallData = HighRiskRecallEngine.runRecallEvaluation();
      const tasks = recallData.openTasks;

      res.status(200).json({ success: true, count: tasks.length, tasks });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch recall tasks' });
    }
  }

  public static async completeRecallTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { taskId, outcome, notes, newAppointmentDate } = req.body;
      const userId = req.user?._id || req.user?.id;

      await AuditService.log('ASHA_RECALL_COMPLETED', 'AshaWorker', req, {
        userId,
        actorRole: 'asha',
        details: { taskId, outcome, notes, newAppointmentDate },
      });

      res.status(200).json({
        success: true,
        message: 'Recall follow-up task logged. Closed-loop care cycle maintained.',
        task: {
          taskId,
          status: 'RESOLVED',
          outcome: outcome || 'PATIENT_ACCOMPANIED_TO_PHC',
          completedAt: new Date().toISOString(),
          notes,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to complete recall task' });
    }
  }

  /**
   * Log a frontline health visit (offline capable)
   */
  public static async createHealthVisit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const worker = await AshaWorker.findOne({ userId });
      const ashaWorkerId = worker ? worker.id || worker._id : userId;

      const {
        patientId,
        visitDate,
        visitType = 'routine_home_visit',
        visitLocation = 'Household',
        householdId,
        findings,
        actionsPerformed = [],
        medicinesProvided = [],
        educationProvided = [],
        referralRequired = false,
        referralReason,
        referralUrgency = 'routine',
        followUpRequired = false,
        nextVisitDate,
        followUpNotes,
        generalNotes,
      } = req.body;

      if (!patientId) {
        res.status(400).json({ success: false, message: 'patientId is required for health visit.' });
        return;
      }

      const now = new Date().toISOString();
      const visit = await HealthVisit.create({
        ashaWorkerId,
        patientId,
        visitDate: visitDate || now.split('T')[0],
        visitType,
        visitLocation,
        householdId,
        findings: findings || {},
        actionsPerformed: Array.isArray(actionsPerformed) ? actionsPerformed : [],
        medicinesProvided: Array.isArray(medicinesProvided) ? medicinesProvided : [],
        educationProvided: Array.isArray(educationProvided) ? educationProvided : [],
        referralRequired: !!referralRequired,
        referralReason,
        referralUrgency,
        followUpRequired: !!followUpRequired,
        nextVisitDate: nextVisitDate || null,
        followUpNotes,
        generalNotes,
        syncStatus: 'synced',
        syncedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      await AuditService.log('HEALTH_VISIT_LOGGED', 'HealthVisit', req, {
        userId,
        actorRole: 'asha',
        details: { visitId: visit.id || visit._id, patientId, visitType },
      });

      res.status(201).json({
        success: true,
        message: 'Frontline health visit recorded successfully.',
        visit,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to record health visit.' });
    }
  }

  /**
   * Get health visits logged by this ASHA worker
   */
  public static async getHealthVisits(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const worker = await AshaWorker.findOne({ userId });
      const ashaWorkerId = worker ? worker.id || worker._id : userId;

      const { patientId } = req.query;
      let filter: any = { ashaWorkerId };
      if (patientId) filter.patientId = patientId;

      const visits = await HealthVisit.find(filter).sort({ visitDate: -1, createdAt: -1 });

      res.status(200).json({
        success: true,
        count: visits.length,
        visits,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch health visits.' });
    }
  }
}
