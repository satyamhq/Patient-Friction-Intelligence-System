import { Request, Response } from 'express';
import { ClinicalTriageEngine } from '../intelligence/triage/clinicalTriageEngine.js';
import { HighRiskRecallEngine } from '../intelligence/recall/highRiskRecallEngine.js';
import { AbhaService } from '../services/abhaService.js';

export interface SyncMutation {
  id: string; // client-generated idempotency UUID
  type: 'PATIENT_REGISTRATION' | 'TRIAGE_ASSESSMENT' | 'REVISIT_COMPLETION' | 'REFERRAL_INITIATION';
  timestamp: string;
  payload: any;
}

export const flushSyncQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mutations } = req.body as { mutations: SyncMutation[] };

    if (!Array.isArray(mutations)) {
      res.status(400).json({ success: false, message: 'Invalid mutations payload. Array expected.' });
      return;
    }

    const processedResults: Array<{ id: string; type: string; status: 'SUCCESS' | 'ERROR'; result?: any; error?: string }> = [];

    for (const mutation of mutations) {
      try {
        switch (mutation.type) {
          case 'PATIENT_REGISTRATION': {
            const abhaData = AbhaService.createAbhaCard({
              name: mutation.payload.name,
              gender: mutation.payload.gender,
              age: mutation.payload.age,
              phone: mutation.payload.phone,
              village: mutation.payload.village,
            } as any);

            processedResults.push({
              id: mutation.id,
              type: mutation.type,
              status: 'SUCCESS',
              result: {
                message: 'Patient synchronized to central ABDM repository',
                patientId: 'pat-' + mutation.id.slice(0, 8),
                abhaNumber: abhaData.abhaNumber,
                abhaAddress: abhaData.abhaAddress,
              },
            });
            break;
          }

          case 'TRIAGE_ASSESSMENT': {
            const triage = ClinicalTriageEngine.evaluateTriage(mutation.payload);
            processedResults.push({
              id: mutation.id,
              type: mutation.type,
              status: 'SUCCESS',
              result: triage,
            });
            break;
          }

          case 'REVISIT_COMPLETION': {
            const { taskId, outcome, notes, rescheduledDate } = mutation.payload;
            const updated = HighRiskRecallEngine.resolveTask(taskId, outcome || 'RESOLVED_REBOOKED', notes || 'Resolved offline by ASHA', rescheduledDate);
            processedResults.push({
              id: mutation.id,
              type: mutation.type,
              status: 'SUCCESS',
              result: updated,
            });
            break;
          }

          default:
            processedResults.push({
              id: mutation.id,
              type: mutation.type,
              status: 'SUCCESS',
              result: { acknowledged: true },
            });
        }
      } catch (err: any) {
        processedResults.push({
          id: mutation.id,
          type: mutation.type,
          status: 'ERROR',
          error: err.message,
        });
      }
    }

    res.json({
      success: true,
      receivedCount: mutations.length,
      processedCount: processedResults.filter((r) => r.status === 'SUCCESS').length,
      syncedAt: new Date().toISOString(),
      results: processedResults,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
