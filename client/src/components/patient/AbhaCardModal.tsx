import React, { useState } from 'react';
import { QrCode, ShieldCheck, Download, CheckCircle2, User, Copy, X } from 'lucide-react';

interface AbhaCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientData?: {
    name?: string;
    gender?: string;
    age?: number;
    phone?: string;
    abhaNumber?: string;
    abhaAddress?: string;
    state?: string;
    district?: string;
  };
}

export const AbhaCardModal: React.FC<AbhaCardModalProps> = ({
  isOpen,
  onClose,
  patientData = {
    name: 'Sunita Devi',
    gender: 'Female',
    age: 28,
    phone: '9876543210',
    abhaNumber: '91-4829-1029-4821',
    abhaAddress: 'sunita.devi@abdm',
    state: 'Jharkhand',
    district: 'Ranchi',
  },
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const abhaNum = patientData.abhaNumber || '91-4829-1029-4821';
  const abhaAddr = patientData.abhaAddress || 'sunita.devi@abdm';

  const handleCopy = () => {
    navigator.clipboard?.writeText(abhaNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Header close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/80 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ABDM Card Front */}
        <div className="p-6 bg-gradient-to-br from-orange-500/10 via-white to-emerald-500/10 border-b border-slate-200">
          {/* Top Tricolor Strip & National Authority Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs shadow">
                AB
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  National Health Authority
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  Ayushman Bharat Digital Mission (ABDM)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-semibold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified ID</span>
            </div>
          </div>

          {/* Main Card Body */}
          <div className="mt-4 flex items-center gap-5">
            {/* Avatar block */}
            <div className="relative w-24 h-24 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center shrink-0 overflow-hidden shadow-inner">
              <User className="w-12 h-12 text-slate-400" />
              <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Photo</span>
            </div>

            {/* Patient Credentials */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 truncate">{patientData.name}</h3>
              <p className="text-xs text-slate-600">
                {patientData.gender} • YOB: {2026 - (patientData.age || 28)}
              </p>
              <div className="mt-2 space-y-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    ABHA Number
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-base font-extrabold text-brand-700 tracking-wide">
                      {abhaNum}
                    </span>
                    <button
                      onClick={handleCopy}
                      title="Copy ABHA Number"
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    ABHA Address
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-700">
                    {abhaAddr}
                  </span>
                </div>
              </div>
            </div>

            {/* Verifiable QR Code Block */}
            <div className="shrink-0 p-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
              {/* Dynamic SVG QR Symbol */}
              <div className="w-20 h-20 bg-slate-900 p-1.5 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                  {/* Outer Frame */}
                  <rect x="0" y="0" width="30" height="30" rx="4" />
                  <rect x="6" y="6" width="18" height="18" fill="#0f172a" rx="2" />
                  <rect x="10" y="10" width="10" height="10" rx="1" />

                  <rect x="70" y="0" width="30" height="30" rx="4" />
                  <rect x="76" y="6" width="18" height="18" fill="#0f172a" rx="2" />
                  <rect x="80" y="10" width="10" height="10" rx="1" />

                  <rect x="0" y="70" width="30" height="30" rx="4" />
                  <rect x="6" y="76" width="18" height="18" fill="#0f172a" rx="2" />
                  <rect x="10" y="80" width="10" height="10" rx="1" />

                  {/* QR Data Matrix simulation */}
                  <rect x="40" y="10" width="8" height="8" />
                  <rect x="52" y="10" width="8" height="8" />
                  <rect x="40" y="24" width="8" height="8" />
                  <rect x="52" y="24" width="8" height="8" />

                  <rect x="10" y="42" width="8" height="8" />
                  <rect x="24" y="42" width="8" height="8" />
                  <rect x="40" y="40" width="20" height="20" rx="2" />
                  <rect x="70" y="42" width="8" height="8" />
                  <rect x="84" y="42" width="8" height="8" />

                  <rect x="40" y="70" width="8" height="8" />
                  <rect x="52" y="70" width="8" height="8" />
                  <rect x="70" y="70" width="12" height="12" />
                  <rect x="86" y="70" width="6" height="6" />
                  <rect x="70" y="86" width="12" height="12" />
                </svg>
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase mt-1 flex items-center gap-1">
                <QrCode className="w-2.5 h-2.5" /> Scan QR
              </span>
            </div>
          </div>

          {/* Footer of Card */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>District: {patientData.district || 'Ranchi'}, {patientData.state || 'Jharkhand'}</span>
            <span className="font-semibold text-emerald-700">✓ 100% ABDM Interoperable</span>
          </div>
        </div>

        {/* Action Tray */}
        <div className="p-4 bg-slate-50 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            Present this card at any Sub-Centre, PHC, or District Hospital for instant registration.
          </p>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-medium text-xs shadow hover:bg-brand-700 transition shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save / Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};
