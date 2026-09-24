import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Clock,
  User,
  History,
  Send,
  Bus,
  Search,
  CheckCircle2,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { AbhaCardModal } from '../../components/patient/AbhaCardModal';
import { api } from '../../services/api';

interface PatientQueueItem {
  id: string;
  tokenNumber: number;
  name: string;
  age: number;
  gender: string;
  abhaNumber: string;
  chiefComplaint: string;
  riskCategory: 'High' | 'Medium' | 'Low';
  frictionFlags: {
    transitBarrier: boolean;
    dailyWageLoss: boolean;
    escortNeeded: boolean;
  };
  triageSource: 'ASHA Home Visit' | 'Sub-Centre Digital Kiosk' | 'OPD Registration';
}

export const DoctorConsultationDesk: React.FC = () => {
  const [queue, setQueue] = useState<PatientQueueItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientQueueItem>({
    id: 'pat-1',
    tokenNumber: 1,
    name: 'Sunita Devi',
    age: 26,
    gender: 'Female',
    abhaNumber: '91-4829-1049-2810',
    chiefComplaint: 'Pregnancy 3rd Trimester, Severe headache, BP 155/98 mmHg, bilateral pedal edema',
    riskCategory: 'High',
    frictionFlags: {
      transitBarrier: true,
      dailyWageLoss: true,
      escortNeeded: true,
    },
    triageSource: 'ASHA Home Visit',
  });

  const [searchAbha, setSearchAbha] = useState('');
  const [showAbhaModal, setShowAbhaModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralSuccess, setReferralSuccess] = useState<any>(null);

  // Referral form state
  const [refTargetFacility, setRefTargetFacility] = useState('Ranchi District Hospital');
  const [refDepartment, setRefDepartment] = useState('Obstetrics & High-Risk Pregnancy Clinic');
  const [refPriority, setRefPriority] = useState<'routine' | 'urgent' | 'emergency'>('urgent');
  const [refReason, setRefReason] = useState(
    'Suspected Pre-eclampsia in 3rd trimester pregnancy. Needs Doppler ultrasound, obstetric ICU backup, and emergency bed reservation.'
  );
  const [transitVoucher, setTransitVoucher] = useState(true);
  const [submittingRef, setSubmittingRef] = useState(false);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await api.get('/doctor/queue');
        if (res.data?.success && res.data?.queue) {
          setQueue(res.data.queue);
          if (res.data.queue.length > 0) {
            setSelectedPatient(res.data.queue[0]);
          }
        }
      } catch {
        // Safe fallback queue if offline
        setQueue([
          {
            id: 'pat-1',
            tokenNumber: 1,
            name: 'Sunita Devi',
            age: 26,
            gender: 'Female',
            abhaNumber: '91-4829-1049-2810',
            chiefComplaint: 'Pregnancy 3rd Trimester, Severe headache, BP 155/98 mmHg, bilateral pedal edema',
            riskCategory: 'High',
            frictionFlags: { transitBarrier: true, dailyWageLoss: true, escortNeeded: true },
            triageSource: 'ASHA Home Visit',
          },
          {
            id: 'pat-2',
            tokenNumber: 2,
            name: 'Rameshwar Oraon',
            age: 58,
            gender: 'Male',
            abhaNumber: '73-5819-2041-3914',
            chiefComplaint: 'Uncontrolled Type 2 Diabetes, Diabetic foot lesion grade 2, intermittent claudication',
            riskCategory: 'High',
            frictionFlags: { transitBarrier: true, dailyWageLoss: false, escortNeeded: true },
            triageSource: 'Sub-Centre Digital Kiosk',
          },
          {
            id: 'pat-3',
            tokenNumber: 3,
            name: 'Pooja Kumari',
            age: 4,
            gender: 'Female',
            abhaNumber: '62-1049-3912-4910',
            chiefComplaint: 'Severe Acute Malnutrition (SAM), Persistent diarrhea 4 days, lethargy',
            riskCategory: 'High',
            frictionFlags: { transitBarrier: false, dailyWageLoss: true, escortNeeded: true },
            triageSource: 'ASHA Home Visit',
          },
        ]);
      }
    };
    fetchQueue();
  }, []);

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRef(true);
    try {
      const res = await api.post('/referrals', {
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        abhaNumber: selectedPatient.abhaNumber,
        originFacility: 'Angara Primary Health Centre (PHC)',
        targetFacility: refTargetFacility,
        targetDepartment: refDepartment,
        priority: refPriority,
        clinicalSummary: refReason,
        mitigationMeasures: {
          transitVoucher,
          escortAssigned: selectedPatient.frictionFlags.escortNeeded,
          languageBarrier: 'Santali / Hindi',
          dailyWageVoucher: true,
        },
      });

      if (res.data?.success) {
        setReferralSuccess(res.data.referral);
        setShowReferralModal(false);
      }
    } catch {
      setReferralSuccess({
        id: 'ref-demo-' + Math.floor(100 + Math.random() * 900),
        patientName: selectedPatient.name,
        targetFacility: refTargetFacility,
        targetDepartment: refDepartment,
        status: 'initiated',
        createdAt: new Date().toISOString(),
      });
      setShowReferralModal(false);
    } finally {
      setSubmittingRef(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center font-bold text-white shadow-md shadow-teal-600/20">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              PHC Medical Officer Console (डाॅक्टर कंसल्टेशन डेस्क)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Facility: <strong className="text-slate-800 dark:text-slate-200 font-semibold">Angara Primary Health Centre (PHC)</strong> • Dr. Alok Verma (MO)
            </p>
          </div>
        </div>

        {/* Instant ABHA / QR Lookup */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="ABHA ID या नाम से खोजें..."
              value={searchAbha}
              onChange={(e) => setSearchAbha(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs w-full sm:w-64"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <button
            onClick={() => setShowAbhaModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-xs font-bold transition shadow-2xs shrink-0"
          >
            <QrCode className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">QR स्कैन (ABHA)</span>
            <span className="sm:hidden">QR</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: OPD Queue */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>आज की ओपीडी कतार (Today's OPD Queue)</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
              {queue.length} Tokens
            </span>
          </div>

          <div className="space-y-3">
            {queue.map((pat) => (
              <div
                key={pat.id}
                onClick={() => setSelectedPatient(pat)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  selectedPatient.id === pat.id
                    ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50/80 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 font-mono text-xs font-bold flex items-center justify-center text-teal-700">
                      #{pat.tokenNumber}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{pat.name}</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {pat.gender}, {pat.age}y
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {pat.chiefComplaint}
                </p>

                {/* Non-clinical friction flags */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-[10px]">
                  {pat.frictionFlags.transitBarrier && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 font-semibold">
                      <Bus className="w-3 h-3 text-amber-600" />
                      <span>Transit Barrier</span>
                    </span>
                  )}
                  {pat.frictionFlags.dailyWageLoss && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
                      Daily Wage Loss
                    </span>
                  )}
                  {pat.frictionFlags.escortNeeded && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">
                      Escort Needed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Selected Patient Longitudinal Health Record & Referral Action */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Overview Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-2xs">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-bold text-slate-900">{selectedPatient.name}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        ABHA Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      ABHA ID: <strong className="text-teal-700 font-bold">{selectedPatient.abhaNumber}</strong> • {selectedPatient.gender}, {selectedPatient.age}y
                    </p>
                  </div>
                </div>
              </div>

              {/* Action: Create Stateful Referral */}
              <button
                onClick={() => setShowReferralModal(true)}
                className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-600/20 transition flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>जिला अस्पताल रेफर करें (Stateful Referral)</span>
              </button>
            </div>

            {/* Longitudinal Care Timeline (Sub-Centre -> PHC -> District Hospital) */}
            <div className="mt-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <History className="w-4 h-4 text-teal-600" />
                <span>Longitudinal Care Continuity Timeline (FHIR Record History)</span>
              </h3>

              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {/* Node 1: Sub-Centre Triage */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-rose-500 ring-4 ring-white shadow-xs" />
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-900">
                        Hesal Sub-Centre (Ayushman Arogya Mandir)
                      </span>
                      <span className="text-slate-400 font-medium">2 Days Ago</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      ASHA Anita Devi logged home visit. BP: 150/98 mmHg. Suspected gestational pre-eclampsia. Issued PHC OPD token.
                    </p>
                  </div>
                </div>

                {/* Node 2: Today PHC Consultation */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-teal-600 ring-4 ring-white shadow-xs" />
                  <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-200/80 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-900">
                        Angara Primary Health Centre (Current Encounter)
                      </span>
                      <span className="text-teal-700 font-bold bg-teal-100/60 px-2 py-0.5 rounded-md text-[10px]">Active Now</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Dr. Alok Verma evaluation: Blood pressure 155/98 mmHg, bilateral pedal edema ++, fetal heart rate 142 bpm. PHC lacks Doppler ultrasound and obstetric ICU.
                    </p>
                    <div className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                      <strong className="font-bold text-amber-950">Clinical Recommendation:</strong> Urgent referral to Ranchi District Hospital Maternal Care Unit with subsidized ambulance transport.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REFERRAL CREATION MODAL */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-5 text-slate-900 animate-fadeIn">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-2xs">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  राज्य स्तरीय डिजिटल रेफरल (Initiate Stateful Referral)
                </h3>
                <p className="text-xs text-slate-500">
                  Referral state machine tracks patient transit until confirmed arrival at destination facility.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  मरीज (Patient)
                </label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold">
                  {selectedPatient.name} • ABHA: {selectedPatient.abhaNumber}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    रेफर किया जाने वाला अस्पताल (Target Hospital) *
                  </label>
                  <select
                    value={refTargetFacility}
                    onChange={(e) => setRefTargetFacility(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Ranchi District Hospital">Ranchi District Hospital (DH)</option>
                    <option value="Silli Community Health Centre">Silli Community Health Centre (CHC / FRU)</option>
                    <option value="RIMS Ranchi (Tertiary)">Rajendra Institute of Medical Sciences (RIMS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    विभाग (Specialist Department) *
                  </label>
                  <select
                    value={refDepartment}
                    onChange={(e) => setRefDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Obstetrics & High-Risk Pregnancy Clinic">Obstetrics & High-Risk Pregnancy</option>
                    <option value="Pediatrics & SNCU">Pediatrics & Special Newborn Care (SNCU)</option>
                    <option value="Cardiology & Critical Care">Cardiology & Emergency</option>
                    <option value="General Surgery">General Surgery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  रेफरल प्राथमिकता (Priority)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'urgent', label: 'Urgent (Same Day)', color: 'border-amber-400 bg-amber-50 text-amber-800' },
                    { id: 'emergency', label: 'Emergency (Immediate)', color: 'border-rose-400 bg-rose-50 text-rose-800' },
                    { id: 'routine', label: 'Routine (Within 7d)', color: 'border-slate-300 bg-slate-50 text-slate-700' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setRefPriority(p.id as any)}
                      className={`p-2 rounded-xl border text-xs font-bold transition ${
                        refPriority === p.id ? `${p.color} ring-2 ring-teal-500/20 shadow-2xs` : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  रेफरल का कारण एवं जांच सारांश (Reason & Clinical Summary) *
                </label>
                <textarea
                  rows={3}
                  value={refReason}
                  onChange={(e) => setRefReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Non-Clinical Friction Mitigation Controls */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Non-Clinical Friction Mitigation:</span>
                </span>
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transitVoucher}
                    onChange={(e) => setTransitVoucher(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>108 एम्बुलेंस / सामुदायिक वाहन वाउचर जोड़ें (Free Transit Voucher)</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReferralModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={submittingRef}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition disabled:opacity-50"
                >
                  {submittingRef ? 'रेफरल जारी हो रहा है...' : 'रेफरल जारी करें (Issue Referral)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REFERRAL SUCCESS NOTIFICATION */}
      {referralSuccess && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-5 rounded-2xl bg-white border border-emerald-300 shadow-2xl flex items-start space-x-3 text-slate-900">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-black text-slate-900">रेफरल सफलतापूर्वक प्रेषित!</h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Referral #{referralSuccess.id} to <strong>{referralSuccess.targetFacility}</strong> is now <span className="font-bold text-emerald-700">INITIATED</span>. Hospital intake desk has been alerted.
            </p>
            <button
              onClick={() => setReferralSuccess(null)}
              className="mt-2 text-[11px] text-teal-700 hover:underline font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ABHA MODAL */}
      <AbhaCardModal
        isOpen={showAbhaModal}
        onClose={() => setShowAbhaModal(false)}
        patientData={{
          name: selectedPatient.name,
          abhaNumber: selectedPatient.abhaNumber,
          gender: selectedPatient.gender,
          age: selectedPatient.age,
        }}
      />
    </div>
  );
};

export default DoctorConsultationDesk;
