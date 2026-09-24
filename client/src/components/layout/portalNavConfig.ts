import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Layers,
  MapPin,
  Sparkles,
  ShieldAlert,
  FolderLock,
  User,
  Settings,
  Activity,
  Pill,
  ListOrdered,
  GitFork,
  Building2,
  Bell,
  Stethoscope,
  Home,
  Users,
  BarChart3,
  Sliders,
  Cpu,
  History,
  ShieldCheck,
  Shield,
  LucideIcon,
} from 'lucide-react';

export type PortalRole = 'patient' | 'doctor' | 'hospital' | 'asha' | 'government' | 'admin';

export interface PortalLink {
  name: string;
  shortName?: string;
  path: string;
  icon: LucideIcon;
}

export interface PortalConfig {
  role: PortalRole;
  title: string;
  shortTitle: string;
  personaName: string;
  description: string;
  basePath: string;
  icon: LucideIcon;
  themeColor: string;
  links: PortalLink[];
}

export const PORTAL_CONFIGS: Record<PortalRole, PortalConfig> = {
  patient: {
    role: 'patient',
    title: 'Patient & Citizen Accessibility Portal',
    shortTitle: 'Patient',
    personaName: 'Sunita Devi (Citizen)',
    description: 'Appointments, friction fingerprint, document vault, and hospital finder.',
    basePath: '/patient',
    icon: User,
    themeColor: 'teal',
    links: [
      { name: 'Overview Hub', shortName: 'Overview', path: '/patient/dashboard', icon: LayoutDashboard },
      { name: 'Appointments & Tokens', shortName: 'Appointments', path: '/patient/appointments', icon: Calendar },
      { name: 'Medical History & Rx', shortName: 'Medical History', path: '/patient/medical-history', icon: FileText },
      { name: 'Live Teleconsultation', shortName: 'Teleconsult', path: '/patient/teleconsult', icon: Layers },
      { name: 'Find Nearby Facilities', shortName: 'Find Hospitals', path: '/patient/hospitals', icon: MapPin },
      { name: 'Friction Fingerprint', shortName: 'Friction', path: '/patient/friction', icon: Sparkles },
      { name: 'Accessibility Risk', shortName: 'Risk', path: '/patient/risk', icon: ShieldAlert },
      { name: 'Digital Twin Simulator', shortName: 'Digital Twin', path: '/patient/digital-twin', icon: Cpu },
      { name: 'Facility Requests', shortName: 'Requests', path: '/patient/requests', icon: ListOrdered },
      { name: 'Document Vault', shortName: 'Documents', path: '/patient/documents', icon: FolderLock },
      { name: 'Demographics & ABHA', shortName: 'Profile', path: '/patient/profile', icon: User },
      { name: 'Settings & Accessibility', shortName: 'Settings', path: '/patient/settings', icon: Settings },
    ],
  },
  doctor: {
    role: 'doctor',
    title: 'Doctor Clinical Consultation Console',
    shortTitle: 'Doctor',
    personaName: 'Dr. Vikram Sharma, MD',
    description: 'Consultation queue, longitudinal medical records, and cross-facility referrals.',
    basePath: '/doctor',
    icon: Stethoscope,
    themeColor: 'blue',
    links: [
      { name: 'Consultation Desk', shortName: 'Consult Desk', path: '/doctor/dashboard', icon: LayoutDashboard },
      { name: "Today's Patient Queue", shortName: 'OPD Queue', path: '/doctor/appointments', icon: Calendar },
      { name: 'Medical Records & Rx', shortName: 'Records & Rx', path: '/doctor/medical-records', icon: FileText },
      { name: 'Patient Review', shortName: 'Review', path: '/doctor/patient-review', icon: User },
      { name: 'Referral Transfers', shortName: 'Referrals', path: '/hospital/referrals', icon: GitFork },
      { name: 'Doctor Profile & Hours', shortName: 'Profile', path: '/doctor/profile', icon: User },
    ],
  },
  hospital: {
    role: 'hospital',
    title: 'Hospital Facility Operations Desk',
    shortTitle: 'Hospital',
    personaName: 'Apollo Health Facility',
    description: 'Patient queue flow, pharmacy stock, departmental OPD, and triage requests.',
    basePath: '/hospital',
    icon: Building2,
    themeColor: 'indigo',
    links: [
      { name: 'Hospital Overview', shortName: 'Overview', path: '/hospital/dashboard', icon: LayoutDashboard },
      { name: 'Patient Flow & Queue', shortName: 'Patient Flow', path: '/hospital/operations', icon: Activity },
      { name: 'Pharmacy Inventory', shortName: 'Pharmacy', path: '/hospital/inventory', icon: Pill },
      { name: 'Incoming Requests', shortName: 'Requests', path: '/hospital/requests', icon: ListOrdered },
      { name: 'Cross-Facility Referrals', shortName: 'Referrals', path: '/hospital/referrals', icon: GitFork },
      { name: 'Departments & OPD', shortName: 'Departments', path: '/hospital/departments', icon: Layers },
      { name: 'Teleconsultation Desk', shortName: 'Tele-Triage', path: '/hospital/teleconsult', icon: Layers },
      { name: 'Facility Profile', shortName: 'Profile', path: '/hospital/profile', icon: Building2 },
      { name: 'Operational Alerts', shortName: 'Alerts', path: '/hospital/notifications', icon: Bell },
    ],
  },
  asha: {
    role: 'asha',
    title: 'Frontline ASHA Worker Community Portal',
    shortTitle: 'ASHA',
    personaName: 'Anita Devi (ASHA)',
    description: 'Home visits log, village barrier triage wizard, and high-risk recalls.',
    basePath: '/asha',
    icon: Users,
    themeColor: 'emerald',
    links: [
      { name: 'Field Overview', shortName: 'Overview', path: '/asha/dashboard', icon: LayoutDashboard },
      { name: 'Home Health Visits', shortName: 'Visits', path: '/asha/visits', icon: Home },
      { name: 'Triage & Register Wizard', shortName: 'Triage Wizard', path: '/asha/wizard', icon: Sparkles },
      { name: 'Record Barriers', shortName: 'Barriers', path: '/asha/barriers', icon: ShieldAlert },
      { name: 'High-Risk Recalls (ANC/UIP)', shortName: 'Recalls', path: '/asha/recalls', icon: ListOrdered },
      { name: 'ASHA Worker Profile', shortName: 'Profile', path: '/asha/profile', icon: User },
    ],
  },
  government: {
    role: 'government',
    title: 'District Public Health Governance',
    shortTitle: 'Governance',
    personaName: 'District Health Governance',
    description: 'Macro analytics, facility performance, friction heatmaps, and resource allocation.',
    basePath: '/government',
    icon: ShieldCheck,
    themeColor: 'cyan',
    links: [
      { name: 'District Macro View', shortName: 'Overview', path: '/government/dashboard', icon: LayoutDashboard },
      { name: 'Facility Performance', shortName: 'Facilities', path: '/government/facilities', icon: Building2 },
      { name: 'Geospatial Friction Map', shortName: 'Friction Map', path: '/government/friction-map', icon: MapPin },
      { name: 'Care Leakage Funnel', shortName: 'Leakage', path: '/government/leakage', icon: GitFork },
      { name: 'Population Barriers', shortName: 'Barriers', path: '/government/barriers', icon: BarChart3 },
      { name: 'Resource Allocation', shortName: 'Interventions', path: '/government/interventions', icon: Sliders },
    ],
  },
  admin: {
    role: 'admin',
    title: 'Executive Health Intelligence Suite',
    shortTitle: 'Admin',
    personaName: 'Platform Administrator',
    description: 'System intelligence, What-If simulator, audit logs, and registry controls.',
    basePath: '/admin',
    icon: Shield,
    themeColor: 'violet',
    links: [
      { name: 'Executive Command Center', shortName: 'Command', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'What-If Simulator', shortName: 'Simulator', path: '/admin/simulator', icon: Cpu },
      { name: 'Population Friction Map', shortName: 'Friction Map', path: '/admin/friction-map', icon: MapPin },
      { name: 'Care Leakage Funnel', shortName: 'Leakage', path: '/admin/care-leakage', icon: GitFork },
      { name: 'Why Did Care Fail', shortName: 'Failure Attribution', path: '/admin/care-failure', icon: BarChart3 },
      { name: 'Budget Optimizer', shortName: 'Optimizer', path: '/admin/interventions', icon: Sliders },
      { name: 'Friction Digital Twin', shortName: 'Digital Twin', path: '/admin/digital-twin', icon: Sparkles },
      { name: 'User & Role Management', shortName: 'Users', path: '/admin/users', icon: Users },
      { name: 'Patient Cohort Registry', shortName: 'Patients', path: '/admin/patients', icon: Users },
      { name: 'Hospital Registry', shortName: 'Hospitals', path: '/admin/hospitals', icon: Building2 },
      { name: 'Verification Queue', shortName: 'Verification', path: '/admin/verification', icon: ShieldCheck },
      { name: 'System Telemetry & Health', shortName: 'System Health', path: '/admin/system-health', icon: Activity },
      { name: 'Compliance Audit Logs', shortName: 'Audit Logs', path: '/admin/audit-logs', icon: History },
    ],
  },
};

export const getActivePortalRole = (pathname: string): PortalRole | null => {
  if (pathname.startsWith('/doctor')) return 'doctor';
  if (pathname.startsWith('/hospital')) return 'hospital';
  if (pathname.startsWith('/asha')) return 'asha';
  if (pathname.startsWith('/government')) return 'government';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/patient')) return 'patient';
  return null;
};
