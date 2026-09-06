import React, { useState } from 'react';
import {
  Sliders,
  Send,
  CheckCircle2,
  AlertCircle,
  Truck,
  Bus,
  Clock,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  Building2,
  Calendar,
} from 'lucide-react';
import { governmentService } from '../../services/governmentService';

export const GovernmentInterventions: React.FC = () => {
  const [blockName, setBlockName] = useState('Phagwara Rural');
  const [interventionType, setInterventionType] = useState('MOBILE_MEDICAL_UNIT');
  const [targetAllocation, setTargetAllocation] = useState('2 MMU Vans on Tue/Thu Schedule');
  const [justification, setJustification] = useState(
    'Address 34.2% care leakage in Phagwara Rural caused by bus route cancellations.'
  );
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [activeOrders, setActiveOrders] = useState([
    {
      id: 'ORD-GOV-982101',
      block: 'Sultanpur Lodhi',
      type: 'Riverbank Boat Transit Subsidy',
      allocation: '4 Subsidized Ferry Trips Daily',
      status: 'ACTIVE_DISPATCH',
      estimatedLeakageReduction: '-8.5%',
      commissionedAt: '2026-09-02',
    },
    {
      id: 'ORD-GOV-982102',
      block: 'Chaheru / Khera Sector',
      type: 'PHC Evening OPD Shift Extension',
      allocation: 'Doctor & Nurse Staggered Hours (5pm - 8pm)',
      status: 'ACTIVE_DISPATCH',
      estimatedLeakageReduction: '-5.2%',
      commissionedAt: '2026-09-03',
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    try {
      const res = await governmentService.triggerResourceAllocation({
        blockName,
        interventionType,
        targetAllocation,
        justification,
      });

      if (res.success) {
        setSuccessMsg(`Resource allocation order successfully commissioned (ID: ${res.allocationOrder?.orderId})!`);
        setActiveOrders([
          {
            id: res.allocationOrder?.orderId || `ORD-${Date.now()}`,
            block: blockName,
            type: interventionType.replace(/_/g, ' '),
            allocation: targetAllocation,
            status: 'ACTIVE_DISPATCH',
            estimatedLeakageReduction: '-6.8%',
            commissionedAt: new Date().toISOString().split('T')[0],
          },
          ...activeOrders,
        ]);
      }
    } catch (err: any) {
      console.error('Failed to trigger resource allocation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Commission Healthcare Interventions</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Targeted resource dispatch to eliminate non-clinical friction barriers in rural blocks
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Commission Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-500" /> Issue District Intervention Directive
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Target District Block
            </label>
            <select
              value={blockName}
              onChange={(e) => setBlockName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Phagwara Rural">Phagwara Rural (Friction 68)</option>
              <option value="Chaheru / Khera Sector">Chaheru / Khera Sector (Friction 59)</option>
              <option value="Sultanpur Lodhi">Sultanpur Lodhi Riverbank (Friction 74)</option>
              <option value="Kapurthala Urban">Kapurthala Urban (Friction 38)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Intervention Class
            </label>
            <select
              value={interventionType}
              onChange={(e) => setInterventionType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="MOBILE_MEDICAL_UNIT">Mobile Medical Unit (MMU) Van</option>
              <option value="TRANSIT_VOUCHER_SUBSIDY">Doorstep Transport Voucher Subsidy</option>
              <option value="EXTENDED_EVENING_OPD">Extended Evening PHC OPD Hours</option>
              <option value="COMMUNITY_DIAGNOSTIC_CAMP">Mobile Blood & Diagnostic Van</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Resource Allocation Detail
          </label>
          <input
            type="text"
            value={targetAllocation}
            onChange={(e) => setTargetAllocation(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Administrative Justification & Expected Friction Reduction
          </label>
          <textarea
            rows={2}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" /> Commission & Dispatch Directive
        </button>
      </form>

      {/* Active Interventions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Active District Directives in Operation
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-semibold text-slate-400">
              <tr>
                <th className="pb-3 px-3">Order ID</th>
                <th className="pb-3 px-3">Block</th>
                <th className="pb-3 px-3">Directive Type</th>
                <th className="pb-3 px-3">Resource Allocation</th>
                <th className="pb-3 px-3">Est. Leakage Reduction</th>
                <th className="pb-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-mono text-blue-600 dark:text-blue-400">{ord.id}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{ord.block}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{ord.type}</td>
                  <td className="py-3 px-3 text-slate-500">{ord.allocation}</td>
                  <td className="py-3 px-3 font-bold text-emerald-600">{ord.estimatedLeakageReduction}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
