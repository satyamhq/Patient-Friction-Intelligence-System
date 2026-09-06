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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const patientLinks = [
    { name: t('nav.dashboard', 'Dashboard'), path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Digital Twin Simulator', path: '/patient/digital-twin', icon: Sparkles },
    { name: 'Live Teleconsultation', path: '/patient/teleconsult', icon: Layers },
    { name: t('nav.hospitals', 'Find Nearby Hospitals'), path: '/patient/hospitals', icon: MapPin },
    { name: t('nav.frictionProfile', 'Friction Profile'), path: '/patient/friction', icon: Sparkles },
    { name: t('nav.accessibilityRisk', 'Accessibility Risk'), path: '/patient/risk', icon: ShieldAlert },
    { name: t('nav.myRequests', 'My Hospital Requests'), path: '/patient/requests', icon: ListOrdered },
    { name: t('nav.myDocuments', 'Document Vault'), path: '/patient/documents', icon: FolderLock },
    { name: t('auth.fullName', 'Profile & Location'), path: '/patient/profile', icon: User },
    { name: t('nav.settings', 'Settings & Language'), path: '/patient/settings', icon: Settings },
  ];

  const hospitalLinks = [
    { name: t('nav.dashboard', 'Hospital Dashboard'), path: '/hospital/dashboard', icon: LayoutDashboard },
    { name: t('nav.triageQueue', 'Patient Requests Queue'), path: '/hospital/requests', icon: ListOrdered },
    { name: 'Teleconsultation Triage', path: '/hospital/teleconsult', icon: Layers },
    { name: t('nav.opdManagement', 'Departments & OPD'), path: '/hospital/departments', icon: Layers },
    { name: t('nav.hospitalProfile', 'Hospital Profile'), path: '/hospital/profile', icon: Building2 },
    { name: t('nav.settings', 'Settings & Language'), path: '/hospital/settings', icon: Settings },
  ];

  const adminLinks = [
    { name: t('nav.dashboard', 'System Dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Friction Digital Twin', path: '/admin/digital-twin', icon: Sparkles },
    { name: t('nav.whatIfSimulator', 'What-If Simulator'), path: '/admin/simulator', icon: Cpu },
    { name: t('nav.budgetOptimizer', 'Budget Optimizer'), path: '/admin/interventions', icon: Sliders },
    { name: t('nav.populationMap', 'Population Friction Map'), path: '/admin/friction-map', icon: MapPin },
    { name: t('nav.careLeakage', 'Care Leakage Funnel'), path: '/admin/care-leakage', icon: GitFork },
    { name: t('nav.whyCareFailed', 'Why Did Care Fail'), path: '/admin/care-failure', icon: BarChart3 },
    { name: t('nav.patientRegistry', 'Patient Registry'), path: '/admin/patients', icon: Users },
    { name: t('nav.hospitalRegistry', 'Hospital Registry'), path: '/admin/hospitals', icon: Building2 },
    { name: t('nav.auditLogs', 'Audit & Compliance Logs'), path: '/admin/audit-logs', icon: History },
    { name: t('nav.settings', 'Settings & Language'), path: '/admin/settings', icon: Settings },
  ];

  const links =
    role === 'patient' ? patientLinks : role === 'hospital' ? hospitalLinks : adminLinks;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <h5 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {role.toUpperCase()} {t('nav.dashboard', 'PORTAL')}
          </h5>
          <div className="mt-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Non-Clinical Safeguard Card */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-snug space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
          <span>Non-Clinical AI</span>
        </div>
        <p>{t('common.nonClinicalNotice', 'Operational access barrier intelligence only. No medical diagnosis.')}</p>
      </div>
    </aside>
  );
};
