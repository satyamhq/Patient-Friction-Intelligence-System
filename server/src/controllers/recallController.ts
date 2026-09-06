import { Request, Response } from 'express';
import { HighRiskRecallEngine } from '../intelligence/recall/highRiskRecallEngine.js';

export const getRecallCohortSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const summary = HighRiskRecallEngine.getCohortSummary();
    res.json({ success: true, ...summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAshaRecallTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ashaId } = req.query;
    const tasks = HighRiskRecallEngine.getAshaTasks(ashaId as string);
    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveRecallTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { outcome, notes, rescheduledDate } = req.body;

    const task = HighRiskRecallEngine.resolveTask(
      id,
      outcome || 'RESOLVED_REBOOKED',
      notes || 'Follow-up home visit completed by ASHA.',
      rescheduledDate
    );

    res.json({
      success: true,
      message: 'High-risk patient follow-up recorded and recall loop closed.',
      task,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const triggerRecallScan = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = HighRiskRecallEngine.runRecallEvaluation();
    res.json({
      success: true,
      message: 'High-risk protocol adherence evaluation complete.',
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
