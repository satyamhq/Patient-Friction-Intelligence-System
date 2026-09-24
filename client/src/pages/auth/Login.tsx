import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import {
  Mail,
  Lock,
  User,
  Building2,
  Shield,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe,
  Loader2,
  Stethoscope,
  Users as UsersIcon,
} from 'lucide-react';

export type PortalRole = 'patient' | 'doctor' | 'hospital' | 'asha' | 'government' | 'admin';

export const getRoleDashboard = (role?: string): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'hospital':
      return '/hospital/dashboard';
    case 'doctor':
      return '/doctor/dashboard';
    case 'asha':
      return '/asha/dashboard';
    case 'government':
      return '/government/dashboard';
    case 'patient':
    default:
      return '/patient/dashboard';
  }
};

interface PortalConfig {
  id: PortalRole;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  accentBorder: string;
  features: string[];
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as PortalRole) || 'patient';

  const [activePortal, setActivePortal] = useState<PortalRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [redirectingMessage, setRedirectingMessage] = useState<string | null>(null);

  const { user, isAuthenticated, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to the user's dashboard immediately (unless user explicitly logged out)
  useEffect(() => {
    const isExplicitLogout =
      searchParams.get('logged_out') === 'true' || searchParams.get('session_expired') === 'true';

    if (isExplicitLogout) {
      localStorage.removeItem('pfis_auth_token');
      localStorage.removeItem('pfis_auth_user');
      localStorage.removeItem('pfis_auth_profile');
      localStorage.removeItem('pfis_token');
      localStorage.removeItem('pfis_user');
      localStorage.removeItem('pfis_profile');
      return;
    }

    if (isAuthenticated && user) {
      navigate(getRoleDashboard(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, searchParams]);

  const activePortalRef = useRef(activePortal);
  useEffect(() => {
    activePortalRef.current = activePortal;
  }, [activePortal]);

  const isGsiInitialized = useRef(false);

  // Initialize Google Identity Services once when available
  useEffect(() => {
    try {
      if ((window as any).google?.accounts?.id && !isGsiInitialized.current) {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response.credential) {
              setIsGoogleLoading(true);
              setRedirectingMessage('Verifying credentials...');
              try {
                const res = await loginWithGoogle(response.credential, activePortalRef.current);
                if (res.success) {
                  setRedirectingMessage('Authenticated! Redirecting to Dashboard...');
                  setTimeout(() => {
                    navigate(getRoleDashboard(res.user?.role), { replace: true });
                  }, 150);
                }
              } catch (err: any) {
                setRedirectingMessage(null);
                setError(err.response?.data?.message || 'Authentication failed.');
              } finally {
                setIsGoogleLoading(false);
              }
            }
          },
        });
        isGsiInitialized.current = true;
      }
    } catch (e) {
      console.warn('GIS notice', e);
    }
  }, [loginWithGoogle, navigate]);

  const portals: PortalConfig[] = [
    {
      id: 'patient',
      title: t('auth.patientPortalTitle', 'Patient & Citizen'),
      subtitle: t('auth.patientPortalSubtitle', 'Barrier assessment, hospital locator & OPD tokens'),
      badge: t('auth.patientBadge', 'Citizen'),
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
      icon: <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      accentBorder: 'border-emerald-500 ring-emerald-500/20',
      features: [
        'Personal Friction Fingerprint',
        'Hospital Locator & OPD Tokens',
        'Live Teleconsultation',
      ],
    },
    {
      id: 'doctor',
      title: 'Doctor / Physician',
      subtitle: 'Clinical OPD queue, prescription desk & records',
      badge: 'Physician',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300',
      icon: <Stethoscope className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
      accentBorder: 'border-teal-500 ring-teal-500/20',
      features: [
        'Live OPD Token Calling & Queue',
        'Clinical Notes & ICD Diagnoses',
        'Longitudinal Health History',
      ],
    },
    {
      id: 'hospital',
      title: t('auth.hospitalPortalTitle', 'Hospital Facility'),
      subtitle: 'Operations flow, pharmacy formulary & triage',
      badge: t('auth.hospitalBadge', 'Facility'),
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300',
      icon: <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      accentBorder: 'border-blue-500 ring-blue-500/20',
      features: [
        'Patient Flow & Queue Tracking',
        'Pharmacy Formulary Management',
        'Inter-Facility Referrals',
      ],
    },
    {
      id: 'asha',
      title: 'ASHA Field Worker',
      subtitle: 'Household health visits, maternal rounds & barrier intake',
      badge: 'Community',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
      icon: <UsersIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      accentBorder: 'border-amber-500 ring-amber-500/20',
      features: [
        'Household Health Visits',
        'ANC/PNC & Immunization Sync',
        'Grassroots Patient Triage',
      ],
    },
    {
      id: 'government',
      title: 'District Governance',
      subtitle: 'Public health metrics, facility performance & care leakage',
      badge: 'Governance',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300',
      icon: <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      accentBorder: 'border-indigo-500 ring-indigo-500/20',
      features: [
        'Geospatial Friction Heatmap',
        'Facility Performance Ledger',
        'Care Leakage Diagnostics',
      ],
    },
    {
      id: 'admin',
      title: t('auth.adminPortalTitle', 'Platform Admin'),
      subtitle: 'System governance, verification queue & telemetry',
      badge: t('auth.adminBadge', 'System Admin'),
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300',
      icon: <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      accentBorder: 'border-purple-500 ring-purple-500/20',
      features: [
        'User Management & Roles',
        'Healthcare Verification Queue',
        'System Telemetry & Monitoring',
      ],
    },
  ];

  const currentPortalConfig = portals.find((p) => p.id === activePortal) || portals[0];

  const handlePortalSwitch = (role: PortalRole) => {
    setActivePortal(role);
    setError(null);
    setSuccessMessage(null);
  };

  const handleDirectSignIn = async (roleEmail: string, rolePass: string, role: PortalRole) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setRedirectingMessage(`Authenticating ${roleEmail}...`);

    try {
      const res = await login(roleEmail, rolePass);
      if (res.success) {
        setRedirectingMessage(`Welcome back! Redirecting to dashboard...`);
        setTimeout(() => {
          navigate(getRoleDashboard(res.user?.role || role), { replace: true });
        }, 150);
      }
    } catch (err: any) {
      setRedirectingMessage(null);
      setError(err.response?.data?.message || 'Invalid credentials or server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email address and password.');
      return;
    }
    await handleDirectSignIn(email.trim(), password, activePortal);
  };

  const handleDirectRealGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);
    setRedirectingMessage('Connecting to Google OAuth...');

    try {
      const res = await authService.getGoogleAuthUrl(activePortal, GOOGLE_CLIENT_ID);
      if (res.success && res.url) {
        window.location.href = res.url;
        return;
      }
    } catch (err: any) {
      console.warn('Navigating directly to backend Google OAuth route:', err);
    }

    window.location.href = authService.getGoogleOAuthRedirectUrl(activePortal);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 sm:p-10 space-y-8 transition-all relative">
      {/* Redirecting Overlay */}
      {redirectingMessage && (
        <div className="absolute inset-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {redirectingMessage}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Synchronizing session with PFIS Security Gateway...
            </p>
          </div>
        </div>
      )}

      {/* Top Header & Localization */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            PFIS Universal Authentication Engine
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <LanguageSelector compact />
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Operational Healthcare Portals</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sign In — {currentPortalConfig.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Access your organization workspace, friction intelligence, and operational workflows.
        </p>
      </div>

      {/* Dedicated Portal Selection Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {portals.map((portal) => {
          const isSelected = activePortal === portal.id;
          return (
            <button
              type="button"
              key={portal.id}
              onClick={() => handlePortalSwitch(portal.id)}
              className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? `bg-slate-50/95 dark:bg-slate-800/95 border-2 shadow-sm ${portal.accentBorder}`
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs border border-slate-100 dark:border-slate-800">
                    {portal.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${portal.badgeColor}`}>
                    {portal.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {portal.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {portal.subtitle}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feature Highlights of the Active Portal */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Portal Capabilities for {currentPortalConfig.title}:</span>
          </span>
          <span className="text-[10px] text-slate-400">Enterprise Ready</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
          {currentPortalConfig.features.map((feat, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {successMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Google OAuth Button */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleDirectRealGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold text-sm rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs flex items-center justify-center gap-3 transition-all hover:shadow-sm disabled:opacity-50 group cursor-pointer"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>
            {isGoogleLoading
              ? 'Connecting to Google OAuth...'
              : `Sign In with Google Account (${currentPortalConfig.title})`}
          </span>
        </button>

        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-1 px-1">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Google OAuth 2.0 Enabled</span>
          </div>
          <span className="text-slate-400">
            Single Sign-On Supported
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
        <span className="bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider absolute">
          Or sign in with email credentials
        </span>
      </div>

      {/* Portal Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('auth.emailLabel', 'Email Address')}
          type="email"
          placeholder="user@organization.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label={t('auth.passwordLabel', 'Password')}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          <span>{`Sign In to ${currentPortalConfig.title}`}</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      {/* Bottom Footer & Account Registration */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
        <div>
          {t('auth.noAccount', "Don't have an account?")}{' '}
          <Link
            to={`/register?role=${activePortal}`}
            className="font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            {t('auth.createAccount', 'Register for PFIS')}
          </Link>
        </div>
        <div className="text-[11px] text-slate-400">
          Role: <strong className="text-slate-700 dark:text-slate-300 capitalize">{activePortal}</strong> • Non-Clinical Healthcare Platform
        </div>
      </div>
    </div>
  );
};
