import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  MapPin,
  Sparkles,
  ShieldAlert,
  FolderLock,
  User,
  Building2,
  ListOrdered,
  Users,
  GitFork,
  BarChart3,
  Cpu,
  History,
  Sliders,
  Layers,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const patientLinks = [
    { name: t('nav.dashboard', 'Overview Hub'), path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Digital Twin Simulator', path: '/patient/digital-twin', icon: Sparkles },
    { name: 'Live Teleconsultation', path: '/patient/teleconsult', icon: Layers },
    { name: t('nav.hospitals', 'Find Nearby PHCs'), path: '/patient/hospitals', icon: MapPin },
    { name: t('nav.frictionProfile', 'Friction Fingerprint'), path: '/patient/friction', icon: Sparkles },
    { name: t('nav.accessibilityRisk', 'Accessibility Risk'), path: '/patient/risk', icon: ShieldAlert },
    { name: t('nav.myRequests', 'Facility Requests'), path: '/patient/requests', icon: ListOrdered },
    { name: t('nav.myDocuments', 'Document Vault'), path: '/patient/documents', icon: FolderLock },
    { name: t('auth.fullName', 'Demographics & ABHA'), path: '/patient/profile', icon: User },
    { name: t('nav.settings', 'Settings & Accessibility'), path: '/patient/settings', icon: Settings },
  ];

  const hospitalLinks = [
    { name: t('nav.dashboard', 'Hospital Overview'), path: '/hospital/dashboard', icon: LayoutDashboard },
    { name: t('nav.triageQueue', 'Incoming Requests Queue'), path: '/hospital/requests', icon: ListOrdered },
    { name: 'Teleconsultation Desk', path: '/hospital/teleconsult', icon: Layers },
    { name: t('nav.opdManagement', 'Departments & OPD'), path: '/hospital/departments', icon: Layers },
    { name: t('nav.hospitalProfile', 'Facility Profile'), path: '/hospital/profile', icon: Building2 },
    { name: 'Cross-Facility Referrals', path: '/hospital/referrals', icon: GitFork },
    { name: t('nav.settings', 'Settings & Preferences'), path: '/hospital/settings', icon: Settings },
  ];

  const doctorLinks = [
    { name: 'Consultation Desk', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'OPD Waiting Queue', path: '/doctor/queue', icon: ListOrdered },
    { name: 'Patient Review', path: '/doctor/patient-review', icon: User },
    { name: 'Referral Transfers', path: '/hospital/referrals', icon: GitFork },
    { name: 'Doctor Profile & Hours', path: '/doctor/profile', icon: Settings },
  ];

  const ashaLinks = [
    { name: 'Field Overview', path: '/asha/dashboard', icon: LayoutDashboard },
    { name: 'Triage & Register Wizard', path: '/asha/wizard', icon: Sparkles },
    { name: 'Record Barriers', path: '/asha/barriers', icon: ShieldAlert },
    { name: 'High-Risk Recalls (ANC/UIP)', path: '/asha/recalls', icon: ListOrdered },
    { name: 'ASHA Worker Profile', path: '/asha/profile', icon: User },
  ];

  const governmentLinks = [
    { name: 'District Macro View', path: '/government/dashboard', icon: LayoutDashboard },
    { name: 'Geospatial Friction Map', path: '/government/friction-map', icon: MapPin },
    { name: 'Care Leakage Funnel', path: '/government/leakage', icon: GitFork },
    { name: 'Population Barriers', path: '/government/barriers', icon: BarChart3 },
    { name: 'Resource Allocation', path: '/government/interventions', icon: Sliders },
  ];

  const adminLinks = [
    { name: t('nav.dashboard', 'Executive Command Center'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Friction Digital Twin', path: '/admin/digital-twin', icon: Sparkles },
    { name: t('nav.whatIfSimulator', 'What-If Simulator'), path: '/admin/simulator', icon: Cpu },
    { name: t('nav.budgetOptimizer', 'Budget Optimizer'), path: '/admin/interventions', icon: Sliders },
    { name: t('nav.populationMap', 'Population Friction Map'), path: '/admin/friction-map', icon: MapPin },
    { name: t('nav.careLeakage', 'Care Leakage Funnel'), path: '/admin/care-leakage', icon: GitFork },
    { name: t('nav.whyCareFailed', 'Why Did Care Fail'), path: '/admin/care-failure', icon: BarChart3 },
    { name: t('nav.patientRegistry', 'Patient Cohort Registry'), path: '/admin/patients', icon: Users },
    { name: t('nav.hospitalRegistry', 'Hospital Registry'), path: '/admin/hospitals', icon: Building2 },
    { name: t('nav.auditLogs', 'Compliance Audit Logs'), path: '/admin/audit-logs', icon: History },
    { name: t('nav.settings', 'System Configuration'), path: '/admin/settings', icon: Settings },
  ];

  let links = patientLinks;
  if (role === 'hospital') links = hospitalLinks;
  else if (role === 'doctor') links = doctorLinks;
  else if (role === 'asha') links = ashaLinks;
  else if (role === 'government') links = governmentLinks;
  else if (role === 'admin') links = adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="space-y-5">
        <div>
          <div className="px-3 pb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {role.toUpperCase()} WORKSPACE
            </span>
            <span className="w-2 h-2 rounded-full bg-teal-500" />
          </div>
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-700" />
                  <span className="truncate">{link.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Non-Clinical Safeguard Card */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 leading-snug space-y-1.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Non-Clinical AI</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800">
            Active
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          {t('common.nonClinicalNotice', 'Identifies physical and logistical access barriers. Zero automated medical diagnosis.')}
        </p>
      </div>
    </aside>
  );
};

