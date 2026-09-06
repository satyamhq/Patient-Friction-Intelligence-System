import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  Home,
  PlusCircle,
  Calendar,
  Heart,
  Save,
  CheckCircle2,
  AlertTriangle,
  Pill,
  GitPullRequest,
  RefreshCw,
  Baby,
} from 'lucide-react';

export const AshaHealthVisits: React.FC = () => {
  const [visits, setVisits] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form
  const [form, setForm] = useState({
    patientId: '',
    visitDate: new Date().toISOString().split('T')[0],
    visitType: 'routine_home_visit',
    visitLocation: 'Household',
    chiefComplaint: '',
    bp: '',
    weight: '',
    temperature: '',
    medicinesGiven: '',
    referralRequired: false,
    referralReason: '',
    referralUrgency: 'routine',
    followUpRequired: false,
    nextVisitDate: '',
    notes: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vRes, pRes] = await Promise.all([
        api.get('/asha/visits'),
        api.get('/asha/patients'),
      ]);

      if (vRes.data?.success) {
        setVisits(vRes.data.visits || []);
      }
      if (pRes.data?.success) {
        setPatients(pRes.data.patients || []);
        if (pRes.data.patients?.length > 0 && !form.patientId) {
          setForm((prev) => ({ ...prev, patientId: pRes.data.patients[0].id || pRes.data.patients[0]._id }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId) {
      setFeedback({ type: 'error', text: 'Please select a patient.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        patientId: form.patientId,
        visitDate: form.visitDate,
        visitType: form.visitType,
        visitLocation: form.visitLocation,
        findings: {
          chiefComplaint: form.chiefComplaint,
          vitalSigns: {
            bloodPressure: form.bp || undefined,
            weight: Number(form.weight) || undefined,
            temperature: Number(form.temperature) || undefined,
          },
        },
        medicinesProvided: form.medicinesGiven
          ? form.medicinesGiven.split(',').map((m) => ({ name: m.trim(), quantity: '1 pack' }))
          : [],
        referralRequired: form.referralRequired,
        referralReason: form.referralReason,
        referralUrgency: form.referralUrgency,
        followUpRequired: form.followUpRequired,
        nextVisitDate: form.nextVisitDate || null,
        generalNotes: form.notes,
      };

      const res = await api.post('/asha/visits', payload);
      if (res.data?.success) {
        setFeedback({ type: 'success', text: 'Frontline health visit recorded successfully.' });
        setShowModal(false);
        setForm({
          patientId: patients[0]?.id || patients[0]?._id || '',
          visitDate: new Date().toISOString().split('T')[0],
          visitType: 'routine_home_visit',
          visitLocation: 'Household',
          chiefComplaint: '',
          bp: '',
          weight: '',
          temperature: '',
          medicinesGiven: '',
          referralRequired: false,
          referralReason: '',
          referralUrgency: 'routine',
          followUpRequired: false,
          nextVisitDate: '',
          notes: '',
        });
        loadData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to record health visit' });
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
            <Home className="w-7 h-7 text-amber-600" />
            Frontline Health Visits & Household Encounters
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log home visits, maternal checkups, child immunization tracking, and direct PHC referral escalations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Log Health Visit
          </Button>
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
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Visits List */}
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : visits.length === 0 ? (
        <EmptyState
          title="No Health Visits Logged"
          description="You have not logged any home visits yet. Use the 'Log Health Visit' button during field rounds."
          actionText="Log First Visit"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visits.map((v) => (
            <div
              key={v.id || v._id}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 capitalize">
                    {v.visitType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {v.visitDate ? new Date(v.visitDate).toLocaleDateString() : 'Today'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {v.findings?.chiefComplaint || 'Routine Health Visit'}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Location: {v.visitLocation || 'Household'}
                  </div>
                </div>

                {v.findings?.vitalSigns && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-xs space-y-1">
                    {v.findings.vitalSigns.bloodPressure && (
                      <div className="text-slate-700 dark:text-slate-300">
                        BP: <strong>{v.findings.vitalSigns.bloodPressure}</strong>
                      </div>
                    )}
                    {v.findings.vitalSigns.weight && (
                      <div className="text-slate-700 dark:text-slate-300">
                        Weight: <strong>{v.findings.vitalSigns.weight} kg</strong>
                      </div>
                    )}
                  </div>
                )}

                {v.referralRequired && (
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5">
                    <GitPullRequest className="w-3.5 h-3.5" />
                    PHC Referral Flagged ({v.referralUrgency})
                  </div>
                )}
              </div>

              {v.nextVisitDate && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Next Scheduled Visit:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(v.nextVisitDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Log Visit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-amber-600" />
              Log Frontline Health Visit
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Patient</label>
                <select
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                >
                  {patients.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name || p.patientCode} ({p.gender}, {p.age}y)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Visit Type</label>
                  <select
                    value={form.visitType}
                    onChange={(e) => setForm({ ...form, visitType: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="routine_home_visit">Routine Home Visit</option>
                    <option value="antenatal_care">Antenatal Care (ANC)</option>
                    <option value="postnatal_care">Postnatal Care (PNC)</option>
                    <option value="immunization_follow_up">Child Immunization</option>
                    <option value="chronic_disease_follow_up">NCD / Hypertension Check</option>
                    <option value="nutrition_screening">Nutrition Screening</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Visit Date</label>
                  <input
                    type="date"
                    value={form.visitDate}
                    onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Chief Health Findings</label>
                <input
                  type="text"
                  placeholder="e.g. Normal fetal movements, mild weakness, routine IFA check"
                  value={form.chiefComplaint}
                  onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">BP (mmHg)</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={form.bp}
                    onChange={(e) => setForm({ ...form, bp: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="52.5"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="37.0"
                    value={form.temperature}
                    onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Supplements / Medicines Given</label>
                <input
                  type="text"
                  placeholder="e.g. IFA Tablets (30 days), ORS Sachets (2)"
                  value={form.medicinesGiven}
                  onChange={(e) => setForm({ ...form, medicinesGiven: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="refReq"
                  checked={form.referralRequired}
                  onChange={(e) => setForm({ ...form, referralRequired: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="refReq" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Patient requires facility referral / doctor escalation
                </label>
              </div>

              {form.referralRequired && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-2">
                  <input
                    type="text"
                    placeholder="Reason for facility escalation (e.g. BP > 140/90, severe anemia)"
                    value={form.referralReason}
                    onChange={(e) => setForm({ ...form, referralReason: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Next Follow-Up Visit Date</label>
                <input
                  type="date"
                  value={form.nextVisitDate}
                  onChange={(e) => setForm({ ...form, nextVisitDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? 'Saving Visit...' : 'Record Visit'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
