import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  UserCheck,
  Building2,
  Stethoscope,
  HeartHandshake,
  Landmark,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onSuccess?: (redirectPath: string) => void;
}

type PublicRole = 'patient' | 'hospital' | 'doctor' | 'asha' | 'government';

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onSuccess }) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<PublicRole>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic details
  const [patientDetails, setPatientDetails] = useState({
    age: 36,
    gender: 'female',
    preferredLanguage: 'Hindi',
    district: 'Kapurthala',
    state: 'Punjab',
  });

  const [hospitalDetails, setHospitalDetails] = useState({
    facilityName: '',
    facilityType: 'Community Health Center',
    totalBeds: 100,
  });

  const [doctorDetails, setDoctorDetails] = useState({
    qualification: 'MBBS, MD',
    specialization: 'General Medicine',
    hospitalName: 'Civil Hospital Phagwara',
  });

  const [ashaDetails, setAshaDetails] = useState({
    assignedVillage: 'Khera Village',
    primaryHealthCenter: 'PHC Chaheru',
    district: 'Kapurthala',
  });

  const [govDetails, setGovDetails] = useState({
    officialDesignation: 'District Chief Medical Officer',
    jurisdictionLevel: 'DISTRICT',
    district: 'Kapurthala',
  });

  if (!isOpen) return null;

  const roleCards = [
    {
      role: 'patient' as PublicRole,
      title: 'Patient',
      badge: 'Individual Care',
      icon: UserCheck,
      color: 'blue',
      description: 'Check personal friction scores, receive transport guidance & track appointments.',
    },
    {
      role: 'hospital' as PublicRole,
      title: 'Hospital',
      badge: 'Facility Operations',
      icon: Building2,
      color: 'emerald',
      description: 'Manage bed capacity, analyze care-leakage dropouts, and process referral transfers.',
    },
    {
      role: 'doctor' as PublicRole,
      title: 'Doctor',
      badge: 'Clinical Decision Support',
      icon: Stethoscope,
      color: 'indigo',
      description: 'Review patient non-clinical friction barriers, OPD queue, and write consultations.',
    },
    {
      role: 'asha' as PublicRole,
      title: 'ASHA Worker',
      badge: 'Frontline Community',
      icon: HeartHandshake,
      color: 'rose',
      description: 'Log village barrier assessments, offline triage, and maternal/child recall tasks.',
    },
    {
      role: 'government' as PublicRole,
      title: 'Government Official',
      badge: 'District Governance',
      icon: Landmark,
      color: 'amber',
      description: 'Inspect block-level friction heatmaps, journey funnels, and commission MMUs.',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let profileDetails: any = {};
      if (selectedRole === 'patient') profileDetails = patientDetails;
      else if (selectedRole === 'hospital') profileDetails = hospitalDetails;
      else if (selectedRole === 'doctor') profileDetails = doctorDetails;
      else if (selectedRole === 'asha') profileDetails = ashaDetails;
      else if (selectedRole === 'government') profileDetails = govDetails;

      const res = await api.post('/auth/complete-onboarding', {
        role: selectedRole,
        profileDetails,
      });

      if (res.data.success) {
        if (res.data.token) {
          localStorage.setItem('pfis_auth_token', res.data.token);
        }
        if (res.data.user) {
          localStorage.setItem('pfis_user', JSON.stringify(res.data.user));
        }

        const targetPath = res.data.redirectPath || `/${selectedRole}/dashboard`;
        if (onSuccess) {
          onSuccess(targetPath);
        } else {
          navigate(targetPath);
        }
      } else {
        setError(res.data.message || 'Onboarding completion failed.');
      }
    } catch (err: any) {
      console.error('Onboarding submission error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl text-white relative animate-in fade-in zoom-in duration-200 my-8">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Welcome to PFIS
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Tell us how you will use PFIS</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Select your functional operational role. PFIS will personalize your workflows, analytics, and operational tools.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roleCards.map((card) => {
              const Icon = card.icon;
              const isSelected = selectedRole === card.role;
              return (
                <div
                  key={card.role}
                  onClick={() => setSelectedRole(card.role)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-left flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300">
                      {card.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-white">{card.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{card.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Role specific inputs */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-4">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Operational Context Setup
            </h5>

            {selectedRole === 'patient' && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Age</label>
                  <input
                    type="number"
                    value={patientDetails.age}
                    onChange={(e) => setPatientDetails({ ...patientDetails, age: Number(e.target.value) })}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Preferred Language</label>
                  <select
                    value={patientDetails.preferredLanguage}
                    onChange={(e) => setPatientDetails({ ...patientDetails, preferredLanguage: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="English">English</option>
                    <option value="Bhojpuri">Bhojpuri</option>
                  </select>
                </div>
              </div>
            )}

            {selectedRole === 'hospital' && (
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Health Facility Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Civil Hospital / CHC"
                    value={hospitalDetails.facilityName}
                    onChange={(e) => setHospitalDetails({ ...hospitalDetails, facilityName: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Facility Level</label>
                    <select
                      value={hospitalDetails.facilityType}
                      onChange={(e) => setHospitalDetails({ ...hospitalDetails, facilityType: e.target.value })}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="PHC">Primary Health Centre (PHC)</option>
                      <option value="CHC">Community Health Centre (CHC)</option>
                      <option value="Sub-District Hospital">Sub-District Hospital</option>
                      <option value="District Hospital">District Hospital</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Total Bed Capacity</label>
                    <input
                      type="number"
                      value={hospitalDetails.totalBeds}
                      onChange={(e) => setHospitalDetails({ ...hospitalDetails, totalBeds: Number(e.target.value) })}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'doctor' && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Medical Specialization</label>
                  <input
                    type="text"
                    value={doctorDetails.specialization}
                    onChange={(e) => setDoctorDetails({ ...doctorDetails, specialization: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Attached Facility</label>
                  <input
                    type="text"
                    value={doctorDetails.hospitalName}
                    onChange={(e) => setDoctorDetails({ ...doctorDetails, hospitalName: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {selectedRole === 'asha' && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Assigned Village / Basti</label>
                  <input
                    type="text"
                    value={ashaDetails.assignedVillage}
                    onChange={(e) => setAshaDetails({ ...ashaDetails, assignedVillage: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Linked Primary Health Center</label>
                  <input
                    type="text"
                    value={ashaDetails.primaryHealthCenter}
                    onChange={(e) => setAshaDetails({ ...ashaDetails, primaryHealthCenter: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {selectedRole === 'government' && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Official Designation</label>
                  <input
                    type="text"
                    value={govDetails.officialDesignation}
                    onChange={(e) => setGovDetails({ ...govDetails, officialDesignation: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Jurisdiction District</label>
                  <input
                    type="text"
                    value={govDetails.district}
                    onChange={(e) => setGovDetails({ ...govDetails, district: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Provisioning Workspace...
                </>
              ) : (
                <>
                  Complete Setup & Open Dashboard <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-3">
              Role assignment is governed by server-side authorization. Administrative access is restricted to verified personnel.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
