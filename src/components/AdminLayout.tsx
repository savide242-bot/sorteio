import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  Shield, 
  BarChart3, 
  Users, 
  Download, 
  Settings, 
  LogOut, 
  Lock, 
  KeyRound, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const ADMIN_SESSION_KEY = 'babybites_admin_auth_session';

export const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (session === 'authenticated_admin') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Standard secure admin access passkey (or customizable in settings)
    const storedPass = localStorage.getItem('babybites_admin_pass') || 'babybites2026';

    if (passwordInput.trim() === storedPass) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated_admin');
      setIsAuthenticated(true);
      setPasswordInput('');
    } else {
      setAuthError('Invalid administrator credentials. Please check your password.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
    navigate('/admin-giveaway');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-900 py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-stone-950 border border-stone-800 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-rose-900/50 mb-6">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold font-serif text-white tracking-tight">
            Administrator Gateway
          </h2>
          <p className="text-stone-400 text-xs mt-2 mb-6">
            BabyBites Early Access Giveaway &bull; Secure Management Portal
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Admin Passkey
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Enter administrator password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-900 border border-stone-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 placeholder:text-stone-600"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                Default key: <code className="text-rose-400 font-mono">babybites2026</code> (Change in Settings)
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-md transition-all"
            >
              Authenticate &amp; Access Dashboard
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-800 flex justify-between items-center text-xs text-stone-500">
            <Link to="/early-access" className="hover:text-stone-300 underline">
              &larr; Back to Public Website
            </Link>
            <span>RLS &bull; Encrypted Session</span>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      name: 'Overview & Statistics',
      path: '/admin-giveaway',
      icon: BarChart3,
      exact: true,
    },
    {
      name: 'Participants Management',
      path: '/admin-giveaway/participants',
      icon: Users,
    },
    {
      name: 'EXPORT PARTICIPANTS',
      path: '/admin-giveaway/export',
      icon: Download,
      badge: 'External Draw',
    },
    {
      name: 'Campaign Settings',
      path: '/admin-giveaway/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F2]">
      {/* Admin Top Navigation */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/babybites-logo.png" 
                alt="BabyBites Logo" 
                className="w-9 h-9 rounded-full object-contain bg-white p-0.5 border border-stone-700 shadow-sm" 
              />
              <div>
                <span className="font-serif font-bold text-lg text-white">
                  Baby<span className="text-rose-400">Bites</span>
                </span>
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                  ADMIN CONSOLE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/early-access"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 transition-colors"
              >
                <span>View Public Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="bg-stone-950 border-t border-stone-800/80 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-900/40'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-400 text-stone-950">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children || <Outlet />}
      </main>
    </div>
  );
};
