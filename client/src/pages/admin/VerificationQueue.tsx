import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  ShieldCheck,
  Stethoscope,
  Building2,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  FileCheck,
} from 'lucide-react';

export const VerificationQueue: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'doctors' | 'hospitals' | 'ashaWorkers' | 'governmentOfficials'>('doctors');
  const [queue, setQueue] = useState<any>({
    doctors: [],
    hospitals: [],
    ashaWorkers: [],
    governmentOfficials: [],
  });
  const [totalPending, setTotalPending] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/verification-queue');
      if (res.data?.success) {
        setQueue(res.data.queue || {});
        setTotalPending(res.data.totalPending || 0);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to load verification queue' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleVerify = async (entityType: string, id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    setFeedback(null);
    try {
      const res = await api.post(`/admin/verify/${entityType}/${id}`, { action });
      if (res.data?.success) {
        setFeedback({
          type: 'success',
          text: res.data.message || `Entity ${action === 'approve' ? 'verified' : 'rejected'} successfully.`,
        });
        loadQueue();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to process verification' });
    } finally {
      setActionLoading(null);
    }
  };

  const currentItems = queue[activeTab] || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-teal-600" />
            Healthcare Verification Queue
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Validate credentials, medical registrations, and facility licenses before permitting clinical actions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {totalPending} Pending Approvals
          </span>
          <Button variant="outline" size="sm" onClick={loadQueue} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
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

      {/* Role Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'doctors'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctors</span>
          <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-white/20">
            {queue.doctors?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('hospitals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'hospitals'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Hospitals</span>
          <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-white/20">
            {queue.hospitals?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ashaWorkers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'ashaWorkers'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ASHA Workers</span>
          <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-white/20">
            {queue.ashaWorkers?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('governmentOfficials')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'governmentOfficials'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Govt Officials</span>
          <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-white/20">
            {queue.governmentOfficials?.length || 0}
          </span>
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : currentItems.length === 0 ? (
        <EmptyState
          title="No Pending Verifications"
          description={`All registered ${activeTab} have been reviewed. There are no pending applications.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentItems.map((item: any) => {
            const id = item.id || item._id;
            const entityType =
              activeTab === 'doctors'
                ? 'doctor'
                : activeTab === 'hospitals'
                ? 'hospital'
                : activeTab === 'ashaWorkers'
                ? 'asha'
                : 'government';

            return (
              <div
                key={id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </h3>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {id}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      <Clock className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl">
                    {item.email && (
                      <div>
                        <span className="text-slate-400 block">Email:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">{item.email}</span>
                      </div>
                    )}
                    {item.phone && (
                      <div>
                        <span className="text-slate-400 block">Phone:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{item.phone}</span>
                      </div>
                    )}
                    {item.medicalRegistrationNumber && (
                      <div>
                        <span className="text-slate-400 block">Medical Reg No:</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{item.medicalRegistrationNumber}</span>
                      </div>
                    )}
                    {item.specialization && (
                      <div>
                        <span className="text-slate-400 block">Specialty:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{item.specialization}</span>
                      </div>
                    )}
                    {item.city && (
                      <div>
                        <span className="text-slate-400 block">Location:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{item.city}, {item.state || 'Punjab'}</span>
                      </div>
                    )}
                    {item.assignedVillage && (
                      <div>
                        <span className="text-slate-400 block">Assigned Area:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{item.assignedVillage}</span>
                      </div>
                    )}
                    {item.officialDesignation && (
                      <div>
                        <span className="text-slate-400 block">Designation:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{item.officialDesignation}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleVerify(entityType, id, 'approve')}
                    disabled={actionLoading === id}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve & Verify
                  </button>
                  <button
                    onClick={() => handleVerify(entityType, id, 'reject')}
                    disabled={actionLoading === id}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 dark:text-rose-300 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
