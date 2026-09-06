import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Activity,
  Users,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  RefreshCw,
  DoorOpen,
  Bed,
} from 'lucide-react';

export const HospitalOperations: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOperations = async () => {
    setIsLoading(true);
    try {
      const [qRes, dRes] = await Promise.all([
        api.get('/appointments/queue/today'),
        api.get('/hospitals/departments'),
      ]);

      if (qRes.data?.success) {
        setQueue(qRes.data.appointments || []);
      }
      if (dRes.data?.success) {
        setDepartments(dRes.data.departments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOperations();
  }, []);

  const totalWaiting = queue.filter((a) => a.status === 'scheduled' || a.status === 'checked_in').length;
  const totalInConsult = queue.filter((a) => a.status === 'in_progress').length;
  const totalCompleted = queue.filter((a) => a.status === 'completed').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Building2 className="w-7 h-7 text-purple-600" />
            Hospital Operations & Patient Flow
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time OPD triage tokens, active consultation rooms, and department bed allocations.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadOperations} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Flow
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Waiting in Lobby</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            {totalWaiting}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Checked-in OPD tokens</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Consultation</span>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-3 text-3xl font-black text-blue-600">
            {totalInConsult}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active doctor encounters</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Today</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-600">
            {totalCompleted}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Discharged & prescribed</p>
        </div>
      </div>

      {/* Live Queue Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-indigo-600" />
            Today's Patient OPD Queue
          </h2>
          <span className="text-xs font-mono text-slate-400">Total Tokens: {queue.length}</span>
        </div>

        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={4} />
          </div>
        ) : queue.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No patient queue tokens active for today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Token #</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Time Slot</th>
                  <th className="px-6 py-4">Urgency</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {queue.map((apt: any, idx: number) => (
                  <tr key={apt.id || apt._id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-black text-slate-900 dark:text-white font-mono">
                      #{apt.queueNumber || idx + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {apt.departmentName || 'General OPD'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {apt.timeSlot || '09:00 AM'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                          apt.urgencyLevel === 'urgent' || apt.urgencyLevel === 'emergency'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {apt.urgencyLevel || 'Routine'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                          apt.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : apt.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
