import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  GitFork,
  Calendar,
  Activity,
  ChevronRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { doctorService } from '../../services/doctorService';

export const DoctorDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, statsRes, queueRes] = await Promise.all([
          doctorService.getProfile(),
          doctorService.getStats(),
          doctorService.getQueue(),
        ]);
        setProfile(profRes.doctor);
        setStats(statsRes.stats);
        setQueue(queueRes.queue.slice(0, 5));
      } catch (err) {
        console.error('Failed to load doctor dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-blue-100 mb-3 border border-white/20">
            <Stethoscope className="w-3.5 h-3.5" /> OPD Consultation Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome, {profile?.name || 'Dr. Medical Officer'}
          </h1>
          <p className="text-sm text-blue-100 max-w-xl mt-1 leading-relaxed">
            {profile?.hospitalName || 'Civil Hospital / Primary Health Center'} &bull; Department of{' '}
            {profile?.department || 'General Medicine'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/doctor/queue"
            className="px-5 py-2.5 rounded-xl bg-white text-blue-600 font-semibold text-sm hover:bg-blue-50 shadow-md transition-all flex items-center gap-2"
          >
            Open Consultation Desk <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/hospital/referrals"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all flex items-center gap-2"
          >
            <GitFork className="w-4 h-4" /> Referrals Desk
          </Link>
        </div>
      </div>

      {/* Decision-support Alert Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Clinical Oversight Notice:</span> PFIS provides operational intelligence and
          non-clinical friction scoring (transit, daily wage loss, distance) to reduce appointment drop-outs. Diagnostic
          and treatment decisions remain under your autonomous medical judgment.
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Patients Waiting</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {queue.length > 0 ? queue.length + 12 : 14}
          </div>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 mt-1">
            <Activity className="w-3 h-3" /> Priority sorting by friction risk
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Consulted Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats?.patientsConsultedToday || 14}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> Avg consultation: 9 mins
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">High Risk Defaulters</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats?.highRiskFollowUpsPending || 6}
          </div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-1">
            <AlertTriangle className="w-3 h-3" /> ASHA revisit tasks issued
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lifetime Seen</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {profile?.totalPatientsConsulted || 1420}
          </div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 mt-1">
            <Sparkles className="w-3 h-3" /> 96% Care completion rate
          </span>
        </div>
      </div>

      {/* OPD Waiting Queue Preview */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active OPD Waiting Queue</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Patients ordered by non-clinical friction severity & urgent clinical need
            </p>
          </div>
          <Link
            to="/doctor/queue"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View Full Queue <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="pb-3 px-3">Patient Code</th>
                <th className="pb-3 px-3">Name & Age</th>
                <th className="pb-3 px-3">ABHA Number</th>
                <th className="pb-3 px-3">Friction Score</th>
                <th className="pb-3 px-3">Primary Non-Clinical Barrier</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {queue.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {item.patientCode}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                    <span className="text-xs text-slate-400 ml-2">
                      ({item.age}y, {item.gender})
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-xs text-slate-500">{item.abhaId}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        item.frictionScore > 65
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {item.frictionScore} / 100
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-xs text-slate-600 dark:text-slate-300">
                    {item.topBarriers?.[0] || 'Distance to facility'}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <Link
                      to="/doctor/queue"
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all inline-flex items-center gap-1"
                    >
                      Consult <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
