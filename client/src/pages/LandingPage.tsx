import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  MapPin,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Bus,
  FileCheck2,
  Users2,
  Coins,
  Clock,
  Laptop,
  Languages,
  Building2,
  Cpu,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { TTSButton } from '../components/common/TTSButton';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async (email: string, pass: string, redirectUrl: string) => {
    try {
      await login(email, pass);
      navigate(redirectUrl);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 md:space-y-20 lg:space-y-24 pb-16 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 pb-14 sm:pt-14 sm:pb-24 lg:pt-16 lg:pb-28 bg-gradient-to-b from-teal-50/70 via-white to-slate-50 border-b border-slate-200/80">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d948808_1px,transparent_1px),linear-gradient(to_bottom,#0d948808_1px,transparent_1px)] sm:bg-[linear-gradient(to_right,#0d94880a_1px,transparent_1px),linear-gradient(to_bottom,#0d94880a_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] sm:bg-[size:4rem_4rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-[11px] sm:text-xs font-bold border border-teal-200/80 dark:border-teal-800 shadow-xs mb-2 sm:mb-4 max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="truncate">{t('landing.heroTag', 'National Healthcare Accessibility Platform • Non-Clinical AI')}</span>
            </div>

            {/* Hero Main Heading */}
            <h1 className="text-[clamp(1.875rem,5.2vw,4.25rem)] font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
              {t('landing.heroTitle1', 'Healthcare may be available.')}{' '}
              <span className="bg-gradient-to-r from-brand-600 via-teal-600 to-teal-500 bg-clip-text text-transparent block mt-1">
                {t('landing.heroTitle2', 'But is it actually accessible?')}
              </span>
            </h1>

            {/* Subheading with Audio Read */}
            <div className="flex flex-col items-center gap-3">
              <p className="w-full max-w-[720px] mx-auto px-4 sm:px-0 text-[clamp(0.9375rem,1.2vw,1.125rem)] text-slate-600 leading-relaxed">
                {t(
                  'landing.heroSubtitle',
                  'PFIS identifies the practical barriers—from transit deficits and documentation gaps to wage loss—that prevent patients from completing care, helping healthcare systems choose high-impact interventions.'
                )}
              </p>
              <TTSButton
                text={`${t('landing.heroTitle1')} ${t('landing.heroTitle2')} ${t('landing.heroSubtitle')}`}
                label={t('common.listen', 'Listen')}
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 sm:pt-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-3.5 w-full max-w-md sm:max-w-none mx-auto">
                <Link to="/patient/hospitals" className="w-full sm:w-auto max-w-[360px] mx-auto sm:mx-0">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<MapPin className="w-5 h-5 shrink-0" />}
                    className="w-full min-h-[48px] px-6 text-sm sm:text-base font-semibold shadow-md"
                  >
                    {t('landing.findHospitals', 'Find Nearby Hospitals')}
                  </Button>
                </Link>

                {!isAuthenticated ? (
                  <Link to="/login?role=admin" className="w-full sm:w-auto max-w-[360px] mx-auto sm:mx-0">
                    <Button
                      variant="secondary"
                      size="lg"
                      icon={<Shield className="w-4 h-4 shrink-0" />}
                      className="w-full min-h-[48px] px-6 text-sm sm:text-base font-semibold shadow-md"
                    >
                      Admin Sign In
                    </Button>
                  </Link>
                ) : (
                  <Link
                    to={
                      user?.role === 'patient'
                        ? '/patient/dashboard'
                        : user?.role === 'hospital'
                        ? '/hospital/dashboard'
                        : '/admin/dashboard'
                    }
                    className="w-full sm:w-auto max-w-[360px] mx-auto sm:mx-0"
                  >
                    <Button
                      variant="secondary"
                      size="lg"
                      icon={<ArrowRight className="w-4 h-4 shrink-0" />}
                      className="w-full min-h-[48px] px-6 text-sm sm:text-base font-semibold shadow-md"
                    >
                      {t('landing.goToDashboard', 'Go to Your Dashboard')}
                    </Button>
                  </Link>
                )}
              </div>

              {/* Secondary portal links for unauthenticated */}
              {!isAuthenticated && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
                  <Link to="/login?role=hospital">
                    <button className="text-xs text-slate-600 hover:text-teal-600 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                      {t('landing.hospitalPortal', 'Hospital Desk Portal →')}
                    </button>
                  </Link>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <Link to="/login?role=patient">
                    <button className="text-xs text-slate-600 hover:text-teal-600 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                      {t('landing.patientLogin', 'Patient Portal →')}
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* 1-Click Instant Demo Launcher Bar */}
            <div className="pt-6 sm:pt-8 max-w-2xl mx-auto w-full">
              <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs border-b border-slate-800 pb-2.5 gap-1 text-left">
                  <span className="font-bold text-teal-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 shrink-0" />{' '}
                    {t('landing.quickDemoTitle', 'Instant Demo Role Access (1-Click Login):')}
                  </span>
                  <span className="text-[10px] text-slate-400">Pre-seeded realistic profiles</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <button
                    onClick={() =>
                      handleQuickDemoLogin('patient@pfis.org', 'Patient@123', '/patient/dashboard')
                    }
                    className="w-full p-3 bg-slate-800 hover:bg-teal-900/80 active:bg-teal-950 rounded-xl text-left border border-slate-700 hover:border-teal-500 transition-all min-h-[52px] flex flex-col justify-center group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {t('landing.patientView', 'Patient View')}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-teal-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">Sunita Devi (Ramgarh)</p>
                  </button>

                  <button
                    onClick={() =>
                      handleQuickDemoLogin('hospital@apollo.org', 'Hospital@123', '/hospital/dashboard')
                    }
                    className="w-full p-3 bg-slate-800 hover:bg-teal-900/80 active:bg-teal-950 rounded-xl text-left border border-slate-700 hover:border-teal-500 transition-all min-h-[52px] flex flex-col justify-center group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {t('landing.hospitalView', 'Hospital View')}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-teal-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">Apollo Super Speciality</p>
                  </button>

                  <button
                    onClick={() =>
                      handleQuickDemoLogin('admin@pfis.org', 'Admin@123', '/admin/dashboard')
                    }
                    className="w-full p-3 bg-slate-800 hover:bg-teal-900/80 active:bg-teal-950 rounded-xl text-left border border-slate-700 hover:border-teal-500 transition-all min-h-[52px] flex flex-col justify-center group sm:col-span-2 lg:col-span-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {t('landing.adminSuite', 'Admin Suite')}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-teal-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">Simulators & Heatmaps</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE CORE PROBLEM VS PFIS SOLUTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{t('landing.problemTag', 'The Invisible Healthcare Bottleneck')}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {t('landing.problemTitle', 'Why 74% of patient dropouts happen before the doctor consultation.')}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {t(
                'landing.problemDesc',
                'Traditional healthcare software assumes building a hospital is enough. Vulnerable patients encounter severe non-clinical friction:'
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <Bus className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">{t('landing.transportDeficit', 'Transport Deficits (36%)')}</strong>
                  <span className="text-slate-500">
                    {t('landing.transportDeficitDesc', 'No direct rural buses or unaffordable private auto fares over 40+ km distances.')}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <Coins className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">{t('landing.wageLoss', 'Daily Wage Loss (21%)')}</strong>
                  <span className="text-slate-500">
                    {t('landing.wageLossDesc', 'Rigid morning queues force daily wage earners to sacrifice essential food income.')}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <Laptop className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">{t('landing.digitalExclusion', 'Digital Exclusion')}</strong>
                  <span className="text-slate-500">
                    {t('landing.digitalExclusionDesc', 'Feature phone users unable to navigate smartphone apps or scan token QR codes.')}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <FileCheck2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">{t('landing.paperworkGaps', 'Scheme Paperwork Gaps')}</strong>
                  <span className="text-slate-500">
                    {t('landing.paperworkGapsDesc', 'Missing identity links preventing cashless Ayushman Bharat (PM-JAY) claims.')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Solution Highlight Visual Card */}
          <div className="bg-gradient-to-tr from-slate-900 to-navy-800 text-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-black">
                  8D
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Deterministic Friction Engine</h4>
                  <p className="text-[11px] text-teal-300">Explainable Multi-Factor Scoring</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-teal-950 text-teal-300 text-[10px] font-bold border border-teal-800">
                Non-Blackbox
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              PFIS evaluates 8 distinct socio-geographic vectors without ever making unverified medical
              claims. Every friction score provides transparent mathematical rationale:
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Travel Distance & Terrain</span>
                  <span className="font-bold text-rose-400">82 / 100 (Critical)</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full w-[82%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Public Transit Availability</span>
                  <span className="font-bold text-orange-400">75 / 100 (High)</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full w-[75%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Family & Caregiver Support</span>
                  <span className="font-bold text-amber-400">65 / 100 (Moderate)</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[65%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Digital Access & Literacy</span>
                  <span className="font-bold text-emerald-400">30 / 100 (Low)</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[30%]" />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Est. Care Completion Probability:</span>
              <span className="text-lg font-black text-teal-400">38% (High Dropout Risk)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW PFIS WORKS (THE 8 DIMENSIONS) */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('landing.eightDimensions', 'The 8 Dimensions of Healthcare Accessibility')}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              PFIS systematically quantifies friction across the entire non-clinical access envelope.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: MapPin,
                title: 'Travel Distance',
                desc: 'Haversine & road transit distance from rural habitations to specialized centers.',
                color: 'text-teal-600 bg-teal-50 border-teal-200',
              },
              {
                icon: Bus,
                title: 'Transport Availability',
                desc: 'Reliability of public buses, shared autos, and frequency of village transit.',
                color: 'text-rose-600 bg-rose-50 border-rose-200',
              },
              {
                icon: Laptop,
                title: 'Digital Access',
                desc: 'Smartphone literacy, network connectivity, and online slot booking familiarity.',
                color: 'text-blue-600 bg-blue-50 border-blue-200',
              },
              {
                icon: Languages,
                title: 'Language & Dialect',
                desc: 'Alignment between patient native dialect (e.g. Santali/Bhojpuri) and facility staff.',
                color: 'text-amber-600 bg-amber-50 border-amber-200',
              },
              {
                icon: Users2,
                title: 'Family & Caregiver',
                desc: 'Availability of family escorts to assist vulnerable or elderly patients in queues.',
                color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
              },
              {
                icon: FileCheck2,
                title: 'Documentation Status',
                desc: 'Completeness of Ayushman Bharat (PM-JAY) cards, past prescriptions, and referrals.',
                color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
              },
              {
                icon: Coins,
                title: 'Cost Burden',
                desc: 'Indirect out-of-pocket expenses including travel tickets, food, and medicine fees.',
                color: 'text-orange-600 bg-orange-50 border-orange-200',
              },
              {
                icon: Clock,
                title: 'Appointment Timing',
                desc: 'Flexibility of morning OPD hours vs daily wage earning shifts and evening availability.',
                color: 'text-purple-600 bg-purple-50 border-purple-200',
              },
            ].map((dim) => {
              const Icon = dim.icon;
              return (
                <div
                  key={dim.title}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all space-y-3"
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${dim.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{dim.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{dim.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. THE COMPLETE 9-STAGE PATIENT JOURNEY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('landing.nineStages', 'The 9-Stage Healthcare Journey')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed px-2">
            From the initial symptom recognition to 30-day post-treatment follow-up, PFIS highlights
            where patients get stuck and recommends timely operational interventions.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5 sm:gap-3">
          {[
            { step: '01', title: 'Medical Need', desc: 'Symptom recognized' },
            { step: '02', title: 'Hospital Search', desc: 'Facility discovery' },
            { step: '03', title: 'Travel', desc: 'Geographic transit' },
            { step: '04', title: 'Transport', desc: 'Bus / Auto commute' },
            { step: '05', title: 'Appointment', desc: 'Queue & slot booking' },
            { step: '06', title: 'Hospital Visit', desc: 'Desk registration' },
            { step: '07', title: 'Service', desc: 'Diagnostic testing' },
            { step: '08', title: 'Treatment', desc: 'Doctor consultation' },
            { step: '09', title: 'Follow-up', desc: 'Post-discharge regimen' },
          ].map((item, idx) => (
            <div
              key={item.step}
              className={`p-3 sm:p-3.5 rounded-xl border text-center space-y-1 sm:space-y-1.5 transition-all ${
                idx === 8 ? 'col-span-2 sm:col-span-1' : ''
              } ${
                idx === 2 || idx === 3
                  ? 'bg-rose-50/60 border-rose-200'
                  : idx === 0 || idx === 1
                  ? 'bg-teal-50/60 border-teal-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <span className="text-[10px] font-extrabold text-slate-400 block">{item.step}</span>
              <h5 className="font-bold text-xs text-slate-900">{item.title}</h5>
              <p className="text-[10px] text-slate-500 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHAT-IF SIMULATOR & INTERVENTION OPTIMIZER SHOWCASE */}
      <section className="bg-slate-900 text-white py-10 sm:py-16 rounded-2xl sm:rounded-3xl max-w-7xl mx-3 sm:mx-6 lg:mx-auto px-5 sm:px-10 lg:px-12 shadow-2xl border border-slate-800 space-y-8 sm:space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          <div className="space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 text-teal-300 text-xs font-bold border border-teal-800">
              <Cpu className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Operational Simulation Engine</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {t('landing.simulatorTitle', 'Simulate high-impact community interventions with precision.')}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t(
                'landing.simulatorDesc',
                'Model the exact care completion improvement when community transport, satellite diagnostic camps, or ASHA escorts are deployed.'
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
              <Link to="/admin/simulator" className="w-full sm:w-auto">
                <Button variant="primary" size="md" icon={<Sparkles className="w-4 h-4" />} className="w-full sm:w-auto min-h-[44px]">
                  {t('nav.whatIfSimulator', 'Open What-If Simulator')}
                </Button>
              </Link>
              <Link to="/admin/interventions" className="w-full sm:w-auto">
                <Button variant="outline" size="md" className="w-full sm:w-auto min-h-[44px] text-slate-900 bg-white hover:bg-slate-100">
                  {t('nav.budgetOptimizer', 'Try Budget Optimizer (₹10 Lakhs)')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Simulation Preview Card */}
          <div className="bg-slate-800/90 rounded-2xl p-4 sm:p-6 border border-slate-700 space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700 pb-3 text-xs gap-1">
              <span className="font-bold text-teal-400">Simulation Scenario: Multi-Tier Support</span>
              <span className="text-[10px] text-slate-400">Cohort: 1,000 Patients</span>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs">
                <span>1. Baseline Completion Rate:</span>
                <span className="font-bold text-rose-400">37%</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/80 border border-teal-900 text-xs">
                <span className="text-teal-300">+ Community Health Shuttle:</span>
                <span className="font-bold text-teal-400">37% → 62% (+25%)</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/80 border border-teal-900 text-xs">
                <span className="text-teal-300">+ Satellite Diagnostic Camp:</span>
                <span className="font-bold text-teal-400">62% → 79% (+17%)</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/80 border border-teal-900 text-xs">
                <span className="text-teal-300">+ ASHA Health Escort:</span>
                <span className="font-bold text-teal-400">79% → 89% (+10%)</span>
              </div>
            </div>

            <div className="p-3 bg-teal-950/60 border border-teal-800 rounded-xl text-xs flex justify-between items-center">
              <span className="text-slate-300 font-medium">Estimated Patients Saved:</span>
              <span className="font-black text-teal-300 text-sm">~520 Patients Helped</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ETHICAL AI & NON-CLINICAL SAFETY MANDATE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-teal-950">
                {t('landing.ethicalTitle', 'Ethical AI & Non-Clinical Safety Mandate')}
              </h3>
              <p className="text-xs text-teal-800">
                Built strictly for operational and physical healthcare access facilitation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-xs text-teal-900 leading-relaxed">
            <div className="space-y-1">
              <strong className="text-teal-950 block text-sm">
                {t('landing.zeroDiagnosis', '🚫 Zero Disease Diagnosis')}
              </strong>
              <p>
                PFIS does not analyze symptoms to diagnose diseases, prescribe pharmaceuticals, or act as
                an AI physician.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-teal-950 block text-sm">
                {t('landing.consentArch', '🔒 Patient Consent Architecture')}
              </strong>
              <p>
                No patient data is ever transmitted to a hospital without explicit, granular patient
                authorization and immutable audit logs.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-teal-950 block text-sm">
                {t('landing.explainableAI', '📊 Explainable Decision Science')}
              </strong>
              <p>
                Every barrier score is derived from deterministic rules and geo-spatial metrics, eliminating
                opaque black-box hallucinations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
