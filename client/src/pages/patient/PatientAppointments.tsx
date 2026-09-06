import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  PlusCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Ticket,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export const PatientAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Booking Form State
  const [form, setForm] = useState({
    hospitalId: '',
    departmentName: 'General OPD',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 - 10:00 AM',
    type: 'OPD',
    reasonForVisit: '',
    symptoms: '',
    urgencyLevel: 'routine',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [aptRes, hospRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/hospitals'),
      ]);

      if (aptRes.data?.success) {
        setAppointments(aptRes.data.appointments || []);
      }
      if (hospRes.data?.success) {
        setHospitals(hospRes.data.hospitals || []);
        if (hospRes.data.hospitals?.length > 0 && !form.hospitalId) {
          setForm((prev) => ({ ...prev, hospitalId: hospRes.data.hospitals[0].id || hospRes.data.hospitals[0]._id }));
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reasonForVisit.trim()) {
      setFeedback({ type: 'error', text: 'Please describe the reason for your visit.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        ...form,
        symptoms: form.symptoms.split(',').map((s) => s.trim()).filter(Boolean),
      };

      const res = await api.post('/appointments', payload);
      if (res.data?.success) {
        setFeedback({
          type: 'success',
          text: `Appointment scheduled! Your Queue Token number is #${res.data.appointment?.queueNumber || 1}.`,
        });
        setShowBookModal(false);
        setForm({
          hospitalId: hospitals[0]?.id || hospitals[0]?._id || '',
          departmentName: 'General OPD',
          appointmentDate: new Date().toISOString().split('T')[0],
          timeSlot: '09:00 - 10:00 AM',
          type: 'OPD',
          reasonForVisit: '',
          symptoms: '',
          urgencyLevel: 'routine',
        });
        loadData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to book appointment' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled appointment?')) return;
    try {
      const res = await api.patch(`/appointments/${id}/status`, { status: 'cancelled' });
      if (res.data?.success) {
        setFeedback({ type: 'success', text: 'Appointment cancelled successfully.' });
        loadData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to cancel appointment' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Calendar className="w-7 h-7 text-teal-600" />
            My Hospital & Clinic Appointments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Book OPD visits, view digital tokens, and track real-time queue position before leaving home.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowBookModal(true)}>
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Book New Visit
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Appointments List */}
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No Appointments Scheduled"
          description="You do not have any upcoming visits. Book an appointment with a nearby hospital or clinic to receive a token number."
          actionText="Schedule Appointment"
          onAction={() => setShowBookModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((apt) => (
            <div
              key={apt.id || apt._id}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center font-bold text-sm">
                      <Ticket className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">
                        {apt.appointmentCode || 'APT-OPD'}
                      </div>
                      <div className="text-xs text-slate-400">
                        Token #{apt.queueNumber || 1}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                      apt.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : apt.status === 'cancelled'
                        ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {apt.hospitalName || 'Health Facility'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {apt.departmentName || 'General OPD'} • {apt.doctorName || 'Attending Physician'}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Date:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{apt.appointmentDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Time Slot:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{apt.timeSlot}</span>
                  </div>
                  {apt.estimatedWaitMinutes !== undefined && (
                    <div className="flex items-center justify-between text-teal-600 dark:text-teal-400">
                      <span>Est. Wait Time:</span>
                      <span className="font-bold">~{apt.estimatedWaitMinutes} mins</span>
                    </div>
                  )}
                </div>

                {apt.reasonForVisit && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    "{apt.reasonForVisit}"
                  </p>
                )}
              </div>

              {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  <button
                    onClick={() => handleCancel(apt.id || apt._id)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline transition-all"
                  >
                    Cancel Appointment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Book Clinic / OPD Appointment
              </h2>
              <button
                onClick={() => setShowBookModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Health Facility
                </label>
                <select
                  value={form.hospitalId}
                  onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                  required
                >
                  {hospitals.map((h) => (
                    <option key={h.id || h._id} value={h.id || h._id}>
                      {h.name} ({h.city || 'Punjab'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={form.departmentName}
                    onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="General OPD">General OPD</option>
                    <option value="Maternal & Child Health">Maternal & Child Health</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Paediatrics">Paediatrics</option>
                    <option value="Orthopaedics">Orthopaedics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Visit Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="OPD">In-Person OPD</option>
                    <option value="Teleconsult">Video Teleconsult</option>
                    <option value="Follow_up">Follow-up</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.appointmentDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Time Slot
                  </label>
                  <select
                    value={form.timeSlot}
                    onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="09:00 - 10:00 AM">09:00 - 10:00 AM</option>
                    <option value="10:00 - 11:00 AM">10:00 - 11:00 AM</option>
                    <option value="11:00 - 12:00 PM">11:00 - 12:00 PM</option>
                    <option value="02:00 - 03:00 PM">02:00 - 03:00 PM</option>
                    <option value="03:00 - 04:00 PM">03:00 - 04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Reason for Visit / Chief Health Complaint
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. High fever for 3 days with headache and body pain..."
                  value={form.reasonForVisit}
                  onChange={(e) => setForm({ ...form, reasonForVisit: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Key Symptoms (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fever, Cough, Sore Throat"
                  value={form.symptoms}
                  onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" type="button" onClick={() => setShowBookModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? 'Confirming...' : 'Confirm Appointment Token'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
