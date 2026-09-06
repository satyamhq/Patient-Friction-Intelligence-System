/**
 * High-Risk Patient Follow-Up & Recall Engine
 * Automates recall protocols for:
 * 1. Maternal ANC (Antenatal Care - 4 mandatory visits + IFA compliance)
 * 2. Universal Immunization Programme (UIP - Birth to 24 Months)
 * 3. Chronic Non-Communicable Diseases (Diabetes, Hypertension)
 */

export type ProtocolType = 'MATERNAL_ANC' | 'CHILD_IMMUNIZATION' | 'CHRONIC_NCD';
export type DefaulterSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ProtocolScheduleItem {
  id: string;
  protocolType: ProtocolType;
  milestoneName: string;
  expectedDate: string; // ISO date
  gracePeriodDays: number;
  completedDate?: string;
  status: 'PENDING' | 'OVERDUE' | 'COMPLETED' | 'CANCELLED';
  dangerSignsToScreen: string[];
}

export interface HighRiskPatientProfile {
  id: string;
  patientName: string;
  abhaNumber: string;
  age: number;
  phone: string;
  village: string;
  subCentre: string;
  assignedAshaWorker: {
    id: string;
    name: string;
    phone: string;
  };
  protocolType: ProtocolType;
  conditionDescription: string;
  schedule: ProtocolScheduleItem[];
  highRiskCategory?: string; // e.g. "Severe Anemia", "Gestational HTN", "High HbA1c"
}

export interface AshaRevisitTask {
  id: string;
  patientId: string;
  patientName: string;
  abhaNumber: string;
  phone: string;
  village: string;
  assignedAshaId: string;
  assignedAshaName: string;
  protocolType: ProtocolType;
  missedMilestone: string;
  daysOverdue: number;
  severity: DefaulterSeverity;
  checklist: string[];
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED_REBOOKED' | 'UNRESOLVED_ESCALATED';
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
}

// Global registry of tracked high-risk schedules and generated ASHA tasks
const trackedCohort: Map<string, HighRiskPatientProfile> = new Map();
const ashaTaskQueue: Map<string, AshaRevisitTask> = new Map();

// Initialize realistic demo cohort
const seedHighRiskCohort = () => {
  if (trackedCohort.size > 0) return;

  const today = new Date();
  const pastDate = (daysAgo: number) => new Date(today.getTime() - daysAgo * 86400000).toISOString().split('T')[0];
  const futureDate = (daysAhead: number) => new Date(today.getTime() + daysAhead * 86400000).toISOString().split('T')[0];

  // 1. Sunita Devi - Maternal ANC Defaulter (Missed 3rd ANC Checkup)
  const sunita: HighRiskPatientProfile = {
    id: 'pat-sunita-devi',
    patientName: 'Sunita Devi',
    abhaNumber: '91-4829-1029-4821',
    age: 26,
    phone: '9876543210',
    village: 'Hesal Village',
    subCentre: 'Angara Sub-Centre',
    assignedAshaWorker: {
      id: 'asha-anita-devi',
      name: 'Anita Devi',
      phone: '9876500010',
    },
    protocolType: 'MATERNAL_ANC',
    conditionDescription: '32 Weeks Gestation - High Risk due to Borderline Hypertension & Mild Anemia',
    highRiskCategory: 'Gestational Hypertension (140/90) & Hb 9.2 g/dL',
    schedule: [
      {
        id: 'anc-1',
        protocolType: 'MATERNAL_ANC',
        milestoneName: '1st ANC (Within 12 Weeks)',
        expectedDate: pastDate(140),
        gracePeriodDays: 7,
        completedDate: pastDate(138),
        status: 'COMPLETED',
        dangerSignsToScreen: ['Severe Nausea', 'Vaginal Bleeding'],
      },
      {
        id: 'anc-2',
        protocolType: 'MATERNAL_ANC',
        milestoneName: '2nd ANC (14 - 26 Weeks) + TT-1',
        expectedDate: pastDate(65),
        gracePeriodDays: 7,
        completedDate: pastDate(62),
        status: 'COMPLETED',
        dangerSignsToScreen: ['Abdominal pain', 'Pale conjunctiva'],
      },
      {
        id: 'anc-3',
        protocolType: 'MATERNAL_ANC',
        milestoneName: '3rd ANC (28 - 34 Weeks) + Urine Albumin & IFA Refill',
        expectedDate: pastDate(8), // 8 days overdue!
        gracePeriodDays: 5,
        status: 'OVERDUE',
        dangerSignsToScreen: ['Facial/Pedal Edema', 'Severe Headache', 'High BP'],
      },
      {
        id: 'anc-4',
        protocolType: 'MATERNAL_ANC',
        milestoneName: '4th ANC (36 Weeks) + Delivery Planning',
        expectedDate: futureDate(20),
        gracePeriodDays: 5,
        status: 'PENDING',
        dangerSignsToScreen: ['Premature labor', 'Decreased fetal movements'],
      },
    ],
  };

  // 2. Baby Aarav - Immunization Cohort
  const aarav: HighRiskPatientProfile = {
    id: 'pat-aarav-kumar',
    patientName: 'Baby of Geeta (Aarav)',
    abhaNumber: '91-3829-1920-5819',
    age: 1, // 14 weeks old
    phone: '9876543211',
    village: 'Getalsud Village',
    subCentre: 'Angara Sub-Centre',
    assignedAshaWorker: {
      id: 'asha-anita-devi',
      name: 'Anita Devi',
      phone: '9876500010',
    },
    protocolType: 'CHILD_IMMUNIZATION',
    conditionDescription: 'Universal Immunization - 14-Week Pentavalent-3 Due',
    schedule: [
      {
        id: 'imm-birth',
        protocolType: 'CHILD_IMMUNIZATION',
        milestoneName: 'Birth Dose (BCG, OPV-0, Hepatitis B-0)',
        expectedDate: pastDate(98),
        gracePeriodDays: 14,
        completedDate: pastDate(97),
        status: 'COMPLETED',
        dangerSignsToScreen: ['Neonatal Jaundice', 'Hypothermia'],
      },
      {
        id: 'imm-6w',
        protocolType: 'CHILD_IMMUNIZATION',
        milestoneName: '6 Weeks (OPV-1, Pentavalent-1, Rota-1, fIPV-1)',
        expectedDate: pastDate(56),
        gracePeriodDays: 7,
        completedDate: pastDate(54),
        status: 'COMPLETED',
        dangerSignsToScreen: ['High fever', 'Severe diarrhea'],
      },
      {
        id: 'imm-14w',
        protocolType: 'CHILD_IMMUNIZATION',
        milestoneName: '14 Weeks (OPV-3, Pentavalent-3, fIPV-2, PCV-2)',
        expectedDate: pastDate(3), // 3 days past
        gracePeriodDays: 7,
        status: 'PENDING',
        dangerSignsToScreen: ['Persistent crying', 'Vomiting'],
      },
    ],
  };

  // 3. Rameshwar Soren - Chronic Diabetic / HTN Default
  const rameshwar: HighRiskPatientProfile = {
    id: 'pat-rameshwar-soren',
    patientName: 'Rameshwar Soren',
    abhaNumber: '91-8492-9102-1249',
    age: 58,
    phone: '9876543212',
    village: 'Silli Rural Ward 4',
    subCentre: 'Silli Sub-Centre',
    assignedAshaWorker: {
      id: 'asha-anita-devi',
      name: 'Anita Devi',
      phone: '9876500010',
    },
    protocolType: 'CHRONIC_NCD',
    conditionDescription: 'Type 2 Diabetes & Stage 2 Essential Hypertension',
    highRiskCategory: 'Medication Non-Adherence & Out of Metformin / Telmisartan',
    schedule: [
      {
        id: 'ncd-refill-curr',
        protocolType: 'CHRONIC_NCD',
        milestoneName: 'Monthly Blood Glucose, BP Check & Free Drug Refill',
        expectedDate: pastDate(12), // 12 days overdue!
        gracePeriodDays: 5,
        status: 'OVERDUE',
        dangerSignsToScreen: ['Dizziness', 'Chest discomfort', 'Blurry vision', 'Diabetic Foot Ulcer'],
      },
    ],
  };

  trackedCohort.set(sunita.id, sunita);
  trackedCohort.set(aarav.id, aarav);
  trackedCohort.set(rameshwar.id, rameshwar);
};

seedHighRiskCohort();

export class HighRiskRecallEngine {
  /**
   * Scans all patient cohorts and evaluates schedule adherence against current date
   * Auto-generates ASHA revisit tasks for any defaulters
   */
  static runRecallEvaluation(): {
    scannedCount: number;
    newDefaultersFound: number;
    openTasks: AshaRevisitTask[];
  } {
    seedHighRiskCohort();
    const today = new Date();
    let newDefaulters = 0;

    for (const patient of trackedCohort.values()) {
      for (const item of patient.schedule) {
        if (item.status === 'COMPLETED' || item.status === 'CANCELLED') continue;

        const expected = new Date(item.expectedDate);
        const diffMs = today.getTime() - expected.getTime();
        const daysOverdue = Math.floor(diffMs / 86400000);

        if (daysOverdue > item.gracePeriodDays) {
          item.status = 'OVERDUE';

          // Check if an open task already exists
          const existingTaskId = `task-${patient.id}-${item.id}`;
          if (!ashaTaskQueue.has(existingTaskId)) {
            let severity: DefaulterSeverity = 'MEDIUM';
            if (daysOverdue > 14 || patient.protocolType === 'MATERNAL_ANC') severity = 'HIGH';
            if (daysOverdue > 21 || patient.highRiskCategory) severity = 'CRITICAL';

            const newTask: AshaRevisitTask = {
              id: existingTaskId,
              patientId: patient.id,
              patientName: patient.patientName,
              abhaNumber: patient.abhaNumber,
              phone: patient.phone,
              village: patient.village,
              assignedAshaId: patient.assignedAshaWorker.id,
              assignedAshaName: patient.assignedAshaWorker.name,
              protocolType: patient.protocolType,
              missedMilestone: item.milestoneName,
              daysOverdue,
              severity,
              checklist: [
                `Visit household at ${patient.village}`,
                `Check vital danger signs: ${item.dangerSignsToScreen.join(', ')}`,
                patient.protocolType === 'MATERNAL_ANC'
                  ? 'Verify daily consumption of 180 Iron-Folic Acid (IFA) tablets and Calcium'
                  : 'Check ongoing medicine stock and re-order refills from PHC dispensary',
                'Escort or coordinate doorstep ambulance/transit to nearest facility',
              ],
              status: 'OPEN',
              createdAt: new Date().toISOString(),
            };

            ashaTaskQueue.set(existingTaskId, newTask);
            newDefaulters++;
          }
        }
      }
    }

    return {
      scannedCount: trackedCohort.size,
      newDefaultersFound: newDefaulters,
      openTasks: Array.from(ashaTaskQueue.values()),
    };
  }

  /**
   * Closes an ASHA revisit task once frontline follow-up is documented
   */
  static resolveTask(
    taskId: string,
    outcome: 'RESOLVED_REBOOKED' | 'UNRESOLVED_ESCALATED',
    notes: string,
    rescheduledDate?: string
  ): AshaRevisitTask {
    const task = ashaTaskQueue.get(taskId);
    if (!task) {
      throw new Error(`Recall task ${taskId} not found`);
    }

    task.status = outcome;
    task.resolutionNotes = notes;
    task.resolvedAt = new Date().toISOString();
    ashaTaskQueue.set(taskId, task);

    // Update patient schedule
    const patient = trackedCohort.get(task.patientId);
    if (patient) {
      const milestone = patient.schedule.find((m) => m.milestoneName === task.missedMilestone);
      if (milestone) {
        if (outcome === 'RESOLVED_REBOOKED') {
          milestone.status = 'COMPLETED';
          milestone.completedDate = new Date().toISOString().split('T')[0];
        }
      }
    }

    return task;
  }

  static getAshaTasks(ashaId?: string): AshaRevisitTask[] {
    seedHighRiskCohort();
    this.runRecallEvaluation();

    let tasks = Array.from(ashaTaskQueue.values());
    if (ashaId) {
      tasks = tasks.filter((t) => t.assignedAshaId === ashaId);
    }
    // Sort critical and high severity first
    const severityWeight: Record<DefaulterSeverity, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };
    return tasks.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);
  }

  static getCohortSummary() {
    seedHighRiskCohort();
    this.runRecallEvaluation();

    const allPatients = Array.from(trackedCohort.values());
    const allTasks = Array.from(ashaTaskQueue.values());

    const openCount = allTasks.filter((t) => t.status === 'OPEN').length;
    const resolvedCount = allTasks.filter((t) => t.status === 'RESOLVED_REBOOKED').length;
    const criticalCount = allTasks.filter((t) => t.severity === 'CRITICAL' && t.status === 'OPEN').length;

    return {
      totalRegisteredHighRisk: allPatients.length,
      openRecallTasks: openCount,
      resolvedFollowUps: resolvedCount,
      criticalDefaulters: criticalCount,
      defaulterRatePct: Math.round((openCount / Math.max(1, allPatients.length)) * 100),
    };
  }
}
