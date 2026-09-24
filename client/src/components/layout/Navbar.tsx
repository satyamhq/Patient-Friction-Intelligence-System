import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  MapPin,
  Bell,
  Menu,
  X,
  Sparkles,
  Layers,
  Cpu,
  Sliders,
  BookOpen,
  ExternalLink,
  ChevronDown,
  Globe,
  Github,
  CheckCircle2,
  Compass,
  FileCode2,
  Home,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { LanguageSelector } from '../common/LanguageSelector';
import { SimpleModeToggle } from '../common/SimpleModeToggle';
import { getActivePortalRole, PORTAL_CONFIGS, PortalRole } from './portalNavConfig';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPortalDropdownOpen, setIsPortalDropdownOpen] = useState(false);
  const portalDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const activeRole = getActivePortalRole(location.pathname);
  const activePortalConfig = activeRole ? PORTAL_CONFIGS[activeRole] : null;

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsNotifOpen(false);
        setIsPortalDropdownOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (portalDropdownRef.current && !portalDropdownRef.current.contains(e.target as Node)) {
        setIsPortalDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsPortalDropdownOpen(false);
    setIsNotifOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const portalEntries = Object.values(PORTAL_CONFIGS);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand Logo & Portal Context Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/favicon.svg"
                alt="PFIS Logo"
                className="w-8 h-8 rounded-xl shadow-xs group-hover:scale-105 transition-transform shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                  PFIS
                </span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:inline tracking-tight">
                  Healthcare Access Intelligence
                </span>
              </div>
            </Link>

            {/* Active Portal Indicator & Dropdown Switcher (Desktop) */}
            {activePortalConfig ? (
              <div className="relative hidden md:block" ref={portalDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsPortalDropdownOpen(!isPortalDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800 hover:bg-teal-100 transition-colors shadow-2xs cursor-pointer"
                  title="Switch Healthcare Role Persona"
                >
                  <activePortalConfig.icon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{activePortalConfig.shortTitle} Console</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {isPortalDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-card-hover border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Switch Healthcare Persona
                      </p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      {portalEntries.map((p) => {
                        const Icon = p.icon;
                        const isCurrent = p.role === activeRole;
                        return (
                          <Link
                            key={p.role}
                            to={p.basePath}
                            onClick={() => setIsPortalDropdownOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isCurrent
                                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold border border-teal-200/80 dark:border-teal-800'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-teal-600' : 'text-slate-400'}`} />
                            <div className="min-w-0">
                              <p className="truncate font-bold">{p.title}</p>
                              <p className="text-[10px] text-slate-400 truncate">{p.personaName}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="pt-1.5 px-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <Link
                        to="/portals"
                        onClick={() => setIsPortalDropdownOpen(false)}
                        className="text-[11px] font-bold text-teal-600 hover:underline flex items-center gap-1"
                      >
                        <Layers className="w-3 h-3" />
                        <span>View All 6 Portals</span>
                      </Link>
                      <Link
                        to="/"
                        onClick={() => setIsPortalDropdownOpen(false)}
                        className="text-[11px] text-slate-400 hover:text-slate-600"
                      >
                        Home
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Center: Universal Primary Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Link
              to="/portals"
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive('/portals')
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold border border-teal-200/80 dark:border-teal-800 shadow-2xs'
                  : 'hover:text-teal-700 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Portals</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 font-bold">6</span>
            </Link>

            <Link
              to="/demo/simulator"
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive('/demo/simulator')
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold border border-teal-200/80 dark:border-teal-800 shadow-2xs'
                  : 'hover:text-teal-700 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Simulator</span>
            </Link>

            <Link
              to="/government/friction-map"
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive('/government/friction-map')
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold border border-teal-200/80 dark:border-teal-800 shadow-2xs'
                  : 'hover:text-teal-700 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Friction Map</span>
            </Link>

            <Link
              to="/architecture"
              className={`hidden xl:flex px-3 py-1.5 rounded-xl transition-all items-center gap-1.5 ${
                isActive('/architecture')
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold border border-teal-200/80 dark:border-teal-800 shadow-2xs'
                  : 'hover:text-teal-700 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Architecture</span>
            </Link>

            <Link
              to="/docs"
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive('/docs')
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold border border-teal-200/80 dark:border-teal-800 shadow-2xs'
                  : 'hover:text-teal-700 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Docs</span>
            </Link>

            <Link
              to="/api"
              className={`hidden xl:flex px-3 py-1.5 rounded-xl transition-all items-center gap-1.5 ${
                isActive('/api')
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold border border-teal-200/80 dark:border-teal-800 shadow-2xs'
                  : 'hover:text-teal-700 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>API</span>
            </Link>
          </nav>

          {/* Right: Controls & CTAs */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Simple Mode Toggle */}
            <div className="hidden xl:block">
              <SimpleModeToggle />
            </div>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors touch-target flex items-center justify-center border border-slate-200/80 dark:border-slate-800"
                title={t('nav.notifications', 'Notifications')}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-card-hover border border-slate-200/80 dark:border-slate-800 py-3 z-50 overflow-hidden animate-in fade-in duration-150">
                  <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {t('nav.notifications', 'Notifications')}
                    </h4>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {unreadCount} unread
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
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
                          className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                            !notif.isRead ? 'bg-teal-50/50 dark:bg-teal-950/30' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">{notif.title}</p>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
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

            {/* GitHub Repo Link (Desktop) */}
            <a
              href="https://github.com/satyamhq/Patient-Friction-Intelligence-System"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-800"
              title="View on GitHub"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* Live Demo Primary CTA (Desktop) */}
            <Link
              to="/demo"
              className="hidden sm:inline-flex text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-all items-center gap-1.5 shrink-0"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Demo</span>
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={isMobileMenuOpen}
              className="lg:hidden touch-target flex items-center justify-center p-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative border border-slate-200/80 dark:border-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              {unreadCount > 0 && !isMobileMenuOpen && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Fully responsive, complete portal access) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div
            className="relative w-[90vw] max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-50 overflow-hidden border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            {/* Drawer Header */}
            <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-2.5">
                <img
                  src="/favicon.svg"
                  alt="PFIS Logo"
                  className="w-7 h-7 rounded-xl shadow-xs shrink-0"
                />
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                    PFIS
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Healthcare Access Intelligence
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="touch-target flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {/* Active Portal Banner (if user is inside a portal) */}
              {activePortalConfig && (
                <div className="p-3 bg-teal-50 dark:bg-teal-950/50 rounded-2xl border border-teal-200/80 dark:border-teal-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <activePortalConfig.icon className="w-4 h-4 text-teal-700 dark:text-teal-300 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        {activePortalConfig.shortTitle} Console Active
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {activePortalConfig.personaName}
                      </p>
                    </div>
                  </div>

                  {/* Contextual links for active portal */}
                  <div className="pt-2 border-t border-teal-200/60 dark:border-teal-800/80 grid grid-cols-2 gap-1.5">
                    {activePortalConfig.links.slice(0, 6).map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold truncate transition-colors ${
                          location.pathname === link.path
                            ? 'bg-teal-600 text-white font-bold'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-teal-100/50'
                        }`}
                      >
                        {link.shortName || link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 6 Healthcare Operational Portals (1-Tap Switch) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Switch Healthcare Persona
                  </p>
                  <Link
                    to="/portals"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[10px] font-bold text-teal-600 hover:underline"
                  >
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {portalEntries.map((p) => {
                    const Icon = p.icon;
                    const isCurrent = p.role === activeRole;
                    return (
                      <Link
                        key={p.role}
                        to={p.basePath}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isCurrent
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
                          <span className="text-xs font-bold truncate">{p.shortTitle}</span>
                        </div>
                        <p className={`text-[10px] truncate mt-0.5 ${isCurrent ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'}`}>
                          {p.personaName.split(' ')[0]}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Platform Public Intelligence Tools */}
              <div className="space-y-1">
                <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Platform Intelligence Tools
                </p>

                <Link
                  to="/demo/simulator"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/demo/simulator')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold border border-teal-200'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>What-If Policy Simulator</span>
                </Link>

                <Link
                  to="/government/friction-map"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/government/friction-map')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold border border-teal-200'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Compass className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Geospatial Friction Heatmap</span>
                </Link>

                <Link
                  to="/demo"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/demo')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold border border-teal-200'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Activity className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Interactive Live Demo</span>
                </Link>

                <Link
                  to="/architecture"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/architecture')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold border border-teal-200'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>System Architecture</span>
                </Link>

                <Link
                  to="/docs"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/docs')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold border border-teal-200'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Documentation Hub</span>
                </Link>

                <Link
                  to="/api"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/api')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold border border-teal-200'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileCode2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>OpenAPI Specification</span>
                </Link>

                <a
                  href="https://github.com/satyamhq/Patient-Friction-Intelligence-System"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Github className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                </a>
              </div>

              {/* Preferences & Language Group */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Preferences & Accessibility
                </p>

                <div className="px-1">
                  <SimpleModeToggle />
                </div>

                <div className="px-1">
                  <LanguageSelector fullWidth={true} />
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0 space-y-2">
              <Link
                to="/portals"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs"
              >
                <Layers className="w-4 h-4" />
                <span>Explore All Portals</span>
              </Link>

              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Back to Platform Home</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
