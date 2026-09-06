import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { WhatIfSimulator, INTERVENTION_CATALOG } from '../intelligence/optimization/whatIfSimulator.js';
import { Simulation } from '../models/Simulation.js';
import { Patient } from '../models/Patient.js';
import { CareRisk } from '../models/CareRisk.js';
import { FrictionProfile } from '../models/FrictionProfile.js';
import { Appointment } from '../models/Appointment.js';
import { CareJourney } from '../models/CareJourney.js';
import { AuditService } from '../services/auditService.js';

export class SimulationController {
  public static async getCatalog(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      count: INTERVENTION_CATALOG.length,
      interventions: INTERVENTION_CATALOG,
    });
  }

  /**
   * Aggregate statistics directly from the 1,000 synthetic patient cohort in MongoDB Atlas
   */
  public static async getCohortStats(req: Request, res: Response): Promise<void> {
    try {
      const [totalPatients, risks, frictionProfiles] = await Promise.all([
        Patient.countDocuments({ isSyntheticTestData: true }),
        CareRisk.find({ isSyntheticTestData: true }),
        FrictionProfile.find({ isSyntheticTestData: true }),
      ]);

      let avgCompletion = 37;
      if (risks.length > 0) {
        const sum = risks.reduce((acc: number, r: any) => acc + (r.careCompletionProbability || 0), 0);
        avgCompletion = Math.round((sum / risks.length) * 10) / 10;
      }

      let avgFriction = 55;
      if (frictionProfiles.length > 0) {
        const sum = frictionProfiles.reduce((acc: number, f: any) => acc + (f.overallFrictionScore || 0), 0);
        avgFriction = Math.round((sum / frictionProfiles.length) * 10) / 10;
      }

      const barrierCounts: Record<string, number> = {};
      for (const f of frictionProfiles) {
        const b = f.topBarrier || 'General Travel Barrier';
        barrierCounts[b] = (barrierCounts[b] || 0) + 1;
      }

      const topBarriers = Object.entries(barrierCounts)
        .map(([name, count]) => ({
          name,
          count,
          percent: Math.round((count / (frictionProfiles.length || 1)) * 100),
        }))
        .sort((a, b) => b.count - a.count);

      res.status(200).json({
        success: true,
        dataSource: 'MongoDB Atlas',
        collection: 'patient_profiles',
        cohortTag: 'PFIS-SYNTHETIC-1000-COHORT-2026',
        totalSyntheticPatients: totalPatients || 1000,
        averageBaselineCompletionProbability: avgCompletion,
        averageFrictionScore: avgFriction,
        topBarriers,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch cohort stats.' });
    }
  }

  /**
   * Fetch synthetic patient records from MongoDB for simulation inspection & selection
   */
  public static async getCohortPatients(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const search = (req.query.search as string || '').trim().toLowerCase();

      const all = await Patient.find({ isSyntheticTestData: true });
      let filtered = all;
      if (search) {
        filtered = all.filter((p: any) =>
          p.name?.toLowerCase().includes(search) ||
          p.patientCode?.toLowerCase().includes(search) ||
          p.location?.address?.toLowerCase().includes(search) ||
          p.location?.city?.toLowerCase().includes(search)
        );
      }
      const total = filtered.length;
      const paginated = filtered.slice((page - 1) * limit, page * limit);

      res.status(200).json({
        success: true,
        total,
        page,
        limit,
        patients: paginated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch cohort patients.' });
    }
  }

  /**
   * Fetch a single patient's complete simulation record and friction profile from MongoDB for Digital Twin
   */
  public static async getPatientDigitalTwin(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const patient = await Patient.findOne({
        $or: [{ id }, { _id: id }, { patientCode: id }],
      });

      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient simulation record not found in MongoDB.' });
        return;
      }

      const pId = patient.id || patient._id;
      const [friction, risk, appointments, journeys] = await Promise.all([
        FrictionProfile.findOne({ patientId: pId }),
        CareRisk.findOne({ patientId: pId }),
        Appointment.find({ patientId: pId }),
        CareJourney.find({ patientId: pId }),
      ]);

      res.status(200).json({
        success: true,
        patient,
        frictionProfile: friction || null,
        careRisk: risk || null,
        appointments: appointments || [],
        journeys: journeys || [],
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to load patient digital twin.' });
    }
  }

  public static async runSimulation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { selectedCodes, baselineProbability, cohortSize, saveScenario, scenarioName } = req.body;

      let baseline = baselineProbability !== undefined ? parseFloat(baselineProbability) : undefined;
      let cohort = cohortSize !== undefined ? parseInt(cohortSize, 10) : undefined;

      // Automatically draw baseline probability and cohort size directly from MongoDB Atlas
      if (baseline === undefined || cohort === undefined) {
        const [patientCount, risks] = await Promise.all([
          Patient.countDocuments({ isSyntheticTestData: true }),
          CareRisk.find({ isSyntheticTestData: true }),
        ]);

        if (cohort === undefined) {
          cohort = patientCount > 0 ? patientCount : 1000;
        }
        if (baseline === undefined) {
          if (risks.length > 0) {
            const sum = risks.reduce((acc: number, r: any) => acc + (r.careCompletionProbability || 0), 0);
            baseline = Math.round((sum / risks.length) * 10) / 10;
          } else {
            baseline = 37;
          }
        }
      }

      const codes = Array.isArray(selectedCodes) ? selectedCodes : [];
      const result = WhatIfSimulator.simulate(codes, baseline, cohort);

      let savedDoc: any = null;
      if (saveScenario && scenarioName) {
        savedDoc = await Simulation.create({
          title: scenarioName,
          scenarioName,
          baselineCompletionProbability: result.baselineCompletionProbability,
          simulatedCompletionProbability: result.simulatedCompletionProbability,
          improvementDeltaPercent: result.improvementDeltaPercent,
          selectedInterventionCodes: codes,
          totalBudgetRequiredINR: result.totalBudgetINR,
          estimatedPatientsHelped: result.estimatedPatientsHelped,
          runByUserId: req.user?._id,
        });

        await AuditService.log('SIMULATION_SAVED', 'Simulation', req, {
          userId: req.user?._id,
          resourceId: savedDoc._id.toString(),
        });
      }

      res.status(200).json({
        success: true,
        simulation: result,
        savedScenario: savedDoc,
        dataSource: 'MongoDB Atlas',
        simulatedCohortSize: cohort,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Simulation execution failed.' });
    }
  }

  public static async getSavedSimulations(req: Request, res: Response): Promise<void> {
    try {
      const simulations = await Simulation.find().sort({ createdAt: -1 }).limit(20);
      res.status(200).json({ success: true, simulations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch simulations.' });
    }
  }
}

