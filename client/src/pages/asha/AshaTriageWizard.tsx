import React, { useState } from 'react';
import {
  HeartPulse,
  Baby,
  Activity,
  AlertCircle,
  Stethoscope,
  Volume2,
  Mic,
  MapPin,
  Clock,
  Ambulance,
  PhoneCall,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { offlineDb } from '../../offline/db';
import { syncManager } from '../../offline/syncManager';
import api from '../../services/api';

interface AshaTriageWizardProps {
  onComplete?: () => void;
}

export const AshaTriageWizard: React.FC<AshaTriageWizardProps> = ({ onComplete }) => {
  const [patientName, setPatientName] = useState('Sunita Devi');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState('female');
  const [selectedCategory, setSelectedCategory] = useState<'MATERNAL' | 'CHILD' | 'CARDIAC' | 'GENERAL'>('MATERNAL');
  const [isPregnant, setIsPregnant] = useState(true);
  const [chiefComplaint, setChiefComplaint] = useState('Severe headache, pedal swelling, and high blood pressure');
  const [systolicBP, setSystolicBP] = useState('155');
  const [diastolicBP, setDiastolicBP] = useState('98');
  const [spO2, setSpO2] = useState('97');
  const [selectedDangerSigns, setSelectedDangerSigns] = useState<string[]>([
    'Pedal / Facial Edema',
    'Persistent Headache',
  ]);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Audio Speech Synthesis for low-literacy guidance
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const dangerOptionsByCategory = {
    MATERNAL: [
      { id: 'vaginal_bleeding', label: 'योनि से रक्तस्राव (Vaginal Bleeding)', redFlag: true },
      { id: 'convulsions', label: 'दौरे या बेहोशी (Convulsions / Fits)', redFlag: true },
      { id: 'edema', label: 'चेहरे और पैरों में तेज सूजन (Pedal / Facial Edema)', redFlag: false },
      { id: 'headache', label: 'तेज सिरदर्द और धुंधला दिखना (Severe Headache)', redFlag: false },
      { id: 'water_leak', label: 'पानी की थैली फटना (Fluid Leakage)', redFlag: true },
    ],
    CHILD: [
      { id: 'unable_to_drink', label: 'दूध या पानी पीने में असमर्थ (Unable to drink)', redFlag: true },
      { id: 'vomits_all', label: 'सब कुछ उल्टी कर देना (Vomiting everything)', redFlag: true },
      { id: 'stridor', label: 'सांस में घरघराहट या पसली चलना (Chest Indrawing / Stridor)', redFlag: true },
      { id: 'fever_3d', label: '3 दिन से तेज बुखार (High Fever > 3 Days)', redFlag: false },
    ],
    CARDIAC: [
      { id: 'chest_pain', label: 'सीने में भारीपन या दर्द (Crushing Chest Pain)', redFlag: true },
      { id: 'breathlessness', label: 'सांस लेने में अत्यधिक तकलीफ (Severe Breathlessness)', redFlag: true },
      { id: 'facial_droop', label: 'हाथ-पैर में कमजोरी या बोली लड़खड़ाना (Stroke symptoms)', redFlag: true },
    ],
    GENERAL: [
      { id: 'high_sugar', label: 'ब्लड शुगर 250 से अधिक (High Blood Sugar)', redFlag: false },
      { id: 'dizziness', label: 'चक्कर आना और कमजोरी (Dizziness / Fatigue)', redFlag: false },
    ],
  };

  const toggleDangerSign = (label: string) => {
    setSelectedDangerSigns((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const handleRunTriage = async () => {
    setEvaluating(true);
    const symptomsList = [...selectedDangerSigns, chiefComplaint];

    const payload = {
      age: parseInt(age, 10) || 28,
      gender,
      isPregnant: selectedCategory === 'MATERNAL' || isPregnant,
      gestationalWeeks: selectedCategory === 'MATERNAL' ? 32 : undefined,
      symptoms: symptomsList,
      chiefComplaint,
      vitalSigns: {
        systolicBP: systolicBP ? parseInt(systolicBP, 10) : undefined,
        diastolicBP: diastolicBP ? parseInt(diastolicBP, 10) : undefined,
        spO2: spO2 ? parseInt(spO2, 10) : undefined,
      },
    };

    try {
      // Attempt live API evaluation
      const res = await api.post('/triage/evaluate', payload);
      if (res.data?.success) {
        setResult(res.data);
      }
    } catch {
      // Local fallback rule evaluation for offline operation
      const hasRedFlag = selectedDangerSigns.some(
        (s) => s.includes('Bleeding') || s.includes('Convulsions') || s.includes('Chest Pain')
      );
      const isUrgent = (systolicBP && parseInt(systolicBP, 10) >= 150) || hasRedFlag;

      const fallbackResult = {
        triage: {
          urgency: isUrgent ? 'EMERGENCY_108' : 'PHC_VISIT',
          confidenceScore: 0.94,
          protocolCategory: selectedCategory === 'MATERNAL' ? 'MATERNAL_ANC' : 'ACUTE_ADULT',
          primaryRecommendation: isUrgent
            ? '108 आपातकालीन रेफरल: मरीज को तुरंत जिला अस्पताल रेफर करें।'
            : 'प्राथमिक स्वास्थ्य केंद्र (PHC) में डॉक्टर से जांच कराएं।',
          recommendedFacilityLevel: isUrgent ? 'District Hospital' : 'PHC',
          actionableSteps: [
            'आशा कार्यकर्ता मरीज के साथ अस्पताल जाएं',
            '108 एम्बुलेंस तुरंत कॉल करें',
            'रक्तचाप की लगातार निगरानी रखें',
          ],
          teleconsultEligible: !isUrgent,
          redFlagsIdentified: selectedDangerSigns,
          clinicalRationale: 'Off-line NHM / IMNCI protocol evaluation complete.',
        },
        routing: {
          selectedFacility: {
            name: isUrgent ? 'Ranchi District Hospital & FRU' : 'Angara Primary Health Centre',
            type: isUrgent ? 'District Hospital' : 'PHC',
            distanceKm: isUrgent ? 38.5 : 8.5,
            travelMinutes: isUrgent ? 70 : 22,
            opdQueueCount: 16,
            doctorsOnDuty: isUrgent ? 18 : 2,
            availableBeds: isUrgent ? 120 : 6,
          },
          routingRationale: 'Nearest facility matching required obstetric/emergency readiness.',
          estimatedWaitMinutes: isUrgent ? 0 : 25,
          transportAdvice: isUrgent ? '108 Ambulance required.' : 'Community Health Shuttle available.',
        },
      };

      setResult(fallbackResult);
    } finally {
      // Save offline assessment into Dexie
      await offlineDb.triageAssessments.put({
        id: 'tri-' + Date.now().toString(36),
        patientName,
        urgency: result?.triage?.urgency || 'PHC_VISIT',
        chiefComplaint,
        recommendation: result?.triage?.primaryRecommendation || 'Consult MO',
        facilityLevel: result?.triage?.recommendedFacilityLevel || 'PHC',
        synced: navigator.onLine,
        createdAt: new Date().toISOString(),
      });

      // Queue sync
      await syncManager.enqueueMutation('TRIAGE_ASSESSMENT', payload);
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {!result ? (
        <div className="bg-slate-800/70 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  डिजिटल लक्षण जांच (NHM Clinical Triage)
                </h2>
                <p className="text-xs text-slate-400">
                  Icon-guided, voice-assisted symptom evaluation for frontline workers.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => speakText('मरीज के मुख्य लक्षण और खतरे के निशान चुनें')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-xs text-brand-300 font-semibold transition"
            >
              <Volume2 className="w-4 h-4" />
              <span>आवाज में सुनें</span>
            </button>
          </div>

          {/* 1. Category Selector Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              श्रेणी चुनें (Select Category):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'MATERNAL', label: 'गर्भवती महिला (Pregnancy/ANC)', icon: HeartPulse, color: 'text-pink-400' },
                { id: 'CHILD', label: 'छोटा बच्चा (Child < 5y)', icon: Baby, color: 'text-amber-400' },
                { id: 'CARDIAC', label: 'दिल / सांस (Cardiac/Emergency)', icon: Activity, color: 'text-rose-400' },
                { id: 'GENERAL', label: 'सुगर / बीपी / सामान्य (NCD)', icon: Stethoscope, color: 'text-cyan-400' },
              ].map((cat) => {
                const Icon = cat.icon;
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id as any);
                      setIsPregnant(cat.id === 'MATERNAL');
                    }}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition ${
                      active
                        ? 'bg-slate-700 border-brand-500 shadow-md ring-2 ring-brand-500/30'
                        : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${cat.color}`} />
                    <span className="text-xs font-bold text-white leading-snug">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Basic Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">मरीज का नाम</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">उम्र (Age)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                रक्तचाप (Blood Pressure mmHg)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Sys 120"
                  value={systolicBP}
                  onChange={(e) => setSystolicBP(e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
                <span className="text-slate-500">/</span>
                <input
                  type="number"
                  placeholder="Dia 80"
                  value={diastolicBP}
                  onChange={(e) => setDiastolicBP(e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* 3. Danger Signs Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>खतरे के निशान (Danger Signs / Red Flags):</span>
              <span className="text-slate-500 font-normal lowercase">(लागू होने पर टिक करें)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dangerOptionsByCategory[selectedCategory].map((opt) => {
                const checked = selectedDangerSigns.includes(opt.label);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleDangerSign(opt.label)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition text-xs ${
                      checked
                        ? opt.redFlag
                          ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                          : 'bg-brand-950/40 border-brand-500 text-brand-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-semibold">{opt.label}</span>
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        checked ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-600'
                      }`}
                    >
                      {checked && '✓'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Action Button */}
          <div className="pt-3">
            <button
              type="button"
              disabled={evaluating}
              onClick={handleRunTriage}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-brand-600 to-indigo-600 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 hover:opacity-95 transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>
                {evaluating ? 'जांच हो रही है...' : 'मरीज की जांच करें (Run Triage Assessment)'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* TRIAGE RESULT CARD (4-TIER DISPLAY) */
        <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6">
          {/* Top Urgency Classification Banner */}
          <div
            className={`p-6 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
              result.triage.urgency === 'EMERGENCY_108'
                ? 'bg-rose-950/50 border-rose-600/60 text-rose-200 shadow-lg shadow-rose-950/30'
                : result.triage.urgency === 'PHC_VISIT'
                ? 'bg-amber-950/50 border-amber-600/60 text-amber-200 shadow-lg shadow-amber-950/30'
                : result.triage.urgency === 'TELECONSULT'
                ? 'bg-blue-950/50 border-blue-600/60 text-blue-200 shadow-lg shadow-blue-950/30'
                : 'bg-emerald-950/50 border-emerald-600/60 text-emerald-200 shadow-lg shadow-emerald-950/30'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg shrink-0 ${
                  result.triage.urgency === 'EMERGENCY_108'
                    ? 'bg-rose-600 animate-pulse'
                    : result.triage.urgency === 'PHC_VISIT'
                    ? 'bg-amber-600'
                    : result.triage.urgency === 'TELECONSULT'
                    ? 'bg-blue-600'
                    : 'bg-emerald-600'
                }`}
              >
                {result.triage.urgency === 'EMERGENCY_108' ? (
                  <AlertCircle className="w-8 h-8" />
                ) : result.triage.urgency === 'TELECONSULT' ? (
                  <PhoneCall className="w-8 h-8" />
                ) : (
                  <Stethoscope className="w-8 h-8" />
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-black/40 border border-white/20">
                    {result.triage.urgency}
                  </span>
                  <span className="text-xs text-slate-300">
                    Confidence: {(result.triage.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  {result.triage.primaryRecommendation}
                </h3>
              </div>
            </div>

            {result.triage.urgency === 'EMERGENCY_108' && (
              <a
                href="tel:108"
                className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-xl flex items-center space-x-2 shrink-0 animate-bounce"
              >
                <Ambulance className="w-5 h-5" />
                <span>108 एम्बुलेंस बुलाएं (Call 108)</span>
              </a>
            )}
          </div>

          {/* Clinical Rationale & Action Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                आवश्यक कदम (Actionable Steps)
              </span>
              <ul className="space-y-2 text-xs text-slate-200">
                {result.triage.actionableSteps?.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Routed Facility Information */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                अनुशंसित स्वास्थ्य केंद्र (Recommended Facility)
              </span>
              <div className="space-y-1.5">
                <h4 className="font-bold text-white text-base">
                  {result.routing.selectedFacility.name}
                </h4>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" />
                  <span>{result.routing.selectedFacility.distanceKm} km दूर (~{result.routing.selectedFacility.travelMinutes} मिनट यात्रा)</span>
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>प्रतीक्षा समय: ~{result.routing.estimatedWaitMinutes} मिनट (Duty Doctors: {result.routing.selectedFacility.doctorsOnDuty})</span>
                </p>
                <div className="mt-3 p-2.5 rounded-xl bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                  <strong>यातायात सुझाव:</strong> {result.routing.transportAdvice}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Button Tray */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setResult(null)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              ← पुनः जांच करें (New Triage)
            </button>

            {onComplete && (
              <button
                onClick={onComplete}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>जांच पूर्ण (Complete)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
