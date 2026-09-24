import React, { useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Layers, ChevronRight } from 'lucide-react';
import { getActivePortalRole, PORTAL_CONFIGS } from './portalNavConfig';

export const MobilePortalNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const role = getActivePortalRole(location.pathname);
  if (!role) return null;

  const config = PORTAL_CONFIGS[role];
  const Icon = config.icon;

  // Auto-scroll active item into view horizontally
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [location.pathname]);

  return (
    <div className="lg:hidden mb-4 sm:mb-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-2.5 sm:p-3 space-y-2.5">
      {/* Mobile Portal Header Row */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-black text-slate-900 dark:text-white tracking-tight truncate">
              {config.shortTitle} Console
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
              {config.personaName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/portals')}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200/80 dark:border-teal-800 transition-colors shrink-0 cursor-pointer shadow-2xs"
          title="Switch to another healthcare persona"
        >
          <Layers className="w-3 h-3 text-teal-600 dark:text-teal-400" />
          <span>Switch Portal</span>
          <ChevronRight className="w-3 h-3 opacity-60" />
        </button>
      </div>

      {/* Horizontal Swipeable Nav Strip */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5"
        tabIndex={0}
        role="tablist"
        aria-label={`${config.shortTitle} Portal Subnavigation`}
      >
        {config.links.map((link) => {
          const ItemIcon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              data-active={isActive ? 'true' : 'false'}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap touch-target ${
                isActive
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{link.shortName || link.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
