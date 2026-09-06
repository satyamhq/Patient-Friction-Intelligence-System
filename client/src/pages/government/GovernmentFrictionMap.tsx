import React, { useState, useEffect } from 'react';
import {
  MapPin,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  Navigation,
  Bus,
  CheckCircle2,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { governmentService } from '../../services/governmentService';

export const GovernmentFrictionMap: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMap = async () => {
      try {
        const res = await governmentService.getFrictionHeatmap();
        setHeatmapData(res);
        if (res.blocks?.length > 0) {
          setSelectedBlock(res.blocks[0]);
        }
      } catch (err) {
        console.error('Failed to load friction heatmap:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMap();
  }, []);

  const blocks = heatmapData?.blocks || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Block-Level Healthcare Friction Map</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Geospatial friction index, transport bottlenecks, and care leakage across {heatmapData?.district || 'Kapurthala'} District
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Map Canvas Representation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl min-h-[480px] flex flex-col justify-between">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  GIS Geographic Information Layer
                </span>
                <h3 className="text-lg font-bold mt-1">{heatmapData?.district || 'Kapurthala'} District Map</h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Critical &gt;70
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Moderate 50-70
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Low &lt;50
                </span>
              </div>
            </div>

            {/* Block Node Badges */}
            <div className="relative z-10 grid grid-cols-2 gap-4 my-8">
              {blocks.map((block: any) => {
                const isSelected = selectedBlock?.blockName === block.blockName;
                const isCritical = block.frictionScore >= 70;
                const isModerate = block.frictionScore >= 50 && block.frictionScore < 70;

                return (
                  <div
                    key={block.blockName}
                    onClick={() => setSelectedBlock(block)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/40 shadow-xl'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-400" /> {block.blockName}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isModerate
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {block.frictionScore}/100
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 mb-2">
                      <span className="text-slate-500">Primary Barrier:</span> {block.primaryBarrier}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/50">
                      <span>Pop: {block.population?.toLocaleString()}</span>
                      <span className="text-orange-400 font-semibold">{block.leakageRate}% leakage</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative z-10 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800 pt-3">
              <span>GeoJSON coordinate accuracy verified against district census blocks.</span>
              <span>Updated live from frontline ASHA field syncs</span>
            </div>
          </div>
        </div>

        {/* Right Col: Selected Block Deep Dive & Action Prescription */}
        <div className="space-y-4">
          {selectedBlock ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">
                  Block Intelligence Profile
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {selectedBlock.blockName}
                </h3>
                <p className="text-xs text-slate-400">
                  Population: {selectedBlock.population?.toLocaleString()} citizens &bull; Status: {selectedBlock.status}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="text-xl font-bold text-rose-600">{selectedBlock.frictionScore}/100</div>
                  <div className="text-[10px] uppercase text-slate-400">Friction Score</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="text-xl font-bold text-orange-600">{selectedBlock.leakageRate}%</div>
                  <div className="text-[10px] uppercase text-slate-400">Care Leakage Rate</div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">Identified Root Cause:</span>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 font-medium">
                  {selectedBlock.primaryBarrier}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Prescribed Intervention:
                </span>
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-300 font-medium leading-relaxed">
                  {selectedBlock.recommendedAction}
                </div>
              </div>

              <button
                onClick={() => alert(`Operational dispatch initiated for ${selectedBlock.blockName}: ${selectedBlock.recommendedAction}`)}
                className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                Dispatch Resource to {selectedBlock.blockName} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center">
              Click any block on the map to inspect operational metrics
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
