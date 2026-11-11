import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Send, 
  Ban, 
  CheckCircle2, 
  Eye, 
  X, 
  AlertTriangle, 
  FileText, 
  Mail, 
  User, 
  Globe, 
  Baby, 
  Calendar,
  Lock,
  Download
} from 'lucide-react';
import { 
  fetchAllParticipants, 
  disqualifyParticipant, 
  reinstateParticipant,
  dispatchGiveawayEmails 
} from '../../lib/storage';
import { generateParticipantsCsv, downloadFile } from '../../lib/exportUtils';
import { Participant } from '../../types/giveaway';

export const AdminParticipantsPage: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'disqualified'>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');

  // Modals state
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [disqualifyModalTarget, setDisqualifyModalTarget] = useState<Participant | null>(null);
  const [disqualificationReason, setDisqualificationReason] = useState<string>('');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<string | null>(null);

  const loadParticipants = async () => {
    const list = await fetchAllParticipants();
    setParticipants(list);
  };

  useEffect(() => {
    loadParticipants();
  }, []);

  // Unique countries and ages for filters
  const countries = useMemo(() => {
    const set = new Set<string>();
    participants.forEach((p) => {
      if (p.country) set.add(p.country.trim());
    });
    return Array.from(set).sort();
  }, [participants]);

  const ages = useMemo(() => {
    const set = new Set<string>();
    participants.forEach((p) => {
      if (p.baby_age) set.add(p.baby_age.trim());
    });
    return Array.from(set).sort();
  }, [participants]);

  // Filtered & searched list
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.full_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.lucky_number.toLowerCase().includes(q) ||
        (p.country && p.country.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' || p.registration_status === statusFilter;

      const matchesCountry =
        countryFilter === 'all' || p.country === countryFilter;

      const matchesAge = ageFilter === 'all' || p.baby_age === ageFilter;

      return matchesSearch && matchesStatus && matchesCountry && matchesAge;
    });
  }, [participants, searchQuery, statusFilter, countryFilter, ageFilter]);

  // Handle Disqualification
  const handleConfirmDisqualification = async () => {
    if (!disqualifyModalTarget) return;
    if (!disqualificationReason.trim()) {
      alert('Please provide a specific reason for disqualification.');
      return;
    }

    await disqualifyParticipant(disqualifyModalTarget.id, disqualificationReason.trim());
    setDisqualifyModalTarget(null);
    setDisqualificationReason('');
    setActionSuccessNotice(`Participant ${disqualifyModalTarget.lucky_number} was marked as disqualified.`);
    setTimeout(() => setActionSuccessNotice(null), 4000);
    await loadParticipants();
  };

  // Handle Reinstate
  const handleReinstate = async (p: Participant) => {
    await reinstateParticipant(p.id);
    setActionSuccessNotice(`Participant ${p.lucky_number} has been reinstated as valid.`);
    setTimeout(() => setActionSuccessNotice(null), 4000);
    await loadParticipants();
  };

  // Handle Resend Email
  const handleResendEmail = async (p: Participant) => {
    setIsResending(p.id);
    try {
      await dispatchGiveawayEmails(p);
      setActionSuccessNotice(`Confirmation email re-sent for ${p.lucky_number} (${p.email}).`);
    } catch (e) {
      alert('Failed to resend email.');
    } finally {
      setIsResending(null);
      setTimeout(() => setActionSuccessNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-rose-100 shadow-soft">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Participant Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Search, inspect audit logs, resend confirmation emails, and manage eligibility.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const csv = generateParticipantsCsv(filteredParticipants, false);
            downloadFile(csv, 'BabyBites_Filtered_Participants.csv', 'text/csv;charset=utf-8;');
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-stone-900 hover:bg-stone-800 text-white shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Current View ({filteredParticipants.length})</span>
        </button>
      </div>

      {actionSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-soft space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="all">Status: All Registrations</option>
              <option value="valid">Status: Valid Only</option>
              <option value="disqualified">Status: Disqualified Only</option>
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="all">Country: All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Baby's Age Filter */}
          <div>
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="all">Age: All Stages</option>
              {ages.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters bar */}
        {(searchQuery || statusFilter !== 'all' || countryFilter !== 'all' || ageFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-rose-50 text-xs text-stone-500">
            <span>
              Showing <strong>{filteredParticipants.length}</strong> of <strong>{participants.length}</strong> participants
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCountryFilter('all');
                setAgeFilter('all');
              }}
              className="text-rose-600 hover:text-rose-700 font-semibold"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-stone-600 uppercase tracking-wider font-semibold border-b border-rose-100">
              <tr>
                <th className="py-3.5 px-6">Lucky Number</th>
                <th className="py-3.5 px-6">Full Name</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Baby’s Age</th>
                <th className="py-3.5 px-6">Country</th>
                <th className="py-3.5 px-6">Registration Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50 text-stone-700">
              {filteredParticipants.map((p) => {
                const isValid = p.registration_status === 'valid';

                return (
                  <tr key={p.id} className="hover:bg-rose-50/30 transition-colors">
                    {/* Lucky Number */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-rose-600 text-sm">
                        <span>{p.lucky_number}</span>
                        <span title="Immutable lucky number">
                          <Lock className="w-3 h-3 text-stone-400" />
                        </span>
                      </div>
                    </td>

                    {/* Full Name */}
                    <td className="py-3.5 px-6 font-semibold text-stone-900">
                      {p.full_name}
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5 text-stone-600">
                        <span>{p.email}</span>
                        {p.email_verified && (
                          <span title="Verified">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Baby's Age */}
                    <td className="py-3.5 px-6">
                      {p.baby_age}
                    </td>

                    {/* Country */}
                    <td className="py-3.5 px-6">
                      {p.country || <span className="text-stone-400">—</span>}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-6 text-stone-500 whitespace-nowrap">
                      {new Date(p.registered_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isValid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {p.registration_status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setSelectedParticipant(p)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                          title="View Participant Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Resend Email */}
                        <button
                          type="button"
                          onClick={() => handleResendEmail(p)}
                          disabled={isResending === p.id}
                          className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                          title="Resend Confirmation Email"
                        >
                          <Send className={`w-4 h-4 ${isResending === p.id ? 'animate-pulse' : ''}`} />
                        </button>

                        {/* Disqualify / Reinstate */}
                        {isValid ? (
                          <button
                            type="button"
                            onClick={() => {
                              setDisqualifyModalTarget(p);
                              setDisqualificationReason('');
                            }}
                            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                            title="Disqualify Participant"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleReinstate(p)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
                            title="Reinstate to Valid"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredParticipants.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400 italic">
                    No participants matched your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Participant Detail Modal */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-100 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedParticipant(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600">
                Participant File
              </span>
              <h3 className="text-2xl font-bold font-serif text-stone-900 mt-1">
                {selectedParticipant.full_name}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 font-mono font-bold text-sm border border-rose-200">
                  {selectedParticipant.lucky_number}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    selectedParticipant.registration_status === 'valid'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {selectedParticipant.registration_status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs text-stone-700">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Email Address:</span>
                  <span className="font-semibold text-stone-900">{selectedParticipant.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Baby’s Age:</span>
                  <span className="font-semibold text-stone-900">{selectedParticipant.baby_age}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Country:</span>
                  <span className="font-semibold text-stone-900">{selectedParticipant.country || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Registered At:</span>
                  <span className="font-semibold text-stone-900">
                    {new Date(selectedParticipant.registered_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  Reported Feeding Challenge:
                </label>
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-rose-100 text-stone-700 italic">
                  {selectedParticipant.feeding_challenge || 'None reported.'}
                </div>
              </div>

              {selectedParticipant.disqualification_reason && (
                <div>
                  <label className="font-bold text-rose-700 block mb-1">
                    Disqualification Reason:
                  </label>
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                    {selectedParticipant.disqualification_reason}
                  </div>
                </div>
              )}

              <div className="pt-2 text-[11px] text-stone-400">
                <p>Immutable ID: {selectedParticipant.id}</p>
                <p>Consent: Granted on registration</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-rose-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedParticipant(null)}
                className="py-2.5 px-5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disqualification Modal */}
      {disqualifyModalTarget && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-100 relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold font-serif text-stone-900">
              Disqualify Participant
            </h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              Disqualifying <strong className="text-stone-800">{disqualifyModalTarget.full_name}</strong> ({disqualifyModalTarget.lucky_number}) will exclude them from the external draw export.
            </p>

            <div className="space-y-2 mb-6">
              <label className="block text-xs font-semibold text-stone-700">
                Reason for Disqualification <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Duplicate household registration, bot pattern, test submission, request for withdrawal..."
                value={disqualificationReason}
                onChange={(e) => setDisqualificationReason(e.target.value)}
                className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDisqualifyModalTarget(null)}
                className="py-2 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisqualification}
                className="py-2 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Confirm Disqualification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
