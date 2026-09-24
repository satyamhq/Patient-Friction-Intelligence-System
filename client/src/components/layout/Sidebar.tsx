import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { getActivePortalRole, PORTAL_CONFIGS, PortalRole } from './portalNavConfig';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamically adapt active role to current route for zero-login seamless portal switching
  const detectedRole = getActivePortalRole(location.pathname);
  const role: PortalRole = detectedRole || 'patient';
  const config = PORTAL_CONFIGS[role];
  const Icon = config.icon;

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation • {config.shortTitle.toUpperCase()}
        </div>
        {config.links.map((link) => {
          const ItemIcon = link.icon;
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
              <ItemIcon className="w-4 h-4 shrink-0" />
              <span className="truncate">{link.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Role Indicator & Portal Switcher */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 space-y-3 shrink-0">
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {config.personaName}
            </p>
            <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              {config.shortTitle} Portal
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/portals')}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Switch Portal</span>
        </button>
      </div>
    </aside>
  );
};
