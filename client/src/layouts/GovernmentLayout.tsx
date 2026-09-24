import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';
import { DemoModeBanner } from '../components/common/DemoModeBanner';

export const GovernmentLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <DemoModeBanner message="PUBLIC HEALTH GOVERNANCE & DISTRICT INTELLIGENCE: Aggregate district analytics, care leakage funnels, and intervention commissioning." />
      <Navbar />
      <div className="flex-grow flex max-w-7xl mx-auto w-full">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};
