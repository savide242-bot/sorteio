import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { RegistrationSuccessPage } from './pages/RegistrationSuccessPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { GiveawayRulesPage } from './pages/GiveawayRulesPage';

// Automatically scroll to the top of the viewport on every route transition
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<Navigate to="/early-access" replace />} />
          <Route path="/early-access" element={<LandingPage />} />
          <Route path="/registration-success" element={<RegistrationSuccessPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/giveaway-rules" element={<GiveawayRulesPage />} />

          {/* Fallback to early access */}
          <Route path="*" element={<Navigate to="/early-access" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};
export default App;
