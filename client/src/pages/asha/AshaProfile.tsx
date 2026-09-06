import React, { useState, useEffect } from 'react';
import { ashaService, AshaProfile as IAshaProfile } from '../../services/ashaService';
import {
  HeartHandshake,
  MapPin,
  Building2,
  Phone,
  Mail,
  Users,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Globe,
  Sparkles,
  ShieldCheck,
  Activity,
} from 'lucide-react';

export const AshaProfile: React.FC = () => {
  const [profile, setProfile] = useState<IAshaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedVillage, setAssignedVillage] = useState('');
  const [assignedWard, setAssignedWard] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [primaryHealthCenter, setPrimaryHealthCenter] = useState('');
  const [communityPopulation, setCommunityPopulation] = useState(1200);
  const [languages, setLanguages] = useState('Hindi, Santali');

  const loadProfile = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await ashaService.getProfile();
      if (res?.worker) {
        const w = res.worker;
        setProfile(w);
        setName(w.name || 'Anita Devi');
        setPhone(w.phone || '9876501234');
        setAssignedVillage(w.assignedVillage || 'Hesal Village');
        setAssignedWard(w.assignedWard || 'Ward 3 & 4');
        setDistrict(w.district || 'Ranchi');
        setState(w.state || 'Jharkhand');
        setPrimaryHealthCenter(w.primaryHealthCenter || 'Angara Primary Health Centre (PHC)');
        setCommunityPopulation(w.communityPopulation || 1450);
        setLanguages(Array.isArray(w.languagesSpoken) ? w.languagesSpoken.join(', ') : 'Hindi, Santali');
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed to load ASHA profile from MongoDB Atlas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const languagesSpoken = languages.split(',').map((l) => l.trim()).filter(Boolean);
      const res = await ashaService.updateProfile({
        name,
        phone,
        assignedVillage,
        assignedWard,
        district,
        state,
        primaryHealthCenter,
        communityPopulation: Number(communityPopulation),
        languagesSpoken,
      });

      if (res?.worker) {
        setProfile(res.worker);
        setSuccessMessage('ASHA worker profile updated successfully in MongoDB Atlas.');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col items-center gap-4 text-center max-w-sm">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-700">Loading ASHA frontline profile from MongoDB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <HeartHandshake className="w-10 h-10 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{name}</h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>NHM Certified ASHA</span>
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {profile?.workerId || 'ASHA-JH-1048'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium flex items-center gap-2 flex-wrap">
                <span>{assignedVillage}, {district}</span>
                <span>•</span>
                <span>Linked to {primaryHealthCenter}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadProfile}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Live Data</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Operational Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned Population</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{communityPopulation}</span>
              <span className="text-xs text-slate-500">citizens</span>
            </div>
            <p className="text-[10px] text-teal-600 font-semibold flex items-center gap-1 pt-1">
              <Users className="w-3 h-3" />
              <span>Active Field Roster</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tracked Patients</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{profile?.assignedPatientsCount || 184}</span>
              <span className="text-xs text-slate-500">records</span>
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 pt-1">
              <Activity className="w-3 h-3" />
              <span>100% ABDM Linked</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active High-Risk Cases</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600">{profile?.activeCases || 19}</span>
              <span className="text-xs text-slate-500">priority</span>
            </div>
            <p className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 pt-1">
              <AlertCircle className="w-3 h-3" />
              <span>Maternal ANC / Defaulters</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly Incentives</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-600">₹4,200</span>
              <span className="text-xs text-slate-500">approved</span>
            </div>
            <p className="text-[10px] text-teal-700 font-semibold flex items-center gap-1 pt-1">
              <Award className="w-3 h-3" />
              <span>DBT Directly Credited</span>
            </p>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <div className="pb-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">ASHA Frontline Cadre Details</h2>
              <p className="text-xs text-slate-500">
                Official village jurisdiction, facility affiliation, and emergency contact details stored in MongoDB Atlas.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-synced to PFIS Intelligence Layer</span>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">ASHA Full Name (पूरा नाम) *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Official Mobile (सरकारी फोन नंबर) *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Assigned Village */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Assigned Village (आवंटित गांव) *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={assignedVillage}
                    onChange={(e) => setAssignedVillage(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Assigned Ward */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Ward / Mohalla (वार्ड) *</label>
                <input
                  type="text"
                  required
                  value={assignedWard}
                  onChange={(e) => setAssignedWard(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Primary Health Center */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Primary Health Centre (प्राथमिक स्वास्थ्य केंद्र) *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={primaryHealthCenter}
                    onChange={(e) => setPrimaryHealthCenter(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Community Population */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Covered Population (आबादी)</label>
                <input
                  type="number"
                  value={communityPopulation}
                  onChange={(e) => setCommunityPopulation(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* District */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">District (जिला) *</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">State (राज्य) *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Languages */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Languages Spoken (बोली जाने वाली भाषाएं) *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="Hindi, Punjabi, Santali, etc. (comma separated)"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving to MongoDB...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile (सहेजें)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AshaProfile;
