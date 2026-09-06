import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { hospitalService } from '../../services/hospitalService';
import { HospitalRequest, Hospital, HospitalDepartment } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Building2,
  ListOrdered,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Layers,
  MapPin,
  Calendar,
} from 'lucide-react';

export const HospitalDashboard: React.FC = () => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [departments, setDepartments] = useState<HospitalDepartment[]>([]);
  const [requests, setRequests] = useState<HospitalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const hRes = await hospitalService.getMyProfile().catch(() => null);
        if (hRes?.success && hRes.hospital) {
          setHospital(hRes.hospital);
          setDepartments(hRes.departments || []);
        } else {
          setHospital({
            _id: 'demo_hospital_01',
            name: 'Apollo Multi-Specialty Hospital',
            type: 'Private/Charitable',
            address: 'Station Road Medical Plaza',
            city: 'Phagwara',
            state: 'Punjab',
            pincode: '144401',
            phone: '01824-222334',
            email: 'care@apollo.org',
            emergencyAvailable: true,
            totalBeds: 150,
            availableBeds: 25,
            specialistAvailable: true,
          } as any);
        }

        const rRes = await requestService.getHospitalRequests().catch(() => null);
        if (rRes?.success) {
          setRequests(rRes.requests || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  const newRequestsCount = requests.filter((r) => ['REQUEST_SENT', 'HOSPITAL_RECEIVED'].includes(r.status)).length;
  const pendingCount = requests.filter((r) => r.status === 'UNDER_REVIEW').length;
  const acceptedCount = requests.filter((r) => ['ACCEPTED', 'APPOINTMENT_SCHEDULED'].includes(r.status)).length;
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div className="space-y-8">
      {/* Hospital Identity Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
              {hospital?.type || 'Government'} Facility
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Triage Desk
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{hospital?.name}</h2>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-500" />
            <span>{hospital?.address}, {hospital?.city}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link to="/hospital/requests" className="w-full md:w-auto">
            <Button variant="primary" size="sm" icon={<ListOrdered className="w-4 h-4" />}>
              Review Patient Queue ({newRequestsCount})
            </Button>
          </Link>
          <Link to="/hospital/departments" className="w-full md:w-auto">
            <Button variant="outline" size="sm" icon={<Layers className="w-4 h-4" />}>
              Manage OPD
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="New Requests"
          value={newRequestsCount}
          subtitle="Awaiting initial triage review"
          icon={Clock}
          badge="Action Required"
          badgeType={newRequestsCount > 0 ? 'danger' : 'info'}
        />

        <StatCard
          title="Under Review"
          value={pendingCount}
          subtitle="In department queue evaluation"
          icon={AlertTriangle}
          badge="Pending"
          badgeType="warning"
        />

        <StatCard
          title="Accepted / Scheduled"
          value={acceptedCount}
          subtitle="OPD token scheduled"
          icon={CheckCircle2}
          badge="Active OPD"
          badgeType="success"
        />

        <StatCard
          title="Completed Visits"
          value={completedCount}
          subtitle="Successfully consulted"
          icon={Building2}
          badge="Fulfilled"
          badgeType="info"
        />
      </div>

      {/* Triage Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Patient Intake Requests</h3>
            <p className="text-xs text-slate-500">
              Only patient-consented demographic and non-clinical friction data is displayed
            </p>
          </div>
          <Link to="/hospital/requests" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            View All ({requests.length})
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            No incoming patient requests in the queue currently.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-lg">Request Code</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Reason for Visit</th>
                  <th className="p-3">Distance</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {requests.slice(0, 6).map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{req.requestCode}</td>
                    <td className="p-3">
                      <span className="font-semibold block">{(req.patientId as any)?.patientCode || 'PAT-1048'}</span>
                      <span className="text-[10px] text-slate-400">
                        {(req.patientId as any)?.age} yrs • {(req.patientId as any)?.preferredLanguage}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-teal-800">{req.departmentName}</td>
                    <td className="p-3 max-w-xs truncate">{req.reasonForVisit}</td>
                    <td className="p-3 font-medium text-slate-600">{req.distanceKm || 25} km</td>
                    <td className="p-3">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="p-3 text-right">
                      <Link to={`/hospital/requests/${req._id}`}>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </Link>
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
