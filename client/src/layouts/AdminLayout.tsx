import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';
import { DemoModeBanner } from '../components/common/DemoModeBanner';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to={user.role === 'hospital' ? '/hospital/dashboard' : '/patient/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DemoModeBanner message="ADMINISTRATIVE HEALTH INTELLIGENCE SUITE: Population friction heatmaps, care leakage analytics, and What-If budget intervention simulations." />
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
