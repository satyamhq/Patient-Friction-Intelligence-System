import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { MobilePortalNav } from '../components/layout/MobilePortalNav';
import { Footer } from '../components/layout/Footer';
import { DemoModeBanner } from '../components/common/DemoModeBanner';

export const DoctorLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <DemoModeBanner message="DOCTOR CLINICAL CONSULTATION CONSOLE: Review non-clinical patient friction barriers, longitudinal health records, and record OPD consultations." />
      <Navbar />
      <div className="flex-grow flex max-w-7xl mx-auto w-full">
        <Sidebar />
        <main className="flex-1 p-3.5 sm:p-5 lg:p-8 min-w-0">
          <MobilePortalNav />
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};
