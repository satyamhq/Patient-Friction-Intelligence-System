import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  ShieldAlert,
  Activity,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  AlertCircle,
  MapPin,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { doctorService } from '../../services/doctorService';

export const DoctorPatientReview: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientDetail, setPatientDetail] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await doctorService.getQueue();
        setPatients(res.queue);
        if (res.queue.length > 0) {
          handleSelectPatient(res.queue[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch patient list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const handleSelectPatient = async (id: string) => {
    try {
      const res = await doctorService.getPatientDetail(id);
      setSelectedPatient(res.patient);
      setPatientDetail(res);
    } catch (err) {
      console.error('Failed to load patient detail:', err);
    }
  };

  const filtered = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.abhaId?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Longitudinal Patient Health Records</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Inspect ABDM/ABHA unified record, previous consultations, and non-clinical friction profiles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Patient List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col h-[700px]">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, code or ABHA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filtered.map((p) => {
              const isSelected = selectedPatient?._id === p.id || selectedPatient?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPatient(p.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all text-left ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-500/10 border-blue-500/50 shadow-sm'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">{p.name}</span>
                    <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">{p.patientCode}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {p.age}y &bull; {p.gender} &bull; {p.residenceType}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Friction Score</span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded ${
                        p.frictionScore > 65
                          ? 'bg-rose-500/10 text-rose-600'
                          : 'bg-emerald-500/10 text-emerald-600'
                      }`}
                    >
                      {p.frictionScore}/100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Patient Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPatient ? (
            <>
              {/* Header card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-600">
                      ABDM Linked Profile
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      {selectedPatient.name}
                    </h2>
                    <p className="text-xs text-slate-400">
                      ABHA ID: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{selectedPatient.abhaId || '91-4829-1029-4821'}</span> &bull; Patient Code: {selectedPatient.patientCode}
                    </p>
                  </div>
                  <div className="flex gap-2 text-center">
                    <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-base font-bold text-slate-900 dark:text-white">{selectedPatient.age}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Age</div>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-base font-bold text-slate-900 dark:text-white capitalize">{selectedPatient.gender}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Gender</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Location</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedPatient.location?.city || 'Phagwara'}, {selectedPatient.location?.state || 'Punjab'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Language</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedPatient.preferredLanguage || 'Hindi'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Transport Mode</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                      {selectedPatient.transportAvailability || 'Moderate'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Financial Status</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                      {selectedPatient.financialAccessibility?.replace('_', ' ') || 'Constrained'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Friction & Risk Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-500" /> Patient Friction Score
                    </span>
                    <span className="text-xs font-bold text-blue-600">
                      {patientDetail?.frictionProfile?.overallFrictionScore || patientDetail?.frictionProfile?.overallScore || 58}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Primary operational barriers detected:
                  </p>
                  <div className="mt-3 space-y-1.5">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Travel Distance & Bus Gaps</span>
                      <span className="font-bold text-rose-500">High Resistance</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Daily Wage Loss Constraint</span>
                      <span className="font-bold text-amber-500">Moderate Resistance</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-500" /> Care Completion Risk
                    </span>
                    <span className="text-xs font-bold text-rose-600">
                      {patientDetail?.careRisk?.riskCategory || 'MODERATE'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Estimated probability of full treatment cycle completion:
                  </p>
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {patientDetail?.careRisk?.careCompletionProbability || 68}%
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Recommended: Proactive SMS recall & doorstep ASHA accompaniment
                    </p>
                  </div>
                </div>
              </div>

              {/* Longitudinal Journey Events */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" /> Healthcare Journey Event Timeline
                </h3>

                <div className="space-y-4">
                  {patientDetail?.journeys?.length > 0 ? (
                    patientDetail.journeys.map((j: any, i: number) => (
                      <div key={j._id || i} className="flex items-start gap-3 text-xs">
                        <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-600 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            Stage: {j.stage} &bull; <span className="text-blue-600">{j.status}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5">{j.notes}</p>
                          <span className="text-[10px] text-slate-400">{j.facilityName || 'Health Center'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 py-4 text-center">
                      Referral intake registered. No past consultations on file.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
              Select a patient from the left column to inspect their longitudinal record
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
