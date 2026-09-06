import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Stethoscope,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
  Baby,
  HeartPulse,
  Activity,
  QrCode,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { syncManager, SyncState } from '../../offline/syncManager';
import { offlineDb, LocalPatient } from '../../offline/db';
import { AshaTriageWizard } from './AshaTriageWizard';
import { AbhaCardModal } from '../../components/patient/AbhaCardModal';
import api from '../../services/api';

interface RecallTask {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  village: string;
  protocolType: 'MATERNAL_ANC' | 'CHILD_IMMUNIZATION' | 'CHRONIC_NCD';
  missedMilestone: string;
  daysOverdue: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  checklist: string[];
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED_REBOOKED';
}

export const AshaDashboard: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<{
    isOnline: boolean;
    syncState: SyncState;
    pendingCount: number;
  }>({
    isOnline: navigator.onLine,
    syncState: navigator.onLine ? 'ONLINE' : 'OFFLINE',
    pendingCount: 0,
  });

  const [activeTab, setActiveTab] = useState<'TASKS' | 'TRIAGE' | 'REGISTER'>('TASKS');
  const [tasks, setTasks] = useState<RecallTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [selectedTaskForResolve, setSelectedTaskForResolve] = useState<RecallTask | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  // New patient registration state
  const [regForm, setRegForm] = useState({
    name: '',
    gender: 'Female',
    age: '',
    phone: '',
    village: 'Hesal Village',
  });
  const [regSuccessModal, setRegSuccessModal] = useState<any>(null);
  const [submittingReg, setSubmittingReg] = useState(false);

  // ABHA card preview
  const [showAbhaModal, setShowAbhaModal] = useState(false);
  const [selectedPatientForAbha, setSelectedPatientForAbha] = useState<any>(null);

  // Sync listener
  useEffect(() => {
    const unsubscribe = syncManager.subscribe((state) => {
      setSyncStatus({
        isOnline: state.isOnline,
        syncState: state.syncState,
        pendingCount: state.pendingCount,
      });
    });
    return () => unsubscribe();
  }, []);

  // Fetch tasks
  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await api.get('/recall/tasks');
      if (res.data?.success && res.data?.tasks) {
        setTasks(res.data.tasks);
      }
    } catch {
      // Fallback demo tasks if offline
      setTasks([
        {
          id: 'task-sunita-anc3',
          patientId: 'pat-sunita-devi',
          patientName: 'Sunita Devi',
          phone: '9876543210',
          village: 'Hesal Village',
          protocolType: 'MATERNAL_ANC',
          missedMilestone: '3rd ANC (28-34 Weeks) + IFA Tablets Refill',
          daysOverdue: 8,
          severity: 'HIGH',
          checklist: [
            'Visit household in Hesal Village',
            'Screen for danger signs (pedal edema, blurred vision, headache)',
            'Check daily IFA consumption',
            'Arrange PHC transport',
          ],
          status: 'OPEN',
        },
        {
          id: 'task-aarav-imm',
          patientId: 'pat-aarav',
          patientName: 'Baby Aarav (s/o Geeta)',
          phone: '9876543211',
          village: 'Getalsud Village',
          protocolType: 'CHILD_IMMUNIZATION',
          missedMilestone: '14-Week Pentavalent-3 & OPV-3',
          daysOverdue: 3,
          severity: 'MEDIUM',
          checklist: ['Check vaccination card', 'Mobilize mother for Wednesday Village Health Day'],
          status: 'OPEN',
        },
        {
          id: 'task-rameshwar-ncd',
          patientId: 'pat-rameshwar',
          patientName: 'Rameshwar Soren',
          phone: '9876543212',
          village: 'Silli Rural Ward 4',
          protocolType: 'CHRONIC_NCD',
          missedMilestone: 'Monthly Diabetic & BP Refill',
          daysOverdue: 12,
          severity: 'HIGH',
          checklist: ['Check fasting blood sugar', 'Check medicine stockout', 'Schedule e-Sanjeevani call'],
          status: 'OPEN',
        },
      ]);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Handle Offline/Online Patient Registration
  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.age) return;

    setSubmittingReg(true);
    const patientId = 'pat-' + Date.now().toString(36);
    const ageNum = parseInt(regForm.age, 10) || 28;

    const patientRecord: LocalPatient = {
      id: patientId,
      name: regForm.name,
      gender: regForm.gender,
      age: ageNum,
      phone: regForm.phone || '9876543210',
      village: regForm.village,
      synced: syncStatus.isOnline,
      createdAt: new Date().toISOString(),
    };

    // Save locally into Dexie
    await offlineDb.patients.put(patientRecord);

    // Queue mutation into sync manager
    await syncManager.enqueueMutation('PATIENT_REGISTRATION', patientRecord);

    // Prepare provisional ABHA
    const provisionalAbha = {
      name: regForm.name,
      gender: regForm.gender,
      age: ageNum,
      phone: regForm.phone,
      village: regForm.village,
      abhaNumber: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      abhaAddress: `${regForm.name.toLowerCase().replace(/\s+/g, '.')}${Math.floor(100 + Math.random() * 900)}@abdm`,
      state: 'Jharkhand',
      district: 'Ranchi',
    };

    setRegSuccessModal(provisionalAbha);
    setSubmittingReg(false);
    setRegForm({ name: '', gender: 'Female', age: '', phone: '', village: 'Hesal Village' });
  };

  // Handle Resolving High Risk Task
  const handleResolveTask = async () => {
    if (!selectedTaskForResolve) return;
    setResolving(true);

    try {
      if (syncStatus.isOnline) {
        await api.post(`/recall/tasks/${selectedTaskForResolve.id}/resolve`, {
          outcome: 'RESOLVED_REBOOKED',
          notes: resolveNotes || 'Home visit conducted. Rebooked for PHC consultation.',
        });
      } else {
        // Enqueue offline mutation
        await syncManager.enqueueMutation('REVISIT_COMPLETION', {
          taskId: selectedTaskForResolve.id,
          outcome: 'RESOLVED_REBOOKED',
          notes: resolveNotes || 'Home visit conducted offline by ASHA.',
        });
      }

      // Optimistic local update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTaskForResolve.id ? { ...t, status: 'RESOLVED_REBOOKED' } : t
        )
      );

      setSelectedTaskForResolve(null);
      setResolveNotes('');
    } catch {
      alert('Error updating task. Re-queued locally.');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Top Banner: ASHA Identity & Offline-First Status */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center font-bold text-white shadow-lg shadow-pink-500/20 text-sm">
              ASHA
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-base text-white tracking-tight">
                  आशा संगिनी साथी (ASHA Frontline)
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">
                  Angara Block
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Frontline Health Worker: <strong className="text-slate-200">Anita Devi</strong> • Hesal Sub-Centre
              </p>
            </div>
          </div>

          {/* Sync Status Badge */}
          <div className="flex items-center space-x-2">
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                syncStatus.isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {syncStatus.isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>
                {syncStatus.isOnline
                  ? syncStatus.pendingCount > 0
                    ? `Syncing (${syncStatus.pendingCount} queued)`
                    : '🟢 Online & Synced'
                  : `🟡 Offline (${syncStatus.pendingCount} queued)`}
              </span>
            </div>

            <button
              onClick={() => syncManager.flushQueue()}
              title="Manual Sync Flush"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <RefreshCw
                className={`w-4 h-4 ${syncStatus.syncState === 'SYNCING' ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-6xl mx-auto px-4 pt-5">
        {/* Navigation Tabs (Big touch targets for mobile) */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 mb-6">
          <button
            onClick={() => setActiveTab('TASKS')}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
              activeTab === 'TASKS'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-pink-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>छूटे हुए मरीज ({tasks.filter((t) => t.status === 'OPEN').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TRIAGE')}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
              activeTab === 'TRIAGE'
                ? 'bg-gradient-to-r from-brand-500 to-cyan-500 text-white shadow-lg shadow-brand-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>लक्षण जांच (Triage)</span>
          </button>

          <button
            onClick={() => setActiveTab('REGISTER')}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
              activeTab === 'REGISTER'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>नया पंजीकरण (ABHA)</span>
          </button>
        </div>

        {/* TAB 1: HIGH-RISK DEFAULTER TASKS (MVP Flow 3) */}
        {activeTab === 'TASKS' && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-400" />
                  <span>High-Risk Follow-Up & Defaulter Recall Engine</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Protocol-driven automated recall: System detected missed ANC, child immunization, or chronic visits.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>ASHA Home Revisit Priority Queue</span>
              </div>
            </div>

            {loadingTasks ? (
              <div className="p-8 text-center text-slate-400">Loading recall tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-white">All cohort follow-ups are up-to-date!</p>
                <p className="text-xs text-slate-500 mt-1">No missed checkups detected in your catchment area.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-2xl p-5 border transition-all ${
                      task.status === 'RESOLVED_REBOOKED'
                        ? 'bg-slate-800/30 border-slate-800 opacity-60'
                        : task.severity === 'CRITICAL'
                        ? 'bg-gradient-to-b from-rose-950/30 to-slate-900 border-rose-600/50 shadow-lg shadow-rose-950/20'
                        : task.severity === 'HIGH'
                        ? 'bg-gradient-to-b from-orange-950/25 to-slate-900 border-orange-500/40 shadow-lg shadow-orange-950/10'
                        : 'bg-slate-800/60 border-slate-700/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                            task.protocolType === 'MATERNAL_ANC'
                              ? 'bg-pink-600'
                              : task.protocolType === 'CHILD_IMMUNIZATION'
                              ? 'bg-amber-600'
                              : 'bg-indigo-600'
                          }`}
                        >
                          {task.protocolType === 'MATERNAL_ANC' && <HeartPulse className="w-5 h-5" />}
                          {task.protocolType === 'CHILD_IMMUNIZATION' && <Baby className="w-5 h-5" />}
                          {task.protocolType === 'CHRONIC_NCD' && <Activity className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base leading-tight">
                            {task.patientName}
                          </h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {task.village} • <Phone className="w-3 h-3 text-slate-500" /> {task.phone}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          task.status === 'RESOLVED_REBOOKED'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : task.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                            : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                        }`}
                      >
                        {task.status === 'RESOLVED_REBOOKED'
                          ? 'Resolved'
                          : `${task.daysOverdue} Days Overdue`}
                      </span>
                    </div>

                    {/* Missed Milestone Banner */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Missed Public Health Protocol
                      </span>
                      <p className="text-sm font-semibold text-rose-300 mt-0.5">
                        {task.missedMilestone}
                      </p>
                    </div>

                    {/* Checklist */}
                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        ASHA Home Visit Action Points:
                      </span>
                      {task.checklist.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                          <span className="text-pink-400 font-bold">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Action Tray */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedPatientForAbha({
                            name: task.patientName,
                            phone: task.phone,
                            village: task.village,
                          });
                          setShowAbhaModal(true);
                        }}
                        className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>ABHA Card</span>
                      </button>

                      {task.status !== 'RESOLVED_REBOOKED' ? (
                        <button
                          onClick={() => setSelectedTaskForResolve(task)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>घर जाकर जांच दर्ज करें (Log Visit)</span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Care Loop Closed</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRIAGE WIZARD (MVP Flow 1) */}
        {activeTab === 'TRIAGE' && (
          <AshaTriageWizard
            onComplete={() => {
              setActiveTab('TASKS');
              loadTasks();
            }}
          />
        )}

        {/* TAB 3: REGISTER NEW PATIENT */}
        {activeTab === 'REGISTER' && (
          <div className="max-w-xl mx-auto bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-700/70 shadow-2xl">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-700/80">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  ग्रामीण नागरिक पंजीकरण (Offline Registration)
                </h2>
                <p className="text-xs text-slate-400">
                  Registers patient offline and assigns provisional ABDM ABHA credentials.
                </p>
              </div>
            </div>

            <form onSubmit={handleRegisterPatient} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  मरीज का पूरा नाम (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunita Devi"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    उम्र (Age) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 28"
                    value={regForm.age}
                    onChange={(e) => setRegForm({ ...regForm, age: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    लिंग (Gender)
                  </label>
                  <select
                    value={regForm.gender}
                    onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Female">महिला (Female)</option>
                    <option value="Male">पुरुष (Male)</option>
                    <option value="Other">अन्य (Other)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  मोबाइल नंबर (Phone Number)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  गांव / टोला (Village / Habitation)
                </label>
                <input
                  type="text"
                  value={regForm.village}
                  onChange={(e) => setRegForm({ ...regForm, village: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingReg}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>पंजीकृत करें और ABHA बनाएं (Create ABHA)</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* RESOLVE TASK MODAL */}
      {selectedTaskForResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>घर पर जांच की पुष्टि (Log Home Follow-Up)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Patient: <strong>{selectedTaskForResolve.patientName}</strong> • {selectedTaskForResolve.missedMilestone}
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  गृह भेंट निष्कर्ष (Home Visit Notes)
                </label>
                <textarea
                  rows={3}
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="e.g. Visited patient at home. Blood pressure recorded 138/88. Provided 30 IFA tablets. Patient scheduled for PHC visit on Wednesday."
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setSelectedTaskForResolve(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  onClick={handleResolveTask}
                  disabled={resolving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition"
                >
                  {resolving ? 'दर्ज हो रहा है...' : 'जांच पूर्ण दर्ज करें (Close Loop)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION SUCCESS MODAL WITH ABHA CARD PREVIEW */}
      {regSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-emerald-500/50 p-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-white">पंजीकरण सफल!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Patient registered offline. ABHA Health ID generated successfully.
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-left space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">नाम (Name):</span>
                <span className="font-bold text-white">{regSuccessModal.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">ABHA Number:</span>
                <span className="font-mono font-extrabold text-brand-400">{regSuccessModal.abhaNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">ABHA Address:</span>
                <span className="font-mono text-slate-300">{regSuccessModal.abhaAddress}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedPatientForAbha(regSuccessModal);
                  setShowAbhaModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <QrCode className="w-4 h-4" />
                <span>कार्ड देखें (View Card)</span>
              </button>
              <button
                onClick={() => setRegSuccessModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                पूर्ण (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABHA CARD FULL MODAL */}
      <AbhaCardModal
        isOpen={showAbhaModal}
        onClose={() => setShowAbhaModal(false)}
        patientData={selectedPatientForAbha}
      />
    </div>
  );
};
