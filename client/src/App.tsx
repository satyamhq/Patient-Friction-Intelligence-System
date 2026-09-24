import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ToastProvider } from './context/ToastContext';
import { FirstVisitLanguageModal } from './components/common/FirstVisitLanguageModal';
import { AccessibilityToolbar } from './components/common/AccessibilityToolbar';
import { PageLoadingFallback } from './components/common/PageLoadingFallback';

// Layouts (Loaded synchronously to avoid layout flicker)
import { MainLayout } from './layouts/MainLayout';
import { PatientLayout } from './layouts/PatientLayout';
import { HospitalLayout } from './layouts/HospitalLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DoctorLayout } from './layouts/DoctorLayout';
import { AshaLayout } from './layouts/AshaLayout';
import { GovernmentLayout } from './layouts/GovernmentLayout';

// Dynamic Code Splitting Helper for Named Exports
const lazyPage = (importFn: () => Promise<any>, exportName: string): React.ComponentType<any> =>
  React.lazy(() =>
    importFn().then((mod) => {
      if (mod[exportName]) {
        return { default: mod[exportName] };
      }
      if (mod.default) {
        return { default: mod.default };
      }
      throw new Error(`Component ${exportName} not found in module.`);
    })
  ) as any;

// Public Pages
const LandingPage = lazyPage(() => import('./pages/LandingPage'), 'LandingPage');
const Login = lazyPage(() => import('./pages/auth/Login'), 'Login');
const Register = lazyPage(() => import('./pages/auth/Register'), 'Register');
const ForgotPassword = lazyPage(() => import('./pages/auth/ForgotPassword'), 'ForgotPassword');
const ResetPassword = lazyPage(() => import('./pages/auth/ResetPassword'), 'ResetPassword');
const GoogleCallback = lazyPage(() => import('./pages/auth/GoogleCallback'), 'GoogleCallback');
const OnboardingModal = lazyPage(() => import('./pages/auth/OnboardingModal'), 'OnboardingModal');
const About = lazyPage(() => import('./pages/public/About'), 'About');
const Contact = lazyPage(() => import('./pages/public/Contact'), 'Contact');
const NotFound = lazyPage(() => import('./pages/public/NotFound'), 'NotFound');
const SystemArchitecture = lazyPage(() => import('./pages/public/SystemArchitecture'), 'SystemArchitecture');
const PublicDemo = lazyPage(() => import('./pages/public/PublicDemo'), 'PublicDemo');
const PublicSimulator = lazyPage(() => import('./pages/public/PublicSimulator'), 'PublicSimulator');
const DocsHub = lazyPage(() => import('./pages/public/DocsHub'), 'DocsHub');
const ApiExplorer = lazyPage(() => import('./pages/public/ApiExplorer'), 'ApiExplorer');
const SecurityPolicy = lazyPage(() => import('./pages/public/SecurityPolicy'), 'SecurityPolicy');
const ContributingGuide = lazyPage(() => import('./pages/public/ContributingGuide'), 'ContributingGuide');
const ChangelogPage = lazyPage(() => import('./pages/public/ChangelogPage'), 'ChangelogPage');
const OperationalPortalsLaunchpad = lazyPage(() => import('./pages/public/OperationalPortalsLaunchpad'), 'OperationalPortalsLaunchpad');

// Patient Pages
const PatientDashboard = lazyPage(() => import('./pages/patient/PatientDashboard'), 'PatientDashboard');
const PatientProfile = lazyPage(() => import('./pages/patient/PatientProfile'), 'PatientProfile');
const NearbyHospitals = lazyPage(() => import('./pages/patient/NearbyHospitals'), 'NearbyHospitals');
const HospitalDetails = lazyPage(() => import('./pages/patient/HospitalDetails'), 'HospitalDetails');
const PatientAppointments = lazyPage(() => import('./pages/patient/PatientAppointments'), 'PatientAppointments');
const MedicalHistory = lazyPage(() => import('./pages/patient/MedicalHistory'), 'MedicalHistory');
const PatientRequests = lazyPage(() => import('./pages/patient/PatientRequests'), 'PatientRequests');
const RequestDetails = lazyPage(() => import('./pages/patient/RequestDetails'), 'RequestDetails');
const PatientDocuments = lazyPage(() => import('./pages/patient/PatientDocuments'), 'PatientDocuments');
const FrictionFingerprint = lazyPage(() => import('./pages/patient/FrictionFingerprint'), 'FrictionFingerprint');
const AccessibilityRisk = lazyPage(() => import('./pages/patient/AccessibilityRisk'), 'AccessibilityRisk');
const DigitalTwinSimulator = lazyPage(() => import('./pages/patient/DigitalTwinSimulator'), 'DigitalTwinSimulator');
const TeleconsultationRoom = lazyPage(() => import('./pages/patient/TeleconsultationRoom'), 'TeleconsultationRoom');
const PatientNotifications = lazyPage(() => import('./pages/patient/PatientNotifications'), 'PatientNotifications');
const PatientSettings = lazyPage(() => import('./pages/patient/PatientSettings'), 'PatientSettings');

// Hospital Pages
const HospitalDashboard = lazyPage(() => import('./pages/hospital/HospitalDashboard'), 'HospitalDashboard');
const HospitalOperations = lazyPage(() => import('./pages/hospital/HospitalOperations'), 'HospitalOperations');
const MedicineInventory = lazyPage(() => import('./pages/hospital/MedicineInventory'), 'MedicineInventory');
const HospitalRequests = lazyPage(() => import('./pages/hospital/HospitalRequests'), 'HospitalRequests');
const HospitalRequestDetails = lazyPage(() => import('./pages/hospital/HospitalRequestDetails'), 'HospitalRequestDetails');
const HospitalDepartments = lazyPage(() => import('./pages/hospital/HospitalDepartments'), 'HospitalDepartments');
const HospitalProfile = lazyPage(() => import('./pages/hospital/HospitalProfile'), 'HospitalProfile');
const HospitalReferrals = lazyPage(() => import('./pages/hospital/HospitalReferrals'), 'HospitalReferrals');
const HospitalNotifications = lazyPage(() => import('./pages/hospital/HospitalNotifications'), 'HospitalNotifications');

// Doctor Pages
const DoctorDashboard = lazyPage(() => import('./pages/doctor/DoctorDashboard'), 'DoctorDashboard');
const DoctorAppointments = lazyPage(() => import('./pages/doctor/DoctorAppointments'), 'DoctorAppointments');
const DoctorMedicalRecords = lazyPage(() => import('./pages/doctor/DoctorMedicalRecords'), 'DoctorMedicalRecords');
const DoctorConsultationDesk = lazyPage(() => import('./pages/doctor/DoctorConsultationDesk'), 'DoctorConsultationDesk');
const DoctorPatientReview = lazyPage(() => import('./pages/doctor/DoctorPatientReview'), 'DoctorPatientReview');
const DoctorProfile = lazyPage(() => import('./pages/doctor/DoctorProfile'), 'DoctorProfile');

// Frontline ASHA Pages
const AshaDashboard = lazyPage(() => import('./pages/asha/AshaDashboard'), 'AshaDashboard');
const AshaHealthVisits = lazyPage(() => import('./pages/asha/AshaHealthVisits'), 'AshaHealthVisits');
const AshaTriageWizard = lazyPage(() => import('./pages/asha/AshaTriageWizard'), 'AshaTriageWizard');
const AshaBarrierEntry = lazyPage(() => import('./pages/asha/AshaBarrierEntry'), 'AshaBarrierEntry');
const AshaProfile = lazyPage(() => import('./pages/asha/AshaProfile'), 'AshaProfile');

// Government Pages
const GovernmentDashboard = lazyPage(() => import('./pages/government/GovernmentDashboard'), 'GovernmentDashboard');
const FacilityPerformance = lazyPage(() => import('./pages/government/FacilityPerformance'), 'FacilityPerformance');
const GovernmentCareLeakage = lazyPage(() => import('./pages/government/GovernmentCareLeakage'), 'GovernmentCareLeakage');
const GovernmentPopulationBarriers = lazyPage(() => import('./pages/government/GovernmentPopulationBarriers'), 'GovernmentPopulationBarriers');
const GovernmentFrictionMap = lazyPage(() => import('./pages/government/GovernmentFrictionMap'), 'GovernmentFrictionMap');
const GovernmentInterventions = lazyPage(() => import('./pages/government/GovernmentInterventions'), 'GovernmentInterventions');

// Admin Pages
const AdminDashboard = lazyPage(() => import('./pages/admin/AdminDashboard'), 'AdminDashboard');
const UserManagement = lazyPage(() => import('./pages/admin/UserManagement'), 'UserManagement');
const VerificationQueue = lazyPage(() => import('./pages/admin/VerificationQueue'), 'VerificationQueue');
const SystemHealth = lazyPage(() => import('./pages/admin/SystemHealth'), 'SystemHealth');
const PopulationFrictionMap = lazyPage(() => import('./pages/admin/PopulationFrictionMap'), 'PopulationFrictionMap');
const WhatIfSimulator = lazyPage(() => import('./pages/admin/WhatIfSimulator'), 'WhatIfSimulator');
const InterventionOptimizer = lazyPage(() => import('./pages/admin/InterventionOptimizer'), 'InterventionOptimizer');
const CareLeakage = lazyPage(() => import('./pages/admin/CareLeakage'), 'CareLeakage');
const CareFailure = lazyPage(() => import('./pages/admin/CareFailure'), 'CareFailure');
const AdminPatients = lazyPage(() => import('./pages/admin/AdminPatients'), 'AdminPatients');
const AdminHospitals = lazyPage(() => import('./pages/admin/AdminHospitals'), 'AdminHospitals');
const AuditLogs = lazyPage(() => import('./pages/admin/AuditLogs'), 'AuditLogs');

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
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Routes>
                      {/* Public Main Layout */}
                      <Route element={<MainLayout />}>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/demo" element={<PublicDemo />} />
                        <Route path="/demo/simulator" element={<PublicSimulator />} />
                        <Route path="/explore" element={<PublicDemo />} />
                        <Route path="/docs" element={<DocsHub />} />
                        <Route path="/api" element={<ApiExplorer />} />
                        <Route path="/architecture" element={<SystemArchitecture />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/security" element={<SecurityPolicy />} />
                        <Route path="/contributing" element={<ContributingGuide />} />
                        <Route path="/changelog" element={<ChangelogPage />} />
                        <Route path="/portals" element={<OperationalPortalsLaunchpad />} />
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
                        <Route path="appointments" element={<PatientAppointments />} />
                        <Route path="medical-history" element={<MedicalHistory />} />
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
                        <Route path="operations" element={<HospitalOperations />} />
                        <Route path="inventory" element={<MedicineInventory />} />
                        <Route path="referrals" element={<HospitalReferrals />} />
                        <Route path="requests" element={<HospitalRequests />} />
                        <Route path="requests/:id" element={<HospitalRequestDetails />} />
                        <Route path="departments" element={<HospitalDepartments />} />
                        <Route path="teleconsult" element={<TeleconsultationRoom />} />
                        <Route path="profile" element={<HospitalProfile />} />
                        <Route path="notifications" element={<HospitalNotifications />} />
                        <Route path="settings" element={<PatientSettings />} />
                      </Route>

                      {/* Frontline ASHA Portal */}
                      <Route path="/asha" element={<AshaLayout />}>
                        <Route index element={<Navigate to="/asha/dashboard" replace />} />
                        <Route path="dashboard" element={<AshaDashboard />} />
                        <Route path="visits" element={<AshaHealthVisits />} />
                        <Route path="wizard" element={<AshaTriageWizard />} />
                        <Route path="barriers" element={<AshaBarrierEntry />} />
                        <Route path="recalls" element={<AshaDashboard />} />
                        <Route path="profile" element={<AshaProfile />} />
                      </Route>

                      {/* Doctor Portal */}
                      <Route path="/doctor" element={<DoctorLayout />}>
                        <Route index element={<Navigate to="/doctor/dashboard" replace />} />
                        <Route path="dashboard" element={<DoctorDashboard />} />
                        <Route path="appointments" element={<DoctorAppointments />} />
                        <Route path="medical-records" element={<DoctorMedicalRecords />} />
                        <Route path="queue" element={<DoctorConsultationDesk />} />
                        <Route path="patient-review" element={<DoctorPatientReview />} />
                        <Route path="profile" element={<DoctorProfile />} />
                      </Route>

                      {/* Government & Public Health Governance */}
                      <Route path="/government" element={<GovernmentLayout />}>
                        <Route index element={<Navigate to="/government/dashboard" replace />} />
                        <Route path="dashboard" element={<GovernmentDashboard />} />
                        <Route path="facilities" element={<FacilityPerformance />} />
                        <Route path="friction-map" element={<GovernmentFrictionMap />} />
                        <Route path="leakage" element={<GovernmentCareLeakage />} />
                        <Route path="barriers" element={<GovernmentPopulationBarriers />} />
                        <Route path="interventions" element={<GovernmentInterventions />} />
                      </Route>

                      {/* Onboarding Route */}
                      <Route path="/onboarding" element={<OnboardingModal isOpen={true} />} />

                      {/* Admin Intelligence Suite */}
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="verification" element={<VerificationQueue />} />
                        <Route path="system-health" element={<SystemHealth />} />
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
                  </Suspense>
                </NotificationProvider>
              </LocationProvider>
            </AuthProvider>
          </ToastProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};
