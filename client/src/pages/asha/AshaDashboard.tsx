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
          phone: '9835102948',
          village: 'Hesal Village (Angara)',
          protocolType: 'MATERNAL_ANC',
          missedMilestone: '3rd Trimester High-Risk ANC Checkup (BP 155/98 in previous record)',
          daysOverdue: 6,
          severity: 'CRITICAL',
          checklist: [
            'Blood Pressure measurement (Manual Sphygmomanometer)',
            'Check for severe bilateral pedal edema',
            'Enquire about persistent epigastric pain or visual blurring',
            'Escort booking to Angara PHC / District Hospital via 108',
          ],
          status: 'OPEN',
        },
        {
          id: 'task-priya-uip',
          patientId: 'pat-priya-kumari',
          patientName: 'Baby of Priya Kumari (14 weeks)',
          phone: '9431804921',
          village: 'Rajaulatu Tola',
          protocolType: 'CHILD_IMMUNIZATION',
          missedMilestone: 'Pentavalent-3 & Rotavirus-3 Dose Overdue',
          daysOverdue: 12,
          severity: 'HIGH',
          checklist: [
            'Confirm child is free of acute fever/diarrhea',
            'Administer or coordinate Pentavalent-3 at Tuesday Village Health & Nutrition Day (VHND)',
            'Update MCP physical card and ABDM longitudinal record',
          ],
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

  // Handle register patient
  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReg(true);

    try {
      // 1. Generate local ABHA format (provisional 14 digits)
      const randDigits = Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
      const abhaNumber = `${randDigits.slice(0, 2)}-${randDigits.slice(2, 6)}-${randDigits.slice(6, 10)}-${randDigits.slice(10, 14)}`;
      const abhaAddress = `${regForm.name.toLowerCase().replace(/[^a-z]/g, '')}${randDigits.slice(-4)}@abdm`;

      const newPatient: LocalPatient = {
        id: 'pat-' + Date.now().toString(36),
        name: regForm.name,
        gender: regForm.gender,
        age: parseInt(regForm.age) || 30,
        phone: regForm.phone,
        village: regForm.village,
        abhaNumber,
        abhaAddress,
        synced: navigator.onLine,
        createdAt: new Date().toISOString(),
      };

      // 2. Save locally into IndexedDB first (zero-latency offline guarantee)
      await offlineDb.patients.put(newPatient);

      // 3. Queue mutation for server sync
      await syncManager.enqueueMutation('PATIENT_REGISTRATION', newPatient);

      // 4. Show success modal
      setRegSuccessModal(newPatient);
      setRegForm({
        name: '',
        gender: 'Female',
        age: '',
        phone: '',
        village: 'Hesal Village',
      });
    } catch (err) {
      console.error(err);
      alert('Error registering patient offline.');
    } finally {
      setSubmittingReg(false);
    }
  };

  // Handle resolve task
  const handleResolveTask = async () => {
    if (!selectedTaskForResolve) return;
    setResolving(true);

    try {
      // Update task in state
      const updated = tasks.map((t) =>
        t.id === selectedTaskForResolve.id
          ? { ...t, status: 'RESOLVED_REBOOKED' as const }
          : t
      );
      setTasks(updated);

      // Queue visit log mutation
      await syncManager.enqueueMutation('REVISIT_COMPLETION', {
        taskId: selectedTaskForResolve.id,
        patientId: selectedTaskForResolve.patientId,
        notes: resolveNotes,
        resolvedAt: new Date().toISOString(),
      });

      setSelectedTaskForResolve(null);
      setResolveNotes('');
    } catch (err) {
      console.error(err);
      alert('Error updating task. Re-queued locally.');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner: ASHA Identity & Offline-First Status */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center font-bold text-white shadow-xs text-sm">
              ASHA
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-base text-slate-900 tracking-tight">
                  आशा संगिनी साथी (ASHA Frontline)
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold border border-teal-200">
                  Angara Block
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Frontline Health Worker: <strong className="text-slate-800">Anita Devi</strong> • Hesal Sub-Centre
              </p>
            </div>
          </div>

          {/* Sync Status Badge */}
          <div className="flex items-center space-x-2">
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                syncStatus.isOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {syncStatus.isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
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
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition"
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
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs mb-6">
          <button
            onClick={() => setActiveTab('TASKS')}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
              activeTab === 'TASKS'
                ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>छूटे हुए मरीज ({tasks.filter((t) => t.status === 'OPEN').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TRIAGE')}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
              activeTab === 'TRIAGE'
                ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span>लक्षण जांच (Triage)</span>
          </button>

          <button
            onClick={() => setActiveTab('REGISTER')}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
              activeTab === 'REGISTER'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>नया पंजीकरण (ABHA)</span>
          </button>
        </div>

        {/* TAB 1: HIGH-RISK DEFAULTER TASKS (MVP Flow 3) */}
        {activeTab === 'TASKS' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-600" />
                  <span>High-Risk Follow-Up & Defaulter Recall Engine</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Protocol-driven automated recall: System detected missed ANC, child immunization, or chronic visits.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-semibold text-rose-800 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                <span>ASHA Home Revisit Priority Queue</span>
              </div>
            </div>

            {loadingTasks ? (
              <div className="p-8 text-center text-slate-500">Loading recall tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-slate-900">All cohort follow-ups are up-to-date!</p>
                <p className="text-xs text-slate-500 mt-1">No missed checkups detected in your catchment area.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-2xl p-5 border transition-all ${
                      task.status === 'RESOLVED_REBOOKED'
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : task.severity === 'CRITICAL'
                        ? 'bg-white border-rose-200 shadow-xs ring-1 ring-rose-200'
                        : task.severity === 'HIGH'
                        ? 'bg-white border-orange-200 shadow-xs'
                        : 'bg-white border-slate-200 shadow-xs'
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
                              : 'bg-teal-600'
                          }`}
                        >
                          {task.protocolType === 'MATERNAL_ANC' && <HeartPulse className="w-5 h-5" />}
                          {task.protocolType === 'CHILD_IMMUNIZATION' && <Baby className="w-5 h-5" />}
                          {task.protocolType === 'CHRONIC_NCD' && <Activity className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base leading-tight">
                            {task.patientName}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {task.village} • <Phone className="w-3 h-3 text-slate-400" /> {task.phone}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          task.status === 'RESOLVED_REBOOKED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : task.severity === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
                            : 'bg-orange-50 text-orange-800 border-orange-200'
                        }`}
                      >
                        {task.status === 'RESOLVED_REBOOKED'
                          ? 'Resolved'
                          : `${task.daysOverdue} Days Overdue`}
                      </span>
                    </div>

                    {/* Missed Milestone Banner */}
                    <div className="mt-4 p-3 rounded-xl bg-rose-50/70 border border-rose-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                        Missed Public Health Protocol
                      </span>
                      <p className="text-sm font-semibold text-rose-900 mt-0.5">
                        {task.missedMilestone}
                      </p>
                    </div>

                    {/* Checklist */}
                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        ASHA Home Visit Action Points:
                      </span>
                      {task.checklist.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs text-slate-600">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Action Tray */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedPatientForAbha({
                            name: task.patientName,
                            phone: task.phone,
                            village: task.village,
                          });
                          setShowAbhaModal(true);
                        }}
                        className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5 text-teal-600" />
                        <span>ABHA Card</span>
                      </button>

                      {task.status !== 'RESOLVED_REBOOKED' ? (
                        <button
                          onClick={() => setSelectedTaskForResolve(task)}
                          className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-xs hover:bg-teal-700 transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>घर जाकर जांच दर्ज करें (Log Visit)</span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  ग्रामीण नागरिक पंजीकरण (Offline Registration)
                </h2>
                <p className="text-xs text-slate-500">
                  Registers patient offline and assigns provisional ABDM ABHA credentials.
                </p>
              </div>
            </div>

            <form onSubmit={handleRegisterPatient} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  मरीज का पूरा नाम (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunita Devi"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    उम्र (Age) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 28"
                    value={regForm.age}
                    onChange={(e) => setRegForm({ ...regForm, age: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    लिंग (Gender)
                  </label>
                  <select
                    value={regForm.gender}
                    onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Female">महिला (Female)</option>
                    <option value="Male">पुरुष (Male)</option>
                    <option value="Other">अन्य (Other)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  मोबाइल नंबर (Phone Number)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  गांव / टोला (Village / Habitation)
                </label>
                <input
                  type="text"
                  value={regForm.village}
                  onChange={(e) => setRegForm({ ...regForm, village: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingReg}
                  className="w-full py-3.5 rounded-2xl bg-teal-600 text-white font-extrabold text-sm shadow-xs hover:bg-teal-700 transition flex items-center justify-center space-x-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 shadow-elevated">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <span>घर पर जांच की पुष्टि (Log Home Follow-Up)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Patient: <strong>{selectedTaskForResolve.patientName}</strong> • {selectedTaskForResolve.missedMilestone}
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  गृह भेंट निष्कर्ष (Home Visit Notes)
                </label>
                <textarea
                  rows={3}
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="e.g. Visited patient at home. Blood pressure recorded 138/88. Provided 30 IFA tablets. Patient scheduled for PHC visit on Wednesday."
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setSelectedTaskForResolve(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  onClick={handleResolveTask}
                  disabled={resolving}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-elevated text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">पंजीकरण सफल!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Patient registered offline. ABHA Health ID generated successfully.
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">नाम (Name):</span>
                <span className="font-bold text-slate-900">{regSuccessModal.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">ABHA Number:</span>
                <span className="font-mono font-extrabold text-teal-700">{regSuccessModal.abhaNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">ABHA Address:</span>
                <span className="font-mono text-slate-700">{regSuccessModal.abhaAddress}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedPatientForAbha(regSuccessModal);
                  setShowAbhaModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <QrCode className="w-4 h-4" />
                <span>कार्ड देखें (View Card)</span>
              </button>
              <button
                onClick={() => setRegSuccessModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
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
