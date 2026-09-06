import React, { useState, useEffect } from 'react';
import {
  Building2,
  Send,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  QrCode,
  RefreshCw,
  AlertCircle,
  FileText,
  Bed,
} from 'lucide-react';
import { AbhaCardModal } from '../../components/patient/AbhaCardModal';
import { api } from '../../services/api';

interface StatefulReferral {
  id: string;
  patientId: string;
  patientName: string;
  abhaNumber: string;
  referringFacility: string;
  targetFacility: string;
  targetDepartment: string;
  priority: 'emergency' | 'urgent' | 'routine';
  status: 'initiated' | 'accepted' | 'in-transit' | 'consulted' | 'counter-referred';
  clinicalSummary: string;
  vitals?: {
    systolicBP: number;
    diastolicBP: number;
    fetalHeartRate?: number;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
    facility: string;
    actor: string;
    note: string;
  }>;
}

export const HospitalReferrals: React.FC = () => {
  const [referrals, setReferrals] = useState<StatefulReferral[]>([]);
  const [selectedRef, setSelectedRef] = useState<StatefulReferral | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Counter-referral modal state
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterNotes, setCounterNotes] = useState(
    'Specialist Doppler ultrasound confirmed stable fetal heart. Initiated oral labetalol 100mg BD. Counter-referred to Angara PHC for bi-weekly blood pressure tracking and ASHA doorstep monitoring.'
  );

  // ABHA Modal state
  const [showAbhaModal, setShowAbhaModal] = useState(false);
  const [selectedPatientForAbha, setSelectedPatientForAbha] = useState<{
    name: string;
    abhaNumber: string;
  } | null>(null);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/referrals');
      if (res.data?.success && res.data?.referrals) {
        setReferrals(res.data.referrals);
        if (res.data.referrals.length > 0 && !selectedRef) {
          setSelectedRef(res.data.referrals[0]);
        }
      }
    } catch {
      // Offline / Demo fallback
      const fallbackList: StatefulReferral[] = [
        {
          id: 'ref-1049',
          patientId: 'pat-1',
          patientName: 'Sunita Devi',
          abhaNumber: '91-4829-1049-2810',
          referringFacility: 'Angara Primary Health Centre',
          targetFacility: 'Ranchi District Hospital',
          targetDepartment: 'Obstetrics & High-Risk Pregnancy Clinic',
          priority: 'urgent',
          status: 'initiated',
          clinicalSummary:
            '3rd Trimester pregnancy with severe persistent headache, pedal edema ++, blood pressure 155/98 mmHg. Requires Doppler ultrasound evaluation and emergency bed reservation.',
          vitals: { systolicBP: 155, diastolicBP: 98, fetalHeartRate: 142 },
          timeline: [
            {
              status: 'initiated',
              timestamp: new Date().toISOString(),
              facility: 'Angara Primary Health Centre',
              actor: 'Dr. Alok Verma (Medical Officer)',
              note: 'Referral initiated with ambulance transit subsidy and ASHA escort flag.',
            },
          ],
        },
        {
          id: 'ref-1050',
          patientId: 'pat-2',
          patientName: 'Rameshwar Oraon',
          abhaNumber: '73-5819-2041-3914',
          referringFacility: 'Silli Community Health Centre',
          targetFacility: 'Ranchi District Hospital',
          targetDepartment: 'General Surgery & Diabetic Foot Clinic',
          priority: 'routine',
          status: 'accepted',
          clinicalSummary:
            'Chronic diabetic foot ulceration with microvascular changes. Requires surgical debridement and antibiotic sensitivity profiling.',
          vitals: { systolicBP: 138, diastolicBP: 88 },
          timeline: [
            {
              status: 'initiated',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              facility: 'Silli CHC',
              actor: 'Dr. R. K. Soren',
              note: 'Referred for specialist surgical wound assessment.',
            },
            {
              status: 'accepted',
              timestamp: new Date(Date.now() - 43200000).toISOString(),
              facility: 'Ranchi District Hospital',
              actor: 'Dr. Meenakshi Roy (Specialist)',
              note: 'Referral accepted. Surgery OPD slot reserved for tomorrow morning.',
            },
          ],
        },
      ];
      setReferrals(fallbackList);
      if (!selectedRef) setSelectedRef(fallbackList[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleUpdateStatus = async (newStatus: StatefulReferral['status'], note: string) => {
    if (!selectedRef) return;
    setActionLoading(true);
    try {
      await api.patch(`/referrals/${selectedRef.id}/status`, {
        status: newStatus,
        note,
        facility: 'Ranchi District Hospital',
        actor: 'Dr. Meenakshi Roy (Specialist Desk)',
      });

      // Update local state
      const updated = {
        ...selectedRef,
        status: newStatus,
        timeline: [
          ...selectedRef.timeline,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            facility: 'Ranchi District Hospital',
            actor: 'Dr. Meenakshi Roy (Specialist)',
            note,
          },
        ],
      };
      setSelectedRef(updated);
      setReferrals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch {
      // Local optimistic update
      const updated = {
        ...selectedRef,
        status: newStatus,
        timeline: [
          ...selectedRef.timeline,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            facility: 'Ranchi District Hospital',
            actor: 'Dr. Meenakshi Roy (Specialist)',
            note,
          },
        ],
      };
      setSelectedRef(updated);
      setReferrals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCounterRefer = async () => {
    if (!selectedRef) return;
    setActionLoading(true);
    try {
      await api.patch(`/referrals/${selectedRef.id}/status`, {
        status: 'counter-referred',
        note: counterNotes,
        facility: 'Ranchi District Hospital',
        actor: 'Dr. Meenakshi Roy (Specialist Desk)',
      });

      const updated = {
        ...selectedRef,
        status: 'counter-referred' as const,
        timeline: [
          ...selectedRef.timeline,
          {
            status: 'counter-referred',
            timestamp: new Date().toISOString(),
            facility: 'Ranchi District Hospital',
            actor: 'Dr. Meenakshi Roy (Specialist)',
            note: counterNotes,
          },
        ],
      };
      setSelectedRef(updated);
      setReferrals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setShowCounterModal(false);
    } catch {
      const updated = {
        ...selectedRef,
        status: 'counter-referred' as const,
        timeline: [
          ...selectedRef.timeline,
          {
            status: 'counter-referred',
            timestamp: new Date().toISOString(),
            facility: 'Ranchi District Hospital',
            actor: 'Dr. Meenakshi Roy (Specialist)',
            note: counterNotes,
          },
        ],
      };
      setSelectedRef(updated);
      setReferrals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setShowCounterModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center font-bold text-white shadow-md shadow-teal-600/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              District Hospital Referral Reception Desk
            </h1>
            <p className="text-xs text-slate-500">
              Facility: <strong className="text-slate-800 font-semibold">Ranchi District Hospital & FRU</strong> • Inbound Referral Coordination
            </p>
          </div>
        </div>

        <button
          onClick={fetchReferrals}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${loading ? 'animate-spin' : ''}`} />
          <span>रिफ्रेश (Refresh)</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Inbound Referral Stream */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-600" />
              <span>Inbound Rural Referrals</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
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
                    ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50/80 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{ref.patientName}</h3>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      ref.status === 'initiated'
                        ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                        : ref.status === 'accepted'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : ref.status === 'consulted'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    }`}
                  >
                    {ref.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-1">
                  From: <strong className="text-slate-700 font-medium">{ref.referringFacility}</strong>
                </p>
                <p className="text-xs text-teal-700 font-semibold mt-1 line-clamp-1">
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
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-lg shadow-2xs">
                      {selectedRef.patientName.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-bold text-slate-900">{selectedRef.patientName}</h2>
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold uppercase border border-rose-200">
                          {selectedRef.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        ABHA: <strong className="text-teal-700 font-bold">{selectedRef.abhaNumber}</strong>
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
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 text-xs font-bold transition shadow-2xs"
                >
                  <QrCode className="w-4 h-4 text-teal-600" />
                  <span>Scan / View ABHA Record</span>
                </button>
              </div>

              {/* State Machine Action Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Referral Lifecycle State Management:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedRef.status === 'initiated' && (
                    <button
                      onClick={() => handleUpdateStatus('accepted', 'Referral accepted. Specialist obstetric bed reserved.')}
                      disabled={actionLoading}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>1. Accept Referral & Reserve Bed</span>
                    </button>
                  )}

                  {selectedRef.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus('consulted', 'Patient arrived at DH OPD. Specialist consultation completed.')}
                      disabled={actionLoading}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>2. Mark Patient Arrived & Consulted</span>
                    </button>
                  )}

                  {(selectedRef.status === 'consulted' || selectedRef.status === 'accepted') && (
                    <button
                      onClick={() => setShowCounterModal(true)}
                      disabled={actionLoading}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>3. Counter-Refer to PHC with Care Protocol</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Clinical Referral Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Clinical Summary & Vitals (from Referring Medical Officer)
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {selectedRef.clinicalSummary}
                </p>
                {selectedRef.vitals && (
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold">
                      BP: {selectedRef.vitals.systolicBP}/{selectedRef.vitals.diastolicBP} mmHg
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold">
                      FHR: {selectedRef.vitals.fetalHeartRate || 140} bpm
                    </span>
                  </div>
                )}
              </div>

              {/* Stateful Audit Timeline */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Stateful Referral Progress Timeline
                </span>
                <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedRef.timeline.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-teal-600 ring-4 ring-white shadow-2xs" />
                      <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-slate-900 uppercase">{step.status}</span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{step.note}</p>
                        <span className="text-[10px] text-slate-400 block pt-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4 text-slate-900 animate-fadeIn">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-indigo-600" />
              <span>Counter-Refer Back to PHC (Care Continuity)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Sends diagnostic findings and local follow-up instructions back to the primary health center and ASHA worker.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Specialist Instructions & Follow-up Schedule
              </label>
              <textarea
                rows={4}
                value={counterNotes}
                onChange={(e) => setCounterNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowCounterModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                रद्द करें
              </button>
              <button
                onClick={handleCounterRefer}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
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
        patientData={selectedPatientForAbha || undefined}
      />
    </div>
  );
};

export default HospitalReferrals;
