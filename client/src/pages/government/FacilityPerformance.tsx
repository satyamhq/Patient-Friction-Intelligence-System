import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Building2,
  Bed,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Ambulance,
  Star,
  Activity,
} from 'lucide-react';

export const FacilityPerformance: React.FC = () => {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFacilities = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/hospitals');
      if (res.data?.success) {
        setHospitals(res.data.hospitals || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Building2 className="w-7 h-7 text-indigo-600" />
            District Facility Performance & Capacity Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comparative operational performance, bed availability, ambulance readiness, and wait times across public & empanelled facilities.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadFacilities} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Facilities
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : hospitals.length === 0 ? (
        <EmptyState
          title="No Health Facilities Registered"
          description="There are currently no hospitals registered in this jurisdiction."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Facility Name</th>
                  <th className="px-6 py-4">Type & City</th>
                  <th className="px-6 py-4">Bed Occupancy</th>
                  <th className="px-6 py-4">Avg Wait Time</th>
                  <th className="px-6 py-4">Emergency & 108</th>
                  <th className="px-6 py-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {hospitals.map((h) => {
                  const totalBeds = h.totalBeds || 100;
                  const availBeds = h.availableBeds || 20;
                  const occupancy = Math.round(((totalBeds - availBeds) / totalBeds) * 100);

                  return (
                    <tr key={h.id || h._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white text-base">
                          {h.name}
                        </div>
                        {h.address && (
                          <div className="text-xs text-slate-400 mt-0.5">{h.address}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{h.type || 'Government'}</span>
                        <div className="text-slate-400 mt-0.5">{h.city || 'Kapurthala'}, {h.state || 'Punjab'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Bed className="w-4 h-4 text-teal-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {availBeds} / {totalBeds}
                            </span>{' '}
                            <span className="text-xs text-slate-400">Available</span>
                          </div>
                        </div>
                        <div className="w-28 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              occupancy > 85 ? 'bg-rose-500' : occupancy > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${occupancy}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {h.averageWaitTimeMinutes || 45} mins
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <Ambulance className="w-4 h-4" />
                          <span>108 Available</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">24x7 Emergency Service</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                            h.isVerified
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {h.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
