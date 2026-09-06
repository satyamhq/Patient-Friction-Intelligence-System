import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  FileText,
  Calendar,
  Stethoscope,
  Pill,
  FlaskConical,
  Activity,
  Heart,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export const MedicalHistory: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/medical-records/my');
      if (res.data?.success) {
        setRecords(res.data.records || []);
        if (res.data.records?.length > 0) {
          setExpandedRecordId(res.data.records[0].id || res.data.records[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedRecordId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-600" />
            Longitudinal Medical History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official ABDM-compliant clinical encounters, doctor consultations, prescriptions, and diagnostic reports.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadRecords} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : records.length === 0 ? (
        <EmptyState
          title="No Medical Encounters Recorded"
          description="Your medical record history is currently empty. After you attend an OPD or teleconsultation, the treating physician's notes and prescriptions will appear here."
        />
      ) : (
        <div className="space-y-4">
          {records.map((record) => {
            const id = record.id || record._id;
            const isExpanded = expandedRecordId === id;

            return (
              <div
                key={id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden transition-all"
              >
                {/* Accordion Bar */}
                <div
                  onClick={() => toggleExpand(id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900 dark:text-white">
                          {record.chiefComplaint}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                          {record.recordCode || 'REC'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {record.doctorName || 'Doctor'} • {record.visitType || 'OPD'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {record.visitDate ? new Date(record.visitDate).toLocaleDateString() : 'Recent'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 space-y-5">
                    {/* Clinical Findings & Vitals */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {record.clinicalFindings && (
                        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-indigo-600" />
                            Clinical Notes & Examination
                          </h4>
                          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                            {record.clinicalFindings}
                          </p>
                        </div>
                      )}

                      {record.vitalSigns && Object.keys(record.vitalSigns).length > 0 && (
                        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-rose-600" />
                            Recorded Vitals
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {record.vitalSigns.bloodPressureSystolic && (
                              <div>
                                <span className="text-slate-400 block">BP:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {record.vitalSigns.bloodPressureSystolic}/{record.vitalSigns.bloodPressureDiastolic} mmHg
                                </span>
                              </div>
                            )}
                            {record.vitalSigns.heartRateBpm && (
                              <div>
                                <span className="text-slate-400 block">Pulse:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {record.vitalSigns.heartRateBpm} bpm
                                </span>
                              </div>
                            )}
                            {record.vitalSigns.temperatureCelsius && (
                              <div>
                                <span className="text-slate-400 block">Temp:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {record.vitalSigns.temperatureCelsius} °C
                                </span>
                              </div>
                            )}
                            {record.vitalSigns.spo2Percent && (
                              <div>
                                <span className="text-slate-400 block">SpO2:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {record.vitalSigns.spo2Percent}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Diagnoses */}
                    {record.diagnoses && record.diagnoses.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Diagnoses & ICD Classifications
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {record.diagnoses.map((d: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                            >
                              {d.description || d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prescriptions */}
                    {record.prescriptions && record.prescriptions.length > 0 && (
                      <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-teal-600" />
                          Prescribed Medications
                        </h4>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                          {record.prescriptions.map((p: any, pIdx: number) => (
                            <div key={pIdx} className="py-2.5 flex items-center justify-between text-xs">
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-sm">
                                  {p.medicineName}
                                </div>
                                <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                                  {p.dosage} • {p.frequency} • for {p.durationDays} days
                                </div>
                              </div>
                              {p.instructions && (
                                <span className="text-xs text-slate-600 dark:text-slate-300 italic">
                                  {p.instructions}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lab Orders */}
                    {record.labOrders && record.labOrders.length > 0 && (
                      <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                          Diagnostic Lab Orders
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {record.labOrders.map((lab: any, lIdx: number) => (
                            <span
                              key={lIdx}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            >
                              {lab.testName || lab}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Note */}
                    {record.followUpDate && (
                      <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-200 flex items-center justify-between">
                        <span>Scheduled Follow-Up Consultation:</span>
                        <span className="font-bold">{new Date(record.followUpDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
