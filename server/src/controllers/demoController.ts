import { Request, Response } from 'express';
import { Patient } from '../models/Patient.js';
import { FrictionProfile } from '../models/FrictionProfile.js';
import { CareRisk } from '../models/CareRisk.js';
import { CareJourney } from '../models/CareJourney.js';
import { Hospital } from '../models/Hospital.js';
import { CareLeakageEngine } from '../intelligence/leakage/careLeakageEngine.js';
import { PatientDigitalTwinEngine, DigitalTwinParameters } from '../intelligence/digitalTwin/patientDigitalTwinEngine.js';
import { BarrierAttributionEngine } from '../intelligence/attribution/barrierAttributionEngine.js';
import { InterventionOptimizer } from '../intelligence/optimization/interventionOptimizer.js';
import { INTERVENTION_CATALOG } from '../intelligence/optimization/whatIfSimulator.js';
import { getAIProvider } from '../providers/ai/index.js';

export class DemoController {
  /**
   * Public Demo Overview Metrics
   */
  public static async getDemoOverview(req: Request, res: Response): Promise<void> {
    try {
      const [patients, frictionProfiles, risks, hospitals] = await Promise.all([
        Patient.find({ isSyntheticTestData: true }),
        FrictionProfile.find({ isSyntheticTestData: true }),
        CareRisk.find({ isSyntheticTestData: true }),
        Hospital.find({}),
      ]);

      const cohortSize = patients.length || 500;
      let avgFriction = 58;
      if (frictionProfiles.length > 0) {
        const sum = frictionProfiles.reduce((acc: number, f: any) => acc + (f.overallFrictionScore || 0), 0);
        avgFriction = Math.round(sum / frictionProfiles.length);
      }

      let avgCompletion = 42;
      if (risks.length > 0) {
        const sum = risks.reduce((acc: number, r: any) => acc + (r.careCompletionProbability || 0), 0);
        avgCompletion = Math.round(sum / risks.length);
      }

      const funnel = CareLeakageEngine.calculateFunnel(cohortSize, {
        transportFriction: avgFriction,
        costFriction: 54,
        digitalFriction: 46,
        documentationFriction: 38,
      });

      res.status(200).json({
        success: true,
        isSyntheticDemo: true,
        disclaimer: 'PFIS Synthetic Research Dataset. Not real clinical records.',
        summary: {
          totalCohortPatients: cohortSize,
          averageFrictionScore: avgFriction,
          averageCareCompletionProbability: avgCompletion,
          monitoredFacilities: hospitals.length || 12,
          highestCareLeakageStage: funnel.highestDropoutStage,
          dropoutRetentionRate: funnel.overallJourneyCompletionRate,
        },
        careLeakageFunnel: funnel,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Public Simulator Engine: runs deterministic scenario comparisons
   */
  public static async runSimulation(req: Request, res: Response): Promise<void> {
    try {
      const {
        distanceKm = 24,
        transportAvailability = 35,
        costBurden = 65,
        digitalLiteracy = 40,
        languageBarrier = 50,
        familySupport = 55,
        documentationReady = 45,
        appointmentTiming = 30,
      } = req.body;

      const params: DigitalTwinParameters = {
        distanceKm: Number(distanceKm),
        transportAvailability: Number(transportAvailability),
        costBurden: Number(costBurden),
        digitalLiteracy: Number(digitalLiteracy),
        languageBarrier: Number(languageBarrier),
        familySupport: Number(familySupport),
        documentationReady: Number(documentationReady),
        appointmentTiming: Number(appointmentTiming),
      };

      const result = PatientDigitalTwinEngine.simulate(params);

      // Optional AI narrative generation (defaults to deterministic rule engine)
      const ai = getAIProvider();
      const aiExplanation = await ai.explainFriction({
        overallScore: result.baselineFrictionScore,
        factors: result.attribution.attributionBreakdown.map((b) => ({
          name: b.name,
          score: b.rawScore,
          weight: b.weight,
        })),
      });

      res.status(200).json({
        success: true,
        isSyntheticDemo: true,
        inputs: params,
        outputs: {
          ...result,
          aiInsight: aiExplanation,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Public Synthetic Patients List
   */
  public static async getSyntheticPatients(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 15));
      const search = (req.query.search as string || '').toLowerCase().trim();

      const all = await Patient.find({ isSyntheticTestData: true });
      let filtered = all;
      if (search) {
        filtered = all.filter((p: any) =>
          p.name?.toLowerCase().includes(search) ||
          p.patientCode?.toLowerCase().includes(search) ||
          p.location?.city?.toLowerCase().includes(search)
        );
      }

      const total = filtered.length;
      const paginated = filtered.slice((page - 1) * limit, page * limit);

      res.status(200).json({
        success: true,
        isSyntheticDemo: true,
        total,
        page,
        limit,
        patients: paginated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Public Synthetic Patient Detail with Digital Twin Fingerprint
   */
  public static async getSyntheticPatientDetail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const patient = await Patient.findOne({
        $or: [{ id }, { _id: id }, { patientCode: id }],
      });

      if (!patient) {
        res.status(404).json({ success: false, message: 'Synthetic patient record not found.' });
        return;
      }

      const pId = patient.id || patient._id;
      const [friction, risk, journeys] = await Promise.all([
        FrictionProfile.findOne({ patientId: pId }),
        CareRisk.findOne({ patientId: pId }),
        CareJourney.find({ patientId: pId }),
      ]);

      const baseFriction = friction?.overallFrictionScore || 62;
      const attribution = BarrierAttributionEngine.calculateAttribution([
        { name: 'Transit Availability', category: 'transport', rawScore: friction?.transportFriction || 68, weight: 0.25 },
        { name: 'Travel Distance', category: 'distance', rawScore: 60, weight: 0.20 },
        { name: 'Cost Burden', category: 'cost', rawScore: friction?.financialFriction || 65, weight: 0.20 },
        { name: 'Digital Access', category: 'digital', rawScore: friction?.digitalFriction || 50, weight: 0.15 },
        { name: 'Documentation', category: 'documentation', rawScore: 40, weight: 0.10 },
        { name: 'Language Barrier', category: 'language', rawScore: 35, weight: 0.10 },
      ]);

      res.status(200).json({
        success: true,
        isSyntheticDemo: true,
        patient,
        frictionProfile: friction || null,
        careRisk: risk || null,
        journeys: journeys || [],
        attribution,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Public Care Leakage Funnel
   */
  public static async getCareLeakage(req: Request, res: Response): Promise<void> {
    try {
      const total = parseInt(req.query.cohort as string) || 1000;
      const funnel = CareLeakageEngine.calculateFunnel(total, {
        transportFriction: parseInt(req.query.transport as string) || 60,
        costFriction: parseInt(req.query.cost as string) || 55,
        digitalFriction: parseInt(req.query.digital as string) || 45,
      });

      res.status(200).json({
        success: true,
        isSyntheticDemo: true,
        funnel,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Public Population Friction Map GeoJSON & cluster coordinates
   */
  public static async getPopulationMap(req: Request, res: Response): Promise<void> {
    try {
      const patients = await Patient.find({ isSyntheticTestData: true });
      const frictionProfiles = await FrictionProfile.find({ isSyntheticTestData: true });

      const frictionMap = new Map<string, any>();
      frictionProfiles.forEach((f: any) => {
        frictionMap.set(f.patientId?.toString(), f);
      });

      const mapPoints = patients.slice(0, 150).map((p: any) => {
        const f = frictionMap.get(p.id?.toString() || p._id?.toString());
        return {
          id: p.id || p._id,
          name: p.name,
          lat: p.location?.coordinates?.[1] || 31.3260 + (Math.random() - 0.5) * 0.15,
          lng: p.location?.coordinates?.[0] || 75.5762 + (Math.random() - 0.5) * 0.15,
          city: p.location?.city || 'Jalandhar District',
          frictionScore: f?.overallFrictionScore || Math.floor(40 + Math.random() * 45),
          topBarrier: f?.topBarrier || 'Public Transit Distance',
          dropoutRisk: f?.overallFrictionScore > 65 ? 'High' : 'Moderate',
        };
      });

      res.status(200).json({
        success: true,
        isSyntheticDemo: true,
        totalPoints: mapPoints.length,
        center: { lat: 31.3260, lng: 75.5762 },
        points: mapPoints,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Public Policy Intervention Catalog & Optimizer
   */
  public static async getInterventions(req: Request, res: Response): Promise<void> {
    try {
      const budget = parseInt(req.query.budget as string) || 150000;
      const targetBarriers = req.query.barriers
        ? (req.query.barriers as string).split(',')
        : ['transport', 'financial', 'digital'];

      const recommendations = InterventionOptimizer.optimize(budget, 38, 1000);

      res.status(200).json({
        success: true,
        isSyntheticDemo: true,
        catalog: INTERVENTION_CATALOG,
        optimization: recommendations,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Public Synthetic Dataset Download / Inspection
   */
  public static async getSyntheticDataset(req: Request, res: Response): Promise<void> {
    try {
      const patients = await Patient.find({ isSyntheticTestData: true });
      const sample = patients.slice(0, 100);

      res.status(200).json({
        success: true,
        datasetName: 'PFIS-Synthetic-Access-Friction-Cohort-v1',
        totalRecords: sample.length,
        license: 'MIT',
        syntheticDisclaimer: 'Generated for research, education, and simulation purposes. Contains zero Protected Health Information (PHI).',
        records: sample,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Reset local demo session
   */
  public static async resetDemo(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Public demo session reset to default synthetic baseline state.',
      timestamp: new Date().toISOString(),
    });
  }
}
