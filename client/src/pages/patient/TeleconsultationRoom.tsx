import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/common/Button';
import { TTSButton } from '../../components/common/TTSButton';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Volume2,
  Share2,
} from 'lucide-react';

export const TeleconsultationRoom: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(true);

  // Live Consultation Transcripts Simulation
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'Dr. Gurpreet Singh (Civil Hospital)',
      text: 'Sat Sri Akal, Sunita ji. How are you feeling today? I have reviewed your baseline reports.',
      hindi: 'नमस्ते सुनीता जी, आज आपकी तबीयत कैसी है? मैंने आपकी पुरानी रिपोर्ट्स देख ली हैं।',
      time: '10:02 AM',
    },
    {
      sender: 'Sunita Devi (Patient)',
      text: 'Doctor sahab, chest heavy lag rahi hai aur gaon se hospital aane ke liye koi bus nahi thi.',
      hindi: 'डॉक्टर साहब, सीने में भारीपन लग रहा है और गाँव से अस्पताल आने के लिए कोई बस नहीं थी।',
      time: '10:03 AM',
    },
    {
      sender: 'Dr. Gurpreet Singh (Civil Hospital)',
      text: 'Do not worry about the 65 km travel. I am prescribing maintenance blood pressure tablets that will be delivered by the community postal service.',
      hindi: '65 किमी सफर की चिंता मत कीजिए। मैं ब्लड प्रेशर की दवा लिख रहा हूँ जो आपके गाँव डाक सेवा द्वारा पहुँच जाएगी।',
      time: '10:04 AM',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');

  // Call duration timer
  useEffect(() => {
    let interval: any;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        sender: `${user?.name || 'Sunita Devi'} (Patient)`,
        text: inputMessage,
        hindi: inputMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputMessage('');
  };

  const handleEndCall = () => {
    setIsCallActive(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Bar Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Live Tele-Triage Room • Dr. Gurpreet Singh, MD
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Connected Live
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Civil Hospital Sub-Divisional Unit • Cardiology & General Medicine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>{formatTime(callDuration)}</span>
          </div>
          <TTSButton
            text="Connected with Dr. Gurpreet Singh. Video triage is active."
          />
        </div>
      </div>

      {/* Main Grid: Video Stage (Left) & Live Dialogue/Rx (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Video Streams */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
            {/* Main Remote Doctor Stream */}
            {isVideoOn ? (
              <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-navy-950 to-slate-900 flex flex-col items-center justify-center text-white relative">
                <div className="w-24 h-24 rounded-full bg-teal-800/60 border-2 border-teal-400 flex items-center justify-center text-3xl font-bold mb-3 shadow-lg">
                  👨‍⚕️
                </div>
                <h3 className="text-lg font-bold text-white">Dr. Gurpreet Singh, MD</h3>
                <p className="text-xs text-teal-300">Civil Hospital Phagwara • In Consultation</p>

                {/* Live Subtitle Transcript Banner */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700 text-xs text-center text-teal-200">
                  <span className="font-semibold text-white">
                    {chatMessages[chatMessages.length - 1]?.sender}:
                  </span>{' '}
                  "{currentLanguage.code === 'hi'
                    ? chatMessages[chatMessages.length - 1]?.hindi
                    : chatMessages[chatMessages.length - 1]?.text}"
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                <VideoOff className="w-8 h-8" />
                <span>Video is turned off</span>
              </div>
            )}

            {/* Self-View Picture-in-Picture */}
            <div className="absolute top-4 right-4 w-28 h-20 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-md flex items-center justify-center text-white text-[10px]">
              <span>👤 {user?.name || 'Sunita Devi'}</span>
            </div>
          </div>

          {/* Call Controls Bar */}
          <div className="bg-slate-900 rounded-2xl p-3 flex items-center justify-center gap-3 border border-slate-800">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3 rounded-full text-white transition-colors ${
                isMicOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600'
              }`}
              title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-full text-white transition-colors ${
                isVideoOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600'
              }`}
              title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {isCallActive ? (
              <button
                onClick={handleEndCall}
                className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Teleconsultation</span>
              </button>
            ) : (
              <button
                onClick={() => setIsCallActive(true)}
                className="px-5 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg"
              >
                <span>Re-Connect Call</span>
              </button>
            )}
          </div>

          {/* Friction Mitigation Impact Card */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-200 font-bold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Non-Clinical Friction Mitigated by Teleconsultation:
              </span>
              <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded-full">
                Saved 100% Transit
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-emerald-800 dark:text-emerald-300">
              <div className="p-2 bg-white/80 dark:bg-slate-900 rounded-lg">
                <strong>🚗 Travel Saved:</strong> 65 km round trip
              </div>
              <div className="p-2 bg-white/80 dark:bg-slate-900 rounded-lg">
                <strong>💵 Cost Saved:</strong> ~₹450 bus/auto fares
              </div>
              <div className="p-2 bg-white/80 dark:bg-slate-900 rounded-lg">
                <strong>⏰ Daily Wage:</strong> Zero work-day loss
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Live Conversation & Digital Prescription */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Live Translation Dialogue Ledger */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-card flex flex-col h-[360px]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <MessageSquare className="w-4 h-4 text-teal-600" />
                <span>Live Multilingual Consultation Transcript</span>
              </div>
              <span className="text-[10px] text-teal-600 font-bold">Auto-Translated</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl border ${
                    msg.sender.includes('Doctor')
                      ? 'bg-teal-50/70 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800'
                      : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Type or speak a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
              <Button type="submit" variant="primary" size="sm">
                Send
              </Button>
            </form>
          </div>

          {/* Instant Digital Prescription & Follow-up Note */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-card space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                Live Digital Prescription & Care Note
              </span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                Rx #TC-9042
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
              <p><strong>Diagnosis:</strong> Essential Hypertension (Stage 1) — Managed Non-Clinically</p>
              <p><strong>Prescription:</strong> Tab. Amlodipine 5mg (Once daily morning) • 60-day pack</p>
              <p><strong>Fulfillment:</strong> Dispatched via Local Village Health Postal Courier</p>
              <p><strong>Next Follow-up:</strong> 30 Days via Assisted Video Triage (No Hospital Visit Needed)</p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/patient/documents')}
                icon={<CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
              >
                Save Rx to Document Vault
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
