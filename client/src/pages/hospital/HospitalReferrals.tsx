import React, { useState, useEffect } from 'react';
import {
  Send,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  Bus,
  User,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import api from '../../services/api';
import { AbhaCardModal } from '../../components/patient/AbhaCardModal';

interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  abhaNumber: string;
  referringFacility: string;
  referringDoctor: string;
  targetFacility: string;
  targetDepartment: string;
  reason: string;
  priority: 'routine' | 'urgent' | 'emergency';
  status: 'initiated' | 'accepted' | 'in-transit' | 'consulted' | 'completed' | 'counter-referred';
  clinicalSummary: string;
  vitals?: any;
  frictionFlags?: {
    transitAssistance?: boolean;
    escortRequired?: boolean;
    languageBarrier?: string;
    dailyWageVoucher?: boolean;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
    facility: string;
    note: string;
    actor: string;
  }>;
  createdAt: string;
}

export const HospitalReferrals: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRef, setSelectedRef] = useState<Referral | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAbhaModal, setShowAbhaModal] = useState(false);
  const [selectedPatientForAbha, setSelectedPatientForAbha] = useState<any>(null);

  // Counter-referral modal state
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterNotes, setCounterNotes] = useState(
    'Ultrasound Doppler confirmed mild fetal growth restriction. Continue Tab Labetalol 100mg BD. Counter-referred to Angara PHC for bi-weekly BP checks and ASHA monitoring.'
  );

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/referrals');
      if (res.data?.success && res.data?.referrals) {
        setReferrals(res.data.referrals);
        if (!selectedRef && res.data.referrals.length > 0) {
          setSelectedRef(res.data.referrals[0]);
        }
      }
    } catch {
      // Demo fallback
      const fallback: Referral = {
        id: 'ref-demo-101',
        patientId: 'pat-sunita-devi',
        patientName: 'Sunita Devi',
        abhaNumber: '91-4829-1029-4821',
        referringFacility: 'Angara Primary Health Centre',
        referringDoctor: 'Dr. Alok Verma (MO, Angara PHC)',
        targetFacility: 'Ranchi District Hospital',
        targetDepartment: 'Obstetrics & High-Risk Pregnancy Clinic',
        reason: '32 Weeks Gestation with Persistent Hypertension (150/98) & Pedal Edema',
        priority: 'urgent',
        status: 'initiated',
        clinicalSummary:
          'G3P2 with 32 weeks gestation. Mild proteinuria, pedal edema ++. Requires ultrasound Doppler and obstetric specialist staging.',
        vitals: { systolicBP: 150, diastolicBP: 98, fetalHeartRate: 142 },
        frictionFlags: {
          transitAssistance: true,
          escortRequired: true,
          languageBarrier: 'Santali / Rural Hindi',
          dailyWageVoucher: true,
        },
        timeline: [
          {
            status: 'initiated',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            facility: 'Angara Primary Health Centre',
            note: 'Referral packet created. Non-clinical transport assistance flag raised.',
            actor: 'Dr. Alok Verma',
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      };
      setReferrals([fallback]);
      setSelectedRef(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleUpdateStatus = async (newStatus: string, note?: string) => {
    if (!selectedRef) return;
    setActionLoading(true);

    try {
      const res = await api.patch(`/referrals/${selectedRef.id}/status`, {
        status: newStatus,
        note: note || `State transitioned to ${newStatus} at District Hospital.`,
        facility: 'Ranchi District Hospital',
        actor: 'Dr. Meenakshi Roy (Obstetric Specialist)',
      });

      if (res.data?.success && res.data?.referral) {
        setSelectedRef(res.data.referral);
        setReferrals((prev) =>
          prev.map((r) => (r.id === selectedRef.id ? res.data.referral : r))
        );
      }
    } catch {
      // Optimistic local update
      const updated = {
        ...selectedRef,
        status: newStatus as any,
        timeline: [
          ...selectedRef.timeline,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            facility: 'Ranchi District Hospital',
            note: note || `Status updated to ${newStatus}.`,
            actor: 'Dr. Meenakshi Roy (Specialist)',
          },
        ],
      };
      setSelectedRef(updated);
      setReferrals((prev) => prev.map((r) => (r.id === selectedRef.id ? updated : r)));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCounterRefer = async () => {
    if (!selectedRef) return;
    setActionLoading(true);

    try {
      const res = await api.post(`/referrals/${selectedRef.id}/counter-refer`, {
        instructions: counterNotes,
      });

      if (res.data?.success && res.data?.referral) {
        setSelectedRef(res.data.referral);
        setReferrals((prev) =>
          prev.map((r) => (r.id === selectedRef.id ? res.data.referral : r))
        );
        setShowCounterModal(false);
      }
    } catch {
      handleUpdateStatus('counter-referred', counterNotes);
      setShowCounterModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center font-bold text-white shadow-lg shadow-rose-600/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              District Hospital Referral Reception Desk
            </h1>
            <p className="text-xs text-slate-400">
              Facility: <strong className="text-slate-200">Ranchi District Hospital & FRU</strong> • Inbound Referral Coordination
            </p>
          </div>
        </div>

        <button
          onClick={fetchReferrals}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>रिफ्रेश (Refresh)</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Inbound Referral Stream */}
        <div className="space-y-4">
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-rose-400" />
              <span>Inbound Rural Referrals</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
              {referrals.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {referrals.map((ref) => (
              <div
                key={ref.id}
                onClick={() => setSelectedRef(ref)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  selectedRef?.id === ref.id
                    ? 'bg-slate-800 border-rose-500 ring-2 ring-rose-500/20 shadow-lg'
                    : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">{ref.patientName}</h3>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      ref.status === 'initiated'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                        : ref.status === 'accepted'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : ref.status === 'consulted'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    {ref.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  From: <strong className="text-slate-200">{ref.referringFacility}</strong>
                </p>
                <p className="text-xs text-rose-300 mt-1 line-clamp-1">
                  Dept: {ref.targetDepartment}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Live Referral State Machine & Specialist Intake */}
        {selectedRef && (
          <div className="lg:col-span-2 space-y-6">
            {/* Details & Actions Header */}
            <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700 shadow-xl space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-700">
                <div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-lg">
                      {selectedRef.patientName.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-bold text-white">{selectedRef.patientName}</h2>
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold uppercase border border-rose-500/30">
                          {selectedRef.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        ABHA: <strong className="text-brand-300">{selectedRef.abhaNumber}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedPatientForAbha({
                      name: selectedRef.patientName,
                      abhaNumber: selectedRef.abhaNumber,
                    });
                    setShowAbhaModal(true);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600/20 text-brand-300 border border-brand-500/30 hover:bg-brand-600/30 text-xs font-semibold transition"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan / View ABHA Record</span>
                </button>
              </div>

              {/* State Machine Action Bar */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Referral Lifecycle State Management:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedRef.status === 'initiated' && (
                    <button
                      onClick={() => handleUpdateStatus('accepted', 'Referral accepted. Specialist obstetric bed reserved.')}
                      disabled={actionLoading}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>1. Accept Referral & Reserve Bed</span>
                    </button>
                  )}

                  {selectedRef.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus('consulted', 'Patient arrived at DH OPD. Specialist consultation completed.')}
                      disabled={actionLoading}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>2. Mark Patient Arrived & Consulted</span>
                    </button>
                  )}

                  {(selectedRef.status === 'consulted' || selectedRef.status === 'accepted') && (
                    <button
                      onClick={() => setShowCounterModal(true)}
                      disabled={actionLoading}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>3. Counter-Refer to PHC with Care Protocol</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Clinical Referral Summary */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Clinical Summary & Vitals (from Referring Medical Officer)
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedRef.clinicalSummary}
                </p>
                {selectedRef.vitals && (
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                      BP: {selectedRef.vitals.systolicBP}/{selectedRef.vitals.diastolicBP} mmHg
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                      FHR: {selectedRef.vitals.fetalHeartRate || 140} bpm
                    </span>
                  </div>
                )}
              </div>

              {/* Stateful Audit Timeline */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Stateful Referral Progress Timeline
                </span>
                <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                  {selectedRef.timeline.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-rose-500 ring-4 ring-slate-900" />
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-white uppercase">{step.status}</span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{step.note}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Facility: {step.facility} • Actor: {step.actor}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* COUNTER-REFERRAL MODAL */}
      {showCounterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-purple-400" />
              <span>Counter-Refer Back to PHC (Care Continuity)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Sends diagnostic findings and local follow-up instructions back to the primary health center and ASHA worker.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Specialist Instructions & Follow-up Schedule
              </label>
              <textarea
                rows={4}
                value={counterNotes}
                onChange={(e) => setCounterNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowCounterModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
              >
                रद्द करें
              </button>
              <button
                onClick={handleCounterRefer}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition"
              >
                {actionLoading ? 'जारी हो रहा है...' : 'काउंटर रेफरल भेजें (Send Counter-Referral)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABHA MODAL */}
      <AbhaCardModal
        isOpen={showAbhaModal}
        onClose={() => setShowAbhaModal(false)}
        patientData={selectedPatientForAbha}
      />
    </div>
  );
};
