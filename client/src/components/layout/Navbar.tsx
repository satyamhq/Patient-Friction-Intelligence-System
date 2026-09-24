import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  MapPin,
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  Building2,
  Menu,
  X,
  Sparkles,
  Settings as SettingsIcon,
  Laptop,
  Layers,
  LayoutDashboard,
  Cpu,
  CheckCircle2,
  Stethoscope,
  Users as UsersIcon,
  ShieldCheck,
  BookOpen,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { LanguageSelector } from '../common/LanguageSelector';
import { SimpleModeToggle } from '../common/SimpleModeToggle';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileNotifExpanded, setIsMobileNotifExpanded] = useState(false);

  // Close mobile drawer on escape key and lock body scroll when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsNotifOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn('Logout notice:', e);
    } finally {
      setIsMobileMenuOpen(false);
      window.location.href = '/login?logged_out=true';
    }
  };

  const isActive = (path: string) => routerLocation.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/favicon.svg"
                alt="PFIS Logo"
                className="w-8 h-8 rounded-xl shadow-xs group-hover:scale-105 transition-transform shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-none">
                  PFIS
                </span>
                <span className="text-[10px] font-medium text-slate-500 mt-0.5 hidden sm:inline tracking-tight">
                  Healthcare Access Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
            {/* PATIENT NAV */}
            {user?.role === 'patient' && (
              <>
                <Link
                  to="/patient/hospitals"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/patient/hospitals')
                      ? 'bg-teal-50 text-teal-800 border border-teal-200/80 font-bold shadow-2xs'
                      : 'hover:text-teal-700 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>Find Hospitals</span>
                </Link>

                <Link
                  to="/patient/teleconsult"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/patient/teleconsult')
                      ? 'bg-blue-50 text-blue-800 border border-blue-200 font-bold shadow-2xs'
                      : 'hover:text-blue-700 hover:bg-slate-50'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 text-blue-600" />
                  <span>Live Teleconsult</span>
                </Link>

                <Link
                  to="/patient/digital-twin"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/patient/digital-twin')
                      ? 'bg-teal-50 text-teal-800 border border-teal-200/80 font-bold shadow-2xs'
                      : 'hover:text-teal-700 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Digital Twin</span>
                </Link>

                <Link
                  to="/patient/dashboard"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/patient/dashboard')
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dashboard</span>
                </Link>
              </>
            )}

            {/* HOSPITAL NAV */}
            {user?.role === 'hospital' && (
              <>
                <Link
                  to="/hospital/dashboard"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/hospital/dashboard')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  Hospital Desk
                </Link>
                <Link
                  to="/hospital/requests"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/hospital/requests')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  Patient Queue
                </Link>
                <Link
                  to="/hospital/teleconsult"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    isActive('/hospital/teleconsult')
                      ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 text-blue-500" />
                  <span>Tele-Triage</span>
                </Link>
                <Link
                  to="/hospital/departments"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/hospital/departments')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  Departments & OPD
                </Link>
              </>
            )}

            {/* DOCTOR NAV */}
            {user?.role === 'doctor' && (
              <>
                <Link
                  to="/doctor/dashboard"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/doctor/dashboard')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Consultation Desk
                </Link>
                <Link
                  to="/doctor/queue"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/doctor/queue')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  OPD Queue
                </Link>
                <Link
                  to="/doctor/patient-review"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/doctor/patient-review')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Patient Review
                </Link>
                <Link
                  to="/hospital/referrals"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/hospital/referrals')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Referrals
                </Link>
              </>
            )}

            {/* ASHA WORKER NAV */}
            {user?.role === 'asha' && (
              <>
                <Link
                  to="/asha/dashboard"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/asha/dashboard')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Field Dashboard
                </Link>
                <Link
                  to="/asha/wizard"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    isActive('/asha/wizard')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Triage & Register</span>
                </Link>
                <Link
                  to="/asha/barriers"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/asha/barriers')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Record Barriers
                </Link>
                <Link
                  to="/asha/profile"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/asha/profile')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5 text-teal-600" />
                  <span>ASHA Profile</span>
                </Link>
              </>
            )}

            {/* GOVERNMENT OFFICIAL NAV */}
            {user?.role === 'government' && (
              <>
                <Link
                  to="/government/dashboard"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/government/dashboard')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  District Overview
                </Link>
                <Link
                  to="/government/friction-map"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/government/friction-map')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Friction Heatmap
                </Link>
                <Link
                  to="/admin/simulator"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    isActive('/admin/simulator')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-teal-600" />
                  <span>What-If Simulator</span>
                </Link>
                <Link
                  to="/admin/interventions"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/admin/interventions')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Policy Optimizer
                </Link>
              </>
            )}

            {/* ADMIN NAV */}
            {user?.role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/admin/dashboard')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  System Intelligence
                </Link>
                <Link
                  to="/admin/simulator"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    isActive('/admin/simulator')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50 text-teal-700'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>What-If Simulator</span>
                </Link>
                <Link
                  to="/admin/digital-twin"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    isActive('/admin/digital-twin')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Digital Twin</span>
                </Link>
                <Link
                  to="/admin/interventions"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/admin/interventions')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  Budget Optimizer
                </Link>
                <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-200">
                  <Link
                    to="/patient/dashboard"
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 transition-all flex items-center gap-1"
                    title="Open Patient Portal View"
                  >
                    <span>👤 Patient View</span>
                  </Link>
                  <Link
                    to="/hospital/dashboard"
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 transition-all flex items-center gap-1"
                    title="Open Hospital Desk View"
                  >
                    <span>🏥 Hospital View</span>
                  </Link>
                </div>
              </>
            )}

            {/* PUBLIC VISITOR NAV */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/demo"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/demo')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200 shadow-2xs'
                      : 'hover:text-teal-700 hover:bg-slate-50'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  <span>Demo</span>
                </Link>

                <Link
                  to="/demo/simulator"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/demo/simulator')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200 shadow-2xs'
                      : 'hover:text-teal-700 hover:bg-slate-50'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-teal-600" />
                  <span>Simulator</span>
                </Link>

                <Link
                  to="/docs"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/docs')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200 shadow-2xs'
                      : 'hover:text-teal-700 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Docs</span>
                </Link>

                <Link
                  to="/api"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/api')
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200 shadow-2xs'
                      : 'hover:text-teal-700 hover:bg-slate-50'
                  }`}
                >
                  <span>API</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Desktop-Only Action Controls */}
            <div className="hidden md:flex items-center gap-2 sm:gap-2.5">
              {/* Simple Mode Toggle */}
              <div className="hidden lg:block">
                <SimpleModeToggle />
              </div>

              {/* Global Language Selector */}
              <LanguageSelector />

              {/* Notification Bell */}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative transition-colors touch-target flex items-center justify-center border border-slate-200/60"
                    title={t('nav.notifications', 'Notifications')}
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4 text-slate-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Desktop Notifications Dropdown */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-card-hover border border-slate-200/80 py-3 z-50 overflow-hidden">
                      <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900">{t('nav.notifications', 'Notifications')}</h4>
                        <span className="text-[11px] font-medium text-slate-500">
                          {unreadCount} unread
                        </span>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => {
                                markAsRead(notif._id);
                                if (notif.actionUrl) {
                                  setIsNotifOpen(false);
                                  navigate(notif.actionUrl);
                                }
                              }}
                              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                                !notif.isRead ? 'bg-teal-50/50' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                                {!notif.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Profile Pill or Sign In Button (Desktop) */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                  <Link
                    to={
                      user.role === 'patient'
                        ? '/patient/settings'
                        : user.role === 'hospital'
                        ? '/hospital/settings'
                        : user.role === 'doctor'
                        ? '/doctor/profile'
                        : user.role === 'asha'
                        ? '/asha/profile'
                        : user.role === 'government'
                        ? '/government/dashboard'
                        : '/admin/settings'
                    }
                    title={t('nav.settings', 'Settings & Preferences')}
                    className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4" />
                  </Link>

                  <Link
                    to={
                      user.role === 'patient'
                        ? '/patient/profile'
                        : user.role === 'hospital'
                        ? '/hospital/profile'
                        : user.role === 'doctor'
                        ? '/doctor/profile'
                        : user.role === 'asha'
                        ? '/asha/profile'
                        : user.role === 'government'
                        ? '/government/dashboard'
                        : '/admin/dashboard'
                    }
                    className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-slate-100 text-left transition-colors border border-slate-200/60 bg-slate-50/50"
                  >
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      {user.role === 'hospital' ? (
                        <Building2 className="w-3.5 h-3.5 text-white" />
                      ) : user.role === 'admin' ? (
                        <Shield className="w-3.5 h-3.5 text-white" />
                      ) : user.role === 'doctor' ? (
                        <Stethoscope className="w-3.5 h-3.5 text-white" />
                      ) : user.role === 'asha' ? (
                        <UsersIcon className="w-3.5 h-3.5 text-white" />
                      ) : user.role === 'government' ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <UserIcon className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <div className="hidden lg:flex flex-col">
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {user.name?.split(' ')[0]}
                      </span>
                      <span className="text-[9px] font-bold text-teal-700 uppercase">
                        {user.role}
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    title={t('nav.logout', 'Sign Out')}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <a
                    href="https://github.com/satyamhq/Patient-Friction-Intelligence-System"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                    title="View GitHub Repository"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-600" />
                  </a>

                  <Link
                    to="/portals"
                    className="text-xs font-semibold text-slate-600 hover:text-teal-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Portals
                  </Link>

                  <Link
                    to="/demo"
                    className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Open Demo</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden touch-target flex items-center justify-center p-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors relative border border-slate-200/80"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              {isAuthenticated && unreadCount > 0 && !isMobileMenuOpen && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Clean, Accessible, Light Panel) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div
            className="relative w-[88vw] max-w-sm h-full bg-white shadow-card-hover flex flex-col z-50 overflow-hidden border-l border-slate-200 animate-in slide-in-from-right duration-250"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
          >
            {/* Drawer Header */}
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <img
                  src="/favicon.svg"
                  alt="PFIS Logo"
                  className="w-7 h-7 rounded-xl shadow-xs shrink-0"
                />
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-none">
                    PFIS
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 mt-0.5">Healthcare Access Intelligence</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="touch-target flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Profile Card / Auth Section */}
              {isAuthenticated && user ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {user.role === 'hospital' ? (
                        <Building2 className="w-5 h-5 text-white" />
                      ) : user.role === 'admin' ? (
                        <Shield className="w-5 h-5 text-white" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                          {user.role}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex gap-2">
                    <Link
                      to={
                        user.role === 'patient'
                          ? '/patient/profile'
                          : user.role === 'hospital'
                          ? '/hospital/profile'
                          : '/admin/dashboard'
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 text-center py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    >
                      View Profile
                    </Link>
                    <Link
                      to={
                        user.role === 'patient'
                          ? '/patient/settings'
                          : user.role === 'hospital'
                          ? '/hospital/settings'
                          : '/admin/settings'
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
                      title="Settings"
                    >
                      <SettingsIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    <UserIcon className="w-4 h-4 mr-2 text-teal-300" />
                    Sign In to Portal
                  </Link>
                  <Link
                    to="/demo"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs"
                  >
                    <Activity className="w-4 h-4 mr-2 text-white" />
                    Interactive Simulator Demo
                  </Link>
                </div>
              )}

              {/* Navigation Links Group */}
              <div className="space-y-1 pt-1">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Navigation
                </p>

                {/* Common Primary Links */}
                <Link
                  to="/patient/hospitals"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/patient/hospitals')
                      ? 'bg-teal-50 text-teal-800 border border-teal-200 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Find Hospitals & Doctors</span>
                </Link>

                <Link
                  to={user?.role === 'hospital' ? '/hospital/teleconsult' : '/patient/teleconsult'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/patient/teleconsult') || isActive('/hospital/teleconsult')
                      ? 'bg-blue-50 text-blue-800 border border-blue-200 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Laptop className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Live Teleconsult</span>
                </Link>

                <Link
                  to={user?.role === 'admin' ? '/admin/digital-twin' : '/patient/digital-twin'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/patient/digital-twin') || isActive('/admin/digital-twin')
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Digital Twin Simulator</span>
                </Link>

                {/* Dashboard Link */}
                <Link
                  to={
                    user?.role === 'patient'
                      ? '/patient/dashboard'
                      : user?.role === 'hospital'
                      ? '/hospital/dashboard'
                      : '/admin/dashboard'
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/patient/dashboard') ||
                    isActive('/hospital/dashboard') ||
                    isActive('/admin/dashboard')
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{t('nav.dashboard', 'Dashboard')}</span>
                </Link>

                {/* ASHA Profile link */}
                {user?.role === 'asha' && (
                  <Link
                    to="/asha/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <UserIcon className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>ASHA Worker Profile</span>
                  </Link>
                )}
              </div>

              {/* Notifications Accordion (Mobile) */}
              {isAuthenticated && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsMobileNotifExpanded(!isMobileNotifExpanded)}
                    className="w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-slate-500" />
                      <span>{t('nav.notifications', 'Notifications')}</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                      {unreadCount}
                    </span>
                  </button>

                  {isMobileNotifExpanded && (
                    <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto px-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 p-3 text-center">No notifications yet.</p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => {
                              markAsRead(notif._id);
                              if (notif.actionUrl) {
                                setIsMobileMenuOpen(false);
                                navigate(notif.actionUrl);
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                              !notif.isRead
                                ? 'bg-teal-50/70 border-teal-200'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Preferences & Language Group */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Preferences & Language
                </p>

                {/* Simple Language Mode switch */}
                <div className="px-1">
                  <SimpleModeToggle />
                </div>

                {/* Language Selector (Full-Width) */}
                <div className="px-1">
                  <LanguageSelector fullWidth={true} />
                </div>
              </div>
            </div>

            {/* Drawer Footer (Sign Out) */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.logout', 'Sign Out of System')}</span>
                </button>
              ) : (
                <p className="text-[10px] text-center text-slate-400">
                  Patient Friction Intelligence System • Operational Access Engine
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
