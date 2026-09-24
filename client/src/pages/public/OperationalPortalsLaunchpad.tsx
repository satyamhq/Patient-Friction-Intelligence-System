import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  Building2,
  Shield,
  ShieldCheck,
  User,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export const OperationalPortalsLaunchpad: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInstantPersonaLogin = async (email: string, pass: string, redirectPath: string) => {
    try {
      await login(email, pass);
      navigate(redirectPath);
    } catch {
      navigate(redirectPath);
    }
  };

  const personas = [
    {
      role: 'Patient Portal',
      name: 'Sunita Devi',
      email: 'patient@pfis.org',
      pass: 'Patient@123',
      path: '/patient/dashboard',
      desc: 'Access appointment bookings, digital friction fingerprint, document wallet, and hospital finder.',
      icon: <User className="w-5 h-5 text-teal-600" />,
      color: 'teal',
    },
    {
      role: 'Doctor Desk',
      name: 'Dr. Vikram Sharma, MD',
      email: 'doctor@pfis.org',
      pass: 'Doctor@123',
      path: '/doctor/dashboard',
      desc: 'Clinical consultation queue, patient longitudinal history review, and referral coordination.',
      icon: <Stethoscope className="w-5 h-5 text-blue-600" />,
      color: 'blue',
    },
    {
      role: 'Frontline ASHA Worker',
      name: 'Anita Devi (ASHA)',
      email: 'asha@pfis.org',
      pass: 'Asha@123',
      path: '/asha/dashboard',
      desc: 'Village home visits log, community barrier triage wizard, and high-risk recall outreach.',
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      color: 'emerald',
    },
    {
      role: 'Hospital Facility Desk',
      name: 'Civil Hospital Phagwara',
      email: 'hospital@pfis.org',
      pass: 'Hospital@123',
      path: '/hospital/dashboard',
      desc: 'Inbound referral processing, OPD queue management, and essential medicine formulary.',
      icon: <Building2 className="w-5 h-5 text-indigo-600" />,
      color: 'indigo',
    },
    {
      role: 'Government Health Official',
      name: 'District Health Governance',
      email: 'government@pfis.org',
      pass: 'Gov@123',
      path: '/government/dashboard',
      desc: 'District-level care leakage analytics, facility performance, and intervention policies.',
      icon: <ShieldCheck className="w-5 h-5 text-cyan-600" />,
      color: 'cyan',
    },
    {
      role: 'System Administrator',
      name: 'PFIS Lead Admin',
      email: 'admin@pfis.org',
      pass: 'Admin@123',
      path: '/admin/dashboard',
      desc: 'Executive intelligence suite, population friction heatmaps, and platform health telemetry.',
      icon: <Shield className="w-5 h-5 text-violet-600" />,
      color: 'violet',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Operational Roles Launchpad</span>
            </span>
            <span className="text-xs text-slate-400">• For Organization Deployments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Healthcare Operations Portals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Choose a persona below for a 1-click test session, or sign in directly with your organization credentials.
          </p>
        </div>

        <Link to="/login">
          <Button variant="secondary" size="md">
            Custom Sign In →
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((p) => (
          <div
            key={p.role}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">{p.icon}</div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{p.role}</h3>
                    <p className="text-[11px] text-slate-400">{p.name}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-normal pt-1">{p.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-bold flex items-center justify-center gap-1"
                onClick={() => handleInstantPersonaLogin(p.email, p.pass, p.path)}
              >
                <span>Launch {p.role} View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
