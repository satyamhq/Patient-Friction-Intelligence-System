import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  User,
  Ticket,
  CheckCircle2,
  Phone,
  AlertTriangle,
  PlayCircle,
  RefreshCw,
  FileText,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/doctor/queue');
      if (res.data?.success) {
        setAppointments(res.data.queue || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    setActionLoading(appointmentId);
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status });
      loadAppointments();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Calendar className="w-7 h-7 text-blue-600" />
            Today's Patient Queue & Appointments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time consultation flow with integrated social friction diagnostics and clinical record linkages.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAppointments} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="Queue Is Clear"
          description="There are no patients currently queued for consultation today."
        />
      ) : (
        <div className="space-y-3">
          {appointments.map((item: any, idx: number) => {
            const aptId = item.appointmentId || item.id || item._id;
            const isServing = item.status === 'in_progress';

            return (
              <div
                key={aptId || idx}
                className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isServing
                    ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-card hover:border-slate-300'
                }`}
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Token Pill */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black text-sm shrink-0 ${
                      isServing
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">Token</span>
                    <span>#{item.queueNumber || idx + 1}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-slate-900 dark:text-white">
                        {item.name || item.patientCode || 'Patient'}
                      </span>
                      {item.age && item.gender && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          ({item.age}y • {item.gender})
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.urgencyLevel === 'urgent' || item.urgencyLevel === 'emergency'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.urgencyLevel || 'Routine'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {item.appointmentTime || '09:00 AM'}
                      </span>
                      {item.phone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3.5 h-3.5" />
                          {item.phone}
                        </span>
                      )}
                      {item.reasonForVisit && (
                        <span className="text-slate-700 dark:text-slate-300 italic truncate max-w-xs">
                          "{item.reasonForVisit}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Friction Indicators & Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  {item.frictionScore !== undefined && item.frictionScore !== null && (
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Friction Score</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.frictionScore}/100
                      </div>
                    </div>
                  )}

                  {isServing ? (
                    <button
                      onClick={() => handleUpdateStatus(aptId, 'completed')}
                      disabled={actionLoading === aptId}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Completed
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(aptId, 'in_progress')}
                      disabled={actionLoading === aptId}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Call Patient
                    </button>
                  )}

                  <Link
                    to={`/doctor/medical-records?patientId=${item.patientId || aptId}`}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Consultation Record
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
