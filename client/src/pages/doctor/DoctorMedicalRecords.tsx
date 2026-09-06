import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  FileText,
  PlusCircle,
  Stethoscope,
  Pill,
  FlaskConical,
  Activity,
  Heart,
  Save,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from 'lucide-react';

export const DoctorMedicalRecords: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patientId') || '';

  const [patientId, setPatientId] = useState(initialPatientId);
  const [patients, setPatients] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [form, setForm] = useState({
    chiefComplaint: '',
    clinicalFindings: '',
    bpSystolic: '',
    bpDiastolic: '',
    heartRate: '',
    temperature: '',
    spo2: '',
    diagnosis: '',
    treatmentPlan: '',
  });

  const [prescriptions, setPrescriptions] = useState<any[]>([
    { medicineName: '', dosage: '1 tablet', frequency: 'Twice daily (BD)', durationDays: 5, instructions: 'After meals' },
  ]);

  const [labOrders, setLabOrders] = useState<string[]>([]);
  const [newLabTest, setNewLabTest] = useState('');

  // Load available patients
  useEffect(() => {
    api.get('/doctor/queue').then((res) => {
      if (res.data?.success && res.data.queue) {
        setPatients(res.data.queue);
        if (!patientId && res.data.queue.length > 0) {
          setPatientId(res.data.queue[0].patientId || res.data.queue[0].id);
        }
      }
    }).catch(() => {});
  }, []);

  // Load patient records when patientId changes
  useEffect(() => {
    if (!patientId) return;
    setIsLoading(true);
    api.get(`/medical-records/patient/${patientId}`).then((res) => {
      if (res.data?.success) {
        setRecords(res.data.records || []);
      }
    }).catch(() => {
      setRecords([]);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [patientId]);

  const handleAddPrescription = () => {
    setPrescriptions((prev) => [
      ...prev,
      { medicineName: '', dosage: '1 tablet', frequency: 'Twice daily (BD)', durationDays: 5, instructions: 'After meals' },
    ]);
  };

  const handleRemovePrescription = (index: number) => {
    setPrescriptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddLabTest = () => {
    if (!newLabTest.trim()) return;
    setLabOrders((prev) => [...prev, newLabTest.trim()]);
    setNewLabTest('');
  };

  const handleRemoveLabTest = (index: number) => {
    setLabOrders((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !form.chiefComplaint.trim()) {
      setFeedback({ type: 'error', text: 'Patient ID and Chief Complaint are required.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const validPrescriptions = prescriptions
        .filter((p) => p.medicineName.trim())
        .map((p) => ({
          ...p,
          durationDays: Number(p.durationDays) || 5,
        }));

      const payload = {
        patientId,
        chiefComplaint: form.chiefComplaint,
        clinicalFindings: form.clinicalFindings,
        vitalSigns: {
          bloodPressureSystolic: Number(form.bpSystolic) || undefined,
          bloodPressureDiastolic: Number(form.bpDiastolic) || undefined,
          heartRateBpm: Number(form.heartRate) || undefined,
          temperatureCelsius: Number(form.temperature) || undefined,
          spo2Percent: Number(form.spo2) || undefined,
        },
        diagnoses: form.diagnosis ? [{ description: form.diagnosis, type: 'primary' }] : [],
        treatmentPlan: form.treatmentPlan,
        prescriptions: validPrescriptions,
        labOrders: labOrders.map((t) => ({ testName: t, urgency: 'routine' })),
      };

      const res = await api.post('/medical-records', payload);
      if (res.data?.success) {
        setFeedback({ type: 'success', text: 'Consultation encounter and prescription recorded.' });
        // Reset form
        setForm({
          chiefComplaint: '',
          clinicalFindings: '',
          bpSystolic: '',
          bpDiastolic: '',
          heartRate: '',
          temperature: '',
          spo2: '',
          diagnosis: '',
          treatmentPlan: '',
        });
        setPrescriptions([{ medicineName: '', dosage: '1 tablet', frequency: 'Twice daily (BD)', durationDays: 5, instructions: 'After meals' }]);
        setLabOrders([]);
        // Reload patient records
        api.get(`/medical-records/patient/${patientId}`).then((r) => {
          if (r.data?.success) setRecords(r.data.records || []);
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to save medical record' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-600" />
            Clinical Consultation Desk & Encounters
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Capture clinical examination, diagnoses, electronic prescriptions, and diagnostic test orders.
          </p>
        </div>

        {/* Patient Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-400 uppercase">Patient:</label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {patients.map((p) => (
              <option key={p.patientId || p.id} value={p.patientId || p.id}>
                {p.name || p.patientCode} (#{p.queueNumber || 1})
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: New Consultation Form (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            New Clinical Encounter
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Chief Complaint
              </label>
              <input
                type="text"
                placeholder="e.g. Acute chest pain, shortness of breath on exertion"
                value={form.chiefComplaint}
                onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>

            {/* Vitals */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                Vital Signs
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <input
                    type="number"
                    placeholder="BP Sys"
                    value={form.bpSystolic}
                    onChange={(e) => setForm({ ...form, bpSystolic: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">mmHg (Sys)</span>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="BP Dia"
                    value={form.bpDiastolic}
                    onChange={(e) => setForm({ ...form, bpDiastolic: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">mmHg (Dia)</span>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Heart Rate"
                    value={form.heartRate}
                    onChange={(e) => setForm({ ...form, heartRate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">bpm</span>
                </div>
                <div>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Temp"
                    value={form.temperature}
                    onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">°C</span>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="SpO2 %"
                    value={form.spo2}
                    onChange={(e) => setForm({ ...form, spo2: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">%</span>
                </div>
              </div>
            </div>

            {/* Clinical Notes & Diagnosis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Clinical Examination & Findings
                </label>
                <textarea
                  rows={3}
                  placeholder="Systemic examination, auscultation, local findings..."
                  value={form.clinicalFindings}
                  onChange={(e) => setForm({ ...form, clinicalFindings: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Primary Diagnosis
                </label>
                <input
                  type="text"
                  placeholder="e.g. Essential Hypertension (ICD-10 I10)"
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Prescriptions */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-teal-600" />
                  Prescribed Medicines
                </label>
                <button
                  type="button"
                  onClick={handleAddPrescription}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add Medicine
                </button>
              </div>

              <div className="space-y-2">
                {prescriptions.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl">
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Medicine name"
                        value={p.medicineName}
                        onChange={(e) => {
                          const updated = [...prescriptions];
                          updated[idx].medicineName = e.target.value;
                          setPrescriptions(updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Dosage & Frequency"
                        value={p.frequency}
                        onChange={(e) => {
                          const updated = [...prescriptions];
                          updated[idx].frequency = e.target.value;
                          setPrescriptions(updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Days"
                        value={p.durationDays}
                        onChange={(e) => {
                          const updated = [...prescriptions];
                          updated[idx].durationDays = e.target.value;
                          setPrescriptions(updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Instructions"
                        value={p.instructions}
                        onChange={(e) => {
                          const updated = [...prescriptions];
                          updated[idx].instructions = e.target.value;
                          setPrescriptions(updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      {prescriptions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePrescription(idx)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lab Orders */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-amber-600" />
                Order Lab Investigations
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Complete Blood Count (CBC), Fasting Blood Sugar, ECG"
                  value={newLabTest}
                  onChange={(e) => setNewLabTest(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddLabTest}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-xs font-bold rounded-xl"
                >
                  Add Test
                </button>
              </div>

              {labOrders.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {labOrders.map((test, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5"
                    >
                      {test}
                      <button type="button" onClick={() => handleRemoveLabTest(idx)} className="hover:text-rose-600">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button variant="primary" type="submit" disabled={submitting}>
                <Save className="w-4 h-4 mr-1.5" />
                {submitting ? 'Recording Encounter...' : 'Save & Prescribe'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right: Previous Encounters for selected patient (1 col) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            Patient's Past Records
          </h3>

          {isLoading ? (
            <LoadingSkeleton rows={4} />
          ) : records.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No previous encounters found for this patient.
            </p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {records.map((r) => (
                <div
                  key={r.id || r._id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {r.chiefComplaint}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {r.visitDate ? new Date(r.visitDate).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  {r.clinicalFindings && (
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                      {r.clinicalFindings}
                    </p>
                  )}

                  {r.prescriptions && r.prescriptions.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                        Prescriptions ({r.prescriptions.length}):
                      </span>
                      <div className="space-y-1">
                        {r.prescriptions.map((med: any, mIdx: number) => (
                          <div key={mIdx} className="text-slate-700 dark:text-slate-300">
                            • <strong>{med.medicineName}</strong> ({med.frequency})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
