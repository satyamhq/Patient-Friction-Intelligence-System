import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertCircle,
  Bus,
  DollarSign,
  FileQuestion,
  Smartphone,
  Languages,
  Users,
  Search,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ashaService } from '../../services/ashaService';

export const AshaBarrierEntry: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Barrier values
  const [transport, setTransport] = useState('low');
  const [finance, setFinance] = useState('severely_constrained');
  const [docs, setDocs] = useState('partial');
  const [digital, setDigital] = useState('none');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await ashaService.getPatients();
        setPatients(res.patients);
        if (res.patients.length > 0) {
          setSelectedPatientId(res.patients[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch patients for barrier entry:', err);
      }
    };
    fetchPatients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await ashaService.recordBarriers({
        patientId: selectedPatientId,
        barriers: {
          transportAvailability: transport,
          financialAccessibility: finance,
          documentationStatus: docs,
          digitalAccessLevel: digital,
        },
        notes,
      });

      if (res.success) {
        setSuccessMsg(
          `Barriers successfully updated! New calculated friction score: ${
            res.frictionProfile?.overallFrictionScore || res.frictionProfile?.overallScore || 62
          }/100.`
        );
        setNotes('');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to record barriers');
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Village Non-Clinical Barrier Assessment</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Record frontline field constraints (travel distance, lost wages, missing documents) for household visits
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-800 dark:text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Patient Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Select Assigned Household Patient
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} &bull; {p.patientCode} &bull; {p.village}
              </option>
            ))}
          </select>
        </div>

        {selectedPatient && (
          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-500/5 border border-rose-200/50 dark:border-rose-500/20 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">{selectedPatient.name}</span>
              <span className="text-slate-500 ml-2">({selectedPatient.age}y, {selectedPatient.gender})</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Village: {selectedPatient.village}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Current Friction</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                {selectedPatient.frictionScore}/100
              </span>
            </div>
          </div>
        )}

        {/* Barrier 1: Transport & Mobility */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Bus className="w-4 h-4 text-blue-500" /> Physical Transit & Bus Connectivity
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'low', label: 'Low / None', sub: 'Walk or Flooded Path' },
              { val: 'moderate', label: 'Moderate', sub: 'Irregular Auto / Bus' },
              { val: 'high', label: 'Adequate', sub: 'Direct Highway Link' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.val}
                onClick={() => setTransport(opt.val)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  transport === opt.val
                    ? 'bg-blue-50/80 dark:bg-blue-500/15 border-blue-500 ring-2 ring-blue-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="font-semibold text-xs text-slate-900 dark:text-white">{opt.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Barrier 2: Financial Accessibility */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" /> Financial Daily Wage & Scan Costs
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'severely_constrained', label: 'Daily Wage Earner', sub: 'Loses Rs 500/day' },
              { val: 'bpl_ration_card', label: 'BPL Card Holder', sub: 'Ayushman Eligible' },
              { val: 'moderate_budget', label: 'Moderate Budget', sub: 'Can afford travel' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.val}
                onClick={() => setFinance(opt.val)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  finance === opt.val
                    ? 'bg-emerald-50/80 dark:bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="font-semibold text-xs text-slate-900 dark:text-white">{opt.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Barrier 3: Documentation & Verification */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-amber-500" /> Identity Documents & ABHA Card
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'none', label: 'Missing Documents', sub: 'Lost Aadhaar/Ration' },
              { val: 'partial', label: 'Partial Papers', sub: 'Has Aadhaar, no PMJAY' },
              { val: 'complete', label: 'Complete Saturation', sub: 'ABHA & Golden Card' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.val}
                onClick={() => setDocs(opt.val)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  docs === opt.val
                    ? 'bg-amber-50/80 dark:bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="font-semibold text-xs text-slate-900 dark:text-white">{opt.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Barrier 4: Digital Literacy & Network */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-purple-500" /> Mobile Connectivity & Digital Access
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'none', label: 'No Phone', sub: 'Needs Home Visit Only' },
              { val: 'basic', label: 'Keypad / SMS Only', sub: 'Voice / USSD Alert' },
              { val: 'moderate', label: 'Shared 4G Phone', sub: 'WhatsApp Capable' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.val}
                onClick={() => setDigital(opt.val)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  digital === opt.val
                    ? 'bg-purple-50/80 dark:bg-purple-500/15 border-purple-500 ring-2 ring-purple-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="font-semibold text-xs text-slate-900 dark:text-white">{opt.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Frontline Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            ASHA Home Visit Observations & Interventions
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Patient hesitated due to eldercare at home; counselled family to accompany on Monday PHC OPD bus..."
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> Save Field Assessment & Recalculate Friction
        </button>
      </form>
    </div>
  );
};
