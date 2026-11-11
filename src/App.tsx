import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { RegistrationSuccessPage } from './pages/RegistrationSuccessPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { GiveawayRulesPage } from './pages/GiveawayRulesPage';

import { AdminLayout } from './components/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminParticipantsPage } from './pages/admin/AdminParticipantsPage';
import { AdminExportPage } from './pages/admin/AdminExportPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { WebhookControlDashboard } from './pages/WebhookControlDashboard';

export const App: React.FC = () => {
  const location = useLocation();
  const isDedicatedPortal = location.pathname.startsWith('/admin-giveaway') || location.pathname === '/control-dashboard';

  return (
    <div className="flex flex-col min-h-screen">
      {!isDedicatedPortal && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/early-access" replace />} />
          <Route path="/early-access" element={<LandingPage />} />
          <Route path="/registration-success" element={<RegistrationSuccessPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/giveaway-rules" element={<GiveawayRulesPage />} />

          {/* Real-time Webhook Event & Control Dashboard */}
          <Route path="/control-dashboard" element={<WebhookControlDashboard />} />

          {/* Admin Routes with nested AdminLayout */}
          <Route path="/admin-giveaway" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="participants" element={<AdminParticipantsPage />} />
            <Route path="export" element={<AdminExportPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/early-access" replace />} />
        </Routes>
      </main>

      {!isDedicatedPortal && <Footer />}
    </div>
  );
};
export default App;
