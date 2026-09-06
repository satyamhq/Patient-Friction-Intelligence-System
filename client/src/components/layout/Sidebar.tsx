import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  Calendar,
  FileText,
  Pill,
  Bell,
  Activity,
  Home,
  ShieldCheck,
  LogOut,
  Stethoscope,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn('Sidebar logout error', e);
    } finally {
      window.location.href = '/login?logged_out=true';
    }
  };

  const patientLinks = [
    { name: t('nav.dashboard', 'Overview Hub'), path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Appointments & Tokens', path: '/patient/appointments', icon: Calendar },
    { name: 'Medical History & Rx', path: '/patient/medical-history', icon: FileText },
    { name: 'Live Teleconsultation', path: '/patient/teleconsult', icon: Layers },
    { name: t('nav.hospitals', 'Find Nearby Facilities'), path: '/patient/hospitals', icon: MapPin },
    { name: t('nav.frictionProfile', 'Friction Fingerprint'), path: '/patient/friction', icon: Sparkles },
    { name: t('nav.accessibilityRisk', 'Accessibility Risk'), path: '/patient/risk', icon: ShieldAlert },
    { name: 'Digital Twin Simulator', path: '/patient/digital-twin', icon: Cpu },
    { name: t('nav.myRequests', 'Facility Requests'), path: '/patient/requests', icon: ListOrdered },
    { name: t('nav.myDocuments', 'Document Vault'), path: '/patient/documents', icon: FolderLock },
    { name: t('auth.fullName', 'Demographics & ABHA'), path: '/patient/profile', icon: User },
    { name: t('nav.settings', 'Settings & Accessibility'), path: '/patient/settings', icon: Settings },
  ];

  const hospitalLinks = [
    { name: t('nav.dashboard', 'Hospital Overview'), path: '/hospital/dashboard', icon: LayoutDashboard },
    { name: 'Patient Flow & Queue', path: '/hospital/operations', icon: Activity },
    { name: 'Pharmacy Inventory', path: '/hospital/inventory', icon: Pill },
    { name: t('nav.triageQueue', 'Incoming Requests'), path: '/hospital/requests', icon: ListOrdered },
    { name: 'Cross-Facility Referrals', path: '/hospital/referrals', icon: GitFork },
    { name: t('nav.opdManagement', 'Departments & OPD'), path: '/hospital/departments', icon: Layers },
    { name: 'Teleconsultation Desk', path: '/hospital/teleconsult', icon: Layers },
    { name: t('nav.hospitalProfile', 'Facility Profile'), path: '/hospital/profile', icon: Building2 },
    { name: 'Operational Alerts', path: '/hospital/notifications', icon: Bell },
  ];

  const doctorLinks = [
    { name: 'Consultation Desk', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: "Today's Patient Queue", path: '/doctor/appointments', icon: Calendar },
    { name: 'Medical Records & Rx', path: '/doctor/medical-records', icon: FileText },
    { name: 'Patient Review', path: '/doctor/patient-review', icon: User },
    { name: 'Referral Transfers', path: '/hospital/referrals', icon: GitFork },
    { name: 'Doctor Profile & Hours', path: '/doctor/profile', icon: User },
  ];

  const ashaLinks = [
    { name: 'Field Overview', path: '/asha/dashboard', icon: LayoutDashboard },
    { name: 'Home Health Visits', path: '/asha/visits', icon: Home },
    { name: 'Triage & Register Wizard', path: '/asha/wizard', icon: Sparkles },
    { name: 'Record Barriers', path: '/asha/barriers', icon: ShieldAlert },
    { name: 'High-Risk Recalls (ANC/UIP)', path: '/asha/recalls', icon: ListOrdered },
    { name: 'ASHA Worker Profile', path: '/asha/profile', icon: User },
  ];

  const governmentLinks = [
    { name: 'District Macro View', path: '/government/dashboard', icon: LayoutDashboard },
    { name: 'Facility Performance', path: '/government/facilities', icon: Building2 },
    { name: 'Geospatial Friction Map', path: '/government/friction-map', icon: MapPin },
    { name: 'Care Leakage Funnel', path: '/government/leakage', icon: GitFork },
    { name: 'Population Barriers', path: '/government/barriers', icon: BarChart3 },
    { name: 'Resource Allocation', path: '/government/interventions', icon: Sliders },
  ];

  const adminLinks = [
    { name: t('nav.dashboard', 'Executive Command Center'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User & Role Management', path: '/admin/users', icon: Users },
    { name: 'Verification Queue', path: '/admin/verification', icon: ShieldCheck },
    { name: 'System Telemetry & Health', path: '/admin/system-health', icon: Activity },
    { name: 'Friction Digital Twin', path: '/admin/digital-twin', icon: Sparkles },
    { name: t('nav.whatIfSimulator', 'What-If Simulator'), path: '/admin/simulator', icon: Cpu },
    { name: t('nav.budgetOptimizer', 'Budget Optimizer'), path: '/admin/interventions', icon: Sliders },
    { name: t('nav.populationMap', 'Population Friction Map'), path: '/admin/friction-map', icon: MapPin },
    { name: t('nav.careLeakage', 'Care Leakage Funnel'), path: '/admin/care-leakage', icon: GitFork },
    { name: t('nav.whyCareFailed', 'Why Did Care Fail'), path: '/admin/care-failure', icon: BarChart3 },
    { name: t('nav.patientRegistry', 'Patient Cohort Registry'), path: '/admin/patients', icon: Users },
    { name: t('nav.hospitalRegistry', 'Hospital Registry'), path: '/admin/hospitals', icon: Building2 },
    { name: t('nav.auditLogs', 'Compliance Audit Logs'), path: '/admin/audit-logs', icon: History },
  ];

  let links = patientLinks;
  if (role === 'hospital') links = hospitalLinks;
  else if (role === 'doctor') links = doctorLinks;
  else if (role === 'asha') links = ashaLinks;
  else if (role === 'government') links = governmentLinks;
  else if (role === 'admin') links = adminLinks;

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation • {role.toUpperCase()}
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{link.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Card & Sign Out */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 space-y-3 shrink-0">
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            {role === 'hospital' ? (
              <Building2 className="w-4 h-4" />
            ) : role === 'admin' ? (
              <Shield className="w-4 h-4" />
            ) : role === 'doctor' ? (
              <Stethoscope className="w-4 h-4" />
            ) : role === 'asha' ? (
              <Users className="w-4 h-4" />
            ) : role === 'government' ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user.name || 'User'}
            </p>
            <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              {role}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200/80 dark:border-rose-800/50 transition-colors shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('nav.logout', 'Sign Out')}</span>
        </button>
      </div>
    </aside>
  );
};

