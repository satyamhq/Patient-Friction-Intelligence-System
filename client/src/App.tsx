import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ToastProvider } from './context/ToastContext';
import { FirstVisitLanguageModal } from './components/common/FirstVisitLanguageModal';
import { AccessibilityToolbar } from './components/common/AccessibilityToolbar';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { PatientLayout } from './layouts/PatientLayout';
import { HospitalLayout } from './layouts/HospitalLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { GoogleCallback } from './pages/auth/GoogleCallback';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { NotFound } from './pages/public/NotFound';
import { SystemArchitecture } from './pages/public/SystemArchitecture';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientProfile } from './pages/patient/PatientProfile';
import { NearbyHospitals } from './pages/patient/NearbyHospitals';
import { HospitalDetails } from './pages/patient/HospitalDetails';
import { PatientRequests } from './pages/patient/PatientRequests';
import { RequestDetails } from './pages/patient/RequestDetails';
import { PatientDocuments } from './pages/patient/PatientDocuments';
import { FrictionFingerprint } from './pages/patient/FrictionFingerprint';
import { AccessibilityRisk } from './pages/patient/AccessibilityRisk';
import { DigitalTwinSimulator } from './pages/patient/DigitalTwinSimulator';
import { TeleconsultationRoom } from './pages/patient/TeleconsultationRoom';
import { PatientNotifications } from './pages/patient/PatientNotifications';
import { PatientSettings } from './pages/patient/PatientSettings';

// Hospital Pages
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import { HospitalRequests } from './pages/hospital/HospitalRequests';
import { HospitalRequestDetails } from './pages/hospital/HospitalRequestDetails';
import { HospitalDepartments } from './pages/hospital/HospitalDepartments';
import { HospitalProfile } from './pages/hospital/HospitalProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PopulationFrictionMap } from './pages/admin/PopulationFrictionMap';
import { WhatIfSimulator } from './pages/admin/WhatIfSimulator';
import { InterventionOptimizer } from './pages/admin/InterventionOptimizer';
import { CareLeakage } from './pages/admin/CareLeakage';
import { CareFailure } from './pages/admin/CareFailure';
import { AdminPatients } from './pages/admin/AdminPatients';
import { AdminHospitals } from './pages/admin/AdminHospitals';
import { AuditLogs } from './pages/admin/AuditLogs';

export const App: React.FC = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <LanguageProvider>
        <AccessibilityProvider>
          <ToastProvider>
            <AuthProvider>
              <LocationProvider>
                <NotificationProvider>
                  <FirstVisitLanguageModal />
                  <AccessibilityToolbar />
                  <Routes>
                    {/* Public Main Layout */}
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/architecture" element={<SystemArchitecture />} />
                      <Route path="/hospitals" element={<Navigate to="/patient/hospitals" replace />} />
                    </Route>

                    {/* Auth Layout */}
                    <Route element={<AuthLayout />}>
                      <Route path="/login" element={<Login />} />
                      <Route path="/auth/login" element={<Navigate to="/login" replace />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/auth/register" element={<Navigate to="/register" replace />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/auth/reset-password" element={<ResetPassword />} />
                    </Route>
                    <Route path="/auth/google/callback" element={<GoogleCallback />} />

                    {/* Patient Portal */}
                    <Route path="/patient" element={<PatientLayout />}>
                      <Route index element={<Navigate to="/patient/dashboard" replace />} />
                      <Route path="dashboard" element={<PatientDashboard />} />
                      <Route path="profile" element={<PatientProfile />} />
                      <Route path="hospitals" element={<NearbyHospitals />} />
                      <Route path="hospitals/:id" element={<HospitalDetails />} />
                      <Route path="requests" element={<PatientRequests />} />
                      <Route path="requests/:id" element={<RequestDetails />} />
                      <Route path="documents" element={<PatientDocuments />} />
                      <Route path="friction" element={<FrictionFingerprint />} />
                      <Route path="risk" element={<AccessibilityRisk />} />
                      <Route path="digital-twin" element={<DigitalTwinSimulator />} />
                      <Route path="teleconsult" element={<TeleconsultationRoom />} />
                      <Route path="notifications" element={<PatientNotifications />} />
                      <Route path="settings" element={<PatientSettings />} />
                    </Route>

                    {/* Hospital Portal */}
                    <Route path="/hospital" element={<HospitalLayout />}>
                      <Route index element={<Navigate to="/hospital/dashboard" replace />} />
                      <Route path="dashboard" element={<HospitalDashboard />} />
                      <Route path="requests" element={<HospitalRequests />} />
                      <Route path="requests/:id" element={<HospitalRequestDetails />} />
                      <Route path="departments" element={<HospitalDepartments />} />
                      <Route path="teleconsult" element={<TeleconsultationRoom />} />
                      <Route path="profile" element={<HospitalProfile />} />
                      <Route path="notifications" element={<PatientNotifications />} />
                      <Route path="settings" element={<PatientSettings />} />
                    </Route>

                    {/* Admin Intelligence Suite */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="friction-map" element={<PopulationFrictionMap />} />
                      <Route path="simulator" element={<WhatIfSimulator />} />
                      <Route path="digital-twin" element={<DigitalTwinSimulator />} />
                      <Route path="interventions" element={<InterventionOptimizer />} />
                      <Route path="care-leakage" element={<CareLeakage />} />
                      <Route path="care-failure" element={<CareFailure />} />
                      <Route path="patients" element={<AdminPatients />} />
                      <Route path="hospitals" element={<AdminHospitals />} />
                      <Route path="audit-logs" element={<AuditLogs />} />
                      <Route path="settings" element={<PatientSettings />} />
                    </Route>

                    {/* 404 Catch All */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </NotificationProvider>
              </LocationProvider>
            </AuthProvider>
          </ToastProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};
