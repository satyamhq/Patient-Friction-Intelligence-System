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
  KeyRound,
  ShieldCheck,
  Globe,
  Loader2,
  Zap,
} from 'lucide-react';

type PortalRole = 'patient' | 'hospital' | 'admin';

interface PortalConfig {
  id: PortalRole;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  defaultEmail: string;
  defaultPass: string;
  accentBorder: string;
  features: string[];
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as PortalRole) || 'admin';

  const [activePortal, setActivePortal] = useState<PortalRole>(initialRole);
  const [email, setEmail] = useState('dhirajkumar464748@gmail.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [redirectingMessage, setRedirectingMessage] = useState<string | null>(null);

  const { user, isAuthenticated, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to the user's dashboard immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'hospital') navigate('/hospital/dashboard', { replace: true });
      else navigate('/patient/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Set default fields whenever portal switches
  useEffect(() => {
    if (activePortal === 'admin') {
      setEmail('dhirajkumar464748@gmail.com');
      setPassword('Admin@123');
    } else if (activePortal === 'hospital') {
      setEmail('hospital@apollo.org');
      setPassword('Hospital@123');
    } else {
      setEmail('patient@pfis.org');
      setPassword('Patient@123');
    }
  }, [activePortal]);

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
              setRedirectingMessage('Verifying Google credentials with MongoDB...');
              try {
                const res = await loginWithGoogle(response.credential, activePortalRef.current);
                if (res.success) {
                  setRedirectingMessage('Authenticated! Redirecting to Dashboard...');
                  setTimeout(() => {
                    if (res.user.role === 'admin') navigate('/admin/dashboard', { replace: true });
                    else if (res.user.role === 'hospital') navigate('/hospital/dashboard', { replace: true });
                    else navigate('/patient/dashboard', { replace: true });
                  }, 200);
                }
              } catch (err: any) {
                setRedirectingMessage(null);
                setError(err.response?.data?.message || 'Google authentication failed.');
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
      id: 'admin',
      title: t('auth.adminPortalTitle', 'Health Ministry & Administration'),
      subtitle: t('auth.adminPortalSubtitle', 'Statewide population health intelligence, policy simulation & audit'),
      badge: t('auth.adminBadge', 'Security Level 1'),
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300',
      icon: <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      defaultEmail: 'admin@pfis.org',
      defaultPass: 'Admin@123',
      accentBorder: 'border-purple-500 ring-purple-500/20',
      features: [
        'Population Friction Heatmaps & Geo-Analytics',
        'What-If Policy & Intervention Simulator',
        'Live Logged In Users Feed & Security Audit Stream',
      ],
    },
    {
      id: 'hospital',
      title: t('auth.hospitalPortalTitle', 'Hospital & Clinical Facility'),
      subtitle: t('auth.hospitalPortalSubtitle', 'Triage desk, patient intake review, & OPD capacity management'),
      badge: t('auth.hospitalBadge', 'Clinical Desk'),
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300',
      icon: <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      defaultEmail: 'hospital@apollo.org',
      defaultPass: 'Hospital@123',
      accentBorder: 'border-blue-500 ring-blue-500/20',
      features: [
        'Live Patient Triage & Risk Prioritization',
        'Daily Department Token Allocation',
        'Non-Clinical Barrier Accommodation Support',
      ],
    },
    {
      id: 'patient',
      title: t('auth.patientPortalTitle', 'Patient & Citizen Portal'),
      subtitle: t('auth.patientPortalSubtitle', 'Non-clinical barrier check, nearby hospitals, & OPD token request'),
      badge: t('auth.patientBadge', 'Citizen Access'),
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
      icon: <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      defaultEmail: 'patient@pfis.org',
      defaultPass: 'Patient@123',
      accentBorder: 'border-emerald-500 ring-emerald-500/20',
      features: [
        'Personal Friction Fingerprint',
        'Nearby Hospital Locator & Travel Estimation',
        'OPD Token Request & Teleconsultation',
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
    setRedirectingMessage(`Authenticating ${roleEmail} in MongoDB...`);

    try {
      const res = await login(roleEmail, rolePass);
      if (res.success) {
        setRedirectingMessage(`Welcome back! Redirecting to ${role} dashboard...`);
        setTimeout(() => {
          if (res.user.role === 'admin') navigate('/admin/dashboard', { replace: true });
          else if (res.user.role === 'hospital') navigate('/hospital/dashboard', { replace: true });
          else navigate('/patient/dashboard', { replace: true });
        }, 200);
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
    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }
    await handleDirectSignIn(email, password, activePortal);
  };

  // DIRECT REAL GOOGLE OAUTH 2.0 LOGIN
  const handleDirectRealGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);
    setRedirectingMessage('Opening official Google Cloud OAuth dialog...');

    try {
      const res = await authService.getGoogleAuthUrl(activePortal, GOOGLE_CLIENT_ID);
      if (res.success && res.url) {
        window.location.href = res.url;
        return;
      }
    } catch (err: any) {
      console.warn('Backend getGoogleAuthUrl did not return URL, navigating directly to backend Google OAuth route:', err);
    }

    // Direct backend OAuth endpoint navigation
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
              Synchronizing session with PFIS Intelligence Engine...
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>PFIS Health Ministry & Administration Command Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Admin Portal Sign In
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Health Ministry & Administrative Intelligence Engine. Sign in as Admin or switch to Clinical / Citizen access.
        </p>
      </div>

      {/* 3 Dedicated Portal Selection Cards with 1-Click Entry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {portals.map((portal) => {
          const isSelected = activePortal === portal.id;
          return (
            <div
              key={portal.id}
              onClick={() => handlePortalSwitch(portal.id)}
              className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? `bg-slate-50/95 dark:bg-slate-800/95 border-2 shadow-lg ${portal.accentBorder}`
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs border border-slate-100 dark:border-slate-800">
                    {portal.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${portal.badgeColor}`}>
                    {portal.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {portal.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {portal.subtitle}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px]">
                  {portal.defaultEmail}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectSignIn(portal.defaultEmail, portal.defaultPass, portal.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors ${
                    portal.id === 'admin'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : portal.id === 'hospital'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>Enter</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Specific Notice */}
      {activePortal === 'admin' && (
        <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-bold text-purple-900 dark:text-purple-200 block">
              Authorized Executive Admin Email: dhirajkumar464748@gmail.com & admin@pfis.org
            </span>
            <span className="text-[11px] text-purple-700 dark:text-purple-300">
              Only authorized administrative emails get access to the Admin Intelligence Suite. All other accounts are automatically routed to Patient or Clinical portals.
            </span>
          </div>
        </div>
      )}

      {/* Feature Highlights of the Active Portal */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Portal Capabilities for {currentPortalConfig.title}:</span>
          </span>
          <span className="text-[10px] text-slate-400">Live Dynamic System</span>
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

      {/* 1-Click Verified Demo Accounts Bar */}
      <div className="p-4 bg-slate-100/70 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-brand-600" />
            <span>1-Click Verified Database Credentials (Click to Sign In):</span>
          </span>
          <span className="text-[10px] text-slate-500 font-normal">Real MongoDB Accounts</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleDirectSignIn('dhirajkumar464748@gmail.com', 'Admin@123', 'admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              email === 'dhirajkumar464748@gmail.com'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
            }`}
          >
            🛡️ Dhiraj Kumar (dhirajkumar464748@gmail.com)
          </button>
          <button
            type="button"
            onClick={() => handleDirectSignIn('admin@pfis.org', 'Admin@123', 'admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              email === 'admin@pfis.org'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
            }`}
          >
            🛡️ Master Admin (admin@pfis.org)
          </button>
          <button
            type="button"
            onClick={() => handleDirectSignIn('hospital@apollo.org', 'Hospital@123', 'hospital')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              activePortal === 'hospital'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            🏥 Apollo Hospital (Clinical)
          </button>
          <button
            type="button"
            onClick={() => handleDirectSignIn('patient@pfis.org', 'Patient@123', 'patient')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              activePortal === 'patient'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
            }`}
          >
            👤 Sunita Devi (Patient)
          </button>
        </div>
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

      {/* REAL DIRECT GOOGLE OAUTH 2.0 BUTTON (NO POPUP SETUP MODAL) */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleDirectRealGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold text-sm rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-center gap-3 transition-all hover:shadow-md disabled:opacity-50 group cursor-pointer"
        >
          {/* Official Google G SVG Icon */}
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
              ? 'Opening Google Cloud OAuth Dialog...'
              : `Sign In with Real Google Account (${currentPortalConfig.title})`}
          </span>
        </button>

        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-1 px-1">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Google Cloud OAuth 2.0 Active & Verified</span>
          </div>
          <span className="text-slate-400">
            Real Google Accounts Login
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

      {/* Dynamic Portal Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('auth.emailLabel', 'Email Address')}
          type="email"
          placeholder={currentPortalConfig.defaultEmail}
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
            className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
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
