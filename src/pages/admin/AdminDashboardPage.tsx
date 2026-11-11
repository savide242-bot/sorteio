import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Globe, 
  Baby, 
  Download, 
  ShieldAlert, 
  ArrowUpRight, 
  Mail, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { fetchAllParticipants, calculateDashboardStats, getCampaignConfig } from '../../lib/storage';
import { Participant, DashboardStats } from '../../types/giveaway';

export const AdminDashboardPage: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const config = getCampaignConfig();

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchAllParticipants();
    setParticipants(data);
    setStats(calculateDashboardStats(data));
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner / Notification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-normal font-serif text-[#2A2321]">
              Giveaway Operations Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-serif font-bold bg-[#FAF5F2] text-[#9B455B] border border-[#ECD3D8]">
              Live Campaign
            </span>
          </div>
          <p className="text-xs text-[#6E615D] mt-1 font-serif">
            Admin notification recipient: <strong className="text-[#2A2321]">{config.adminEmail}</strong> &bull; Registration closes Nov 20, 2026.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-serif rounded-xl bg-[#FAF5EE] hover:bg-[#F3ECE0] text-[#5A4E4B] transition-colors border border-[#E5DDD4]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin-giveaway/export"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-serif font-bold rounded-xl bg-[#9B455B] hover:bg-[#85364A] text-white shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export for External Draw</span>
          </Link>
        </div>
      </div>

      {/* Direct Email-Based Management Feature Highlight Banner */}
      <div className="p-5 rounded-2xl bg-[#FDF9F9] border border-[#EEDCE2] text-[#5A4E4B] space-y-2 font-serif">
        <div className="flex items-center gap-2 text-sm font-bold text-[#8F3D52]">
          <Mail className="w-4 h-4 text-[#9B455B]" />
          <span>Email-First Management Active: Cumulative Master List Dispatch</span>
        </div>
        <p className="text-xs sm:text-sm text-[#5A4E4B] leading-relaxed">
          You don't need to stay logged in here! Every single time a mother registers (1st user, 2nd user, 3rd user...), a comprehensive email is automatically sent to <strong className="text-[#2A2321]">{config.adminEmail}</strong> containing the <strong>updated cumulative master list</strong> of all participants registered to date with their unique lucky numbers. The list expands automatically with each entry!
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Registrations */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Registrations
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-stone-900 font-serif">
            {stats?.totalRegistrations ?? 0}
          </div>
          <div className="mt-2 text-xs text-stone-500 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{stats?.validRegistrations ?? 0} eligible</span>
            <span>&bull;</span>
            <span className="text-rose-500 font-medium">{stats?.disqualifiedRegistrations ?? 0} disqualified</span>
          </div>
        </div>

        {/* Verified Emails */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Verified Emails
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-stone-900 font-serif">
            {stats?.verifiedEmails ?? 0}
          </div>
          <div className="mt-2 text-xs text-stone-500">
            {stats?.totalRegistrations
              ? `${Math.round(((stats.verifiedEmails) / (stats.totalRegistrations || 1)) * 100)}% verification rate`
              : 'No registrations yet'}
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Pending Verification
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-stone-900 font-serif">
            {stats?.pendingEmailVerification ?? 0}
          </div>
          <div className="mt-2 text-xs text-stone-500">
            Awaiting email link confirmation
          </div>
        </div>

        {/* Geographic Coverage */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Countries Represented
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-stone-900 font-serif">
            {Object.keys(stats?.registrationsByCountry ?? {}).length}
          </div>
          <div className="mt-2 text-xs text-stone-500">
            Global early access audience
          </div>
        </div>
      </div>

      {/* Breakdowns: Country & Baby's Age */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Count by Country */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-rose-500" />
              <span>Registrations by Country</span>
            </h3>
            <span className="text-xs text-stone-400">Total: {stats?.totalRegistrations ?? 0}</span>
          </div>

          <div className="space-y-4">
            {stats && Object.keys(stats.registrationsByCountry).length > 0 ? (
              Object.entries(stats.registrationsByCountry)
                .sort((a, b) => b[1] - a[1])
                .map(([country, count]) => {
                  const percent = Math.round((count / (stats.totalRegistrations || 1)) * 100);
                  return (
                    <div key={country} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-stone-700">{country}</span>
                        <span className="text-stone-900 font-bold">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-xs text-stone-400 italic text-center py-8">
                No participant registrations recorded yet.
              </p>
            )}
          </div>
        </div>

        {/* Registration Count by Baby's Age */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
              <Baby className="w-4 h-4 text-pink-500" />
              <span>Registrations by Baby’s Age</span>
            </h3>
            <span className="text-xs text-stone-400">Total: {stats?.totalRegistrations ?? 0}</span>
          </div>

          <div className="space-y-4">
            {stats && Object.keys(stats.registrationsByBabyAge).length > 0 ? (
              Object.entries(stats.registrationsByBabyAge)
                .sort((a, b) => b[1] - a[1])
                .map(([ageGroup, count]) => {
                  const percent = Math.round((count / (stats.totalRegistrations || 1)) * 100);
                  return (
                    <div key={ageGroup} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-stone-700">{ageGroup}</span>
                        <span className="text-stone-900 font-bold">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-xs text-stone-400 italic text-center py-8">
                No participant registrations recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Participants Preview Table */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-rose-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-serif text-stone-900">
              Recent Registrations
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Unique sequential lucky numbers permanently assigned
            </p>
          </div>
          <Link
            to="/admin-giveaway/participants"
            className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
          >
            <span>View All ({participants.length})</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-stone-600 uppercase tracking-wider font-semibold border-b border-rose-100">
              <tr>
                <th className="py-3 px-6">Lucky Number</th>
                <th className="py-3 px-6">Full Name</th>
                <th className="py-3 px-6">Email Address</th>
                <th className="py-3 px-6">Baby’s Age</th>
                <th className="py-3 px-6">Country</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50 text-stone-700">
              {participants.slice(0, 5).map((p) => (
                <tr key={p.id} className="hover:bg-rose-50/30 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-rose-600">
                    {p.lucky_number}
                  </td>
                  <td className="py-3.5 px-6 font-medium text-stone-900">
                    {p.full_name}
                  </td>
                  <td className="py-3.5 px-6 text-stone-500">
                    {p.email}
                  </td>
                  <td className="py-3.5 px-6">
                    {p.baby_age}
                  </td>
                  <td className="py-3.5 px-6">
                    {p.country || '—'}
                  </td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.registration_status === 'valid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {p.registration_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-stone-400">
                    {new Date(p.registered_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}

              {participants.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 italic">
                    No registrations found. Test the registration form on the public page to see entries appear here!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
