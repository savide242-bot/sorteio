import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Send, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Users, 
  RefreshCw, 
  ArrowUpRight, 
  Sparkles, 
  FileSpreadsheet, 
  FileText, 
  Globe, 
  Clock, 
  Database,
  Code
} from 'lucide-react';
import { 
  getStoredWebhookEvents, 
  fetchAllParticipants, 
  dispatchGiveawayWebhook, 
  getCampaignConfig, 
  saveCampaignConfig 
} from '../lib/storage';
import { 
  generateParticipantsCsv, 
  generateExcelCompatibleCsv, 
  generateLuckyNumbersTxt, 
  downloadFile 
} from '../lib/exportUtils';
import { WebhookEvent, Participant } from '../types/giveaway';

export const WebhookControlDashboard: React.FC = () => {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshData = async () => {
    setEvents(getStoredWebhookEvents());
    const list = await fetchAllParticipants();
    setParticipants(list);
  };

  useEffect(() => {
    const config = getCampaignConfig();
    setWebhookUrlInput(config.webhookUrl || '');
    refreshData();
  }, []);

  const handleSaveWebhookUrl = (e: React.FormEvent) => {
    e.preventDefault();
    saveCampaignConfig({ webhookUrl: webhookUrlInput.trim() });
    setTestResult('Webhook endpoint saved successfully!');
    setTimeout(() => setTestResult(null), 3000);
  };

  // Dispatch a live test webhook event
  const handleTestWebhook = async () => {
    setIsSendingTest(true);
    setTestResult(null);

    const testParticipant: Participant = {
      id: 'test-' + Math.random().toString(36).substring(2, 8),
      full_name: 'Test Mama Sophie',
      email: 'test.mama@example.com',
      normalized_email: 'test.mama@example.com',
      baby_age: '6 – 8 months (Exploring Purees & Textures)',
      country: 'United States',
      feeding_challenge: 'Texture transition',
      lucky_number: 'BB9999',
      registration_status: 'valid',
      email_verified: true,
      consent_given: true,
      registered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const evt = await dispatchGiveawayWebhook(testParticipant, [...participants, testParticipant]);
      setEvents(getStoredWebhookEvents());
      setSelectedEvent(evt);
      setTestResult(
        evt.status === 'delivered'
          ? `Webhook delivered with HTTP status ${evt.response_status || 200}!`
          : evt.status === 'simulated'
          ? 'Event recorded in local event bus (no external URL specified).'
          : 'Webhook dispatch failed. Check your endpoint URL.'
      );
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setIsSendingTest(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  const eligibleCount = participants.filter(p => p.registration_status === 'valid').length;

  const filteredParticipants = participants.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.full_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.lucky_number.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#24211D] font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8DFD3] shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-[#2D6A4F] animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
                Realtime Event Bus &amp; Webhook Control
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#24211D]">
              Giveaway Control Dashboard
            </h1>
            <p className="text-xs text-[#7A7067] mt-1">
              Listens to webhooks emitted by the BabyBites registration site &bull; Manages cumulative draw entries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={refreshData}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE3] text-[#5D554E] font-bold text-xs border border-[#E5DDD4] transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-[#2D6A4F]" />
              <span>Refresh Events</span>
            </button>
            <a
              href="/early-access"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#245640] text-white font-bold text-xs shadow-md transition-all"
            >
              <span>View Public Registration Site</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E8DFD3] shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7067] block mb-1">
              Total Registrations
            </span>
            <span className="text-3xl font-serif font-bold text-[#24211D]">
              {participants.length}
            </span>
            <span className="text-[11px] text-[#2D6A4F] block mt-1 font-semibold">
              {eligibleCount} eligible for draw
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8DFD3] shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7067] block mb-1">
              Webhook Events Emitted
            </span>
            <span className="text-3xl font-serif font-bold text-[#2D6A4F]">
              {events.length}
            </span>
            <span className="text-[11px] text-[#7A7067] block mt-1">
              Real-time HTTP payloads
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8DFD3] shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7067] block mb-1">
              Latest Lucky Number
            </span>
            <span className="text-3xl font-mono font-bold text-[#2D6A4F]">
              {participants[0]?.lucky_number || 'BB0000'}
            </span>
            <span className="text-[11px] text-[#7A7067] block mt-1 truncate">
              {participants[0]?.full_name || 'No participants yet'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8DFD3] shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7067] block mb-1">
              External Draw Format
            </span>
            <span className="text-lg font-bold text-[#24211D] block mt-1">
              Audited Export
            </span>
            <span className="text-[11px] text-[#2D6A4F] block font-semibold">
              Zero internal bias
            </span>
          </div>
        </div>

        {/* Webhook Configuration & Dispatcher Bar */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE3]">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#2D6A4F]" />
              <h3 className="text-base font-bold font-serif text-[#24211D]">
                External Webhook Dispatcher
              </h3>
            </div>
            <span className="text-xs text-[#7A7067]">
              Sends real-time POST event for every new registration
            </span>
          </div>

          <form onSubmit={handleSaveWebhookUrl} className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder="Enter webhook endpoint URL (e.g. https://your-server.com/webhook or n8n/Zapier/Make)"
              value={webhookUrlInput}
              onChange={(e) => setWebhookUrlInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E2D9CE] text-xs text-[#24211D] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] font-mono"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-[#2D6A4F] hover:bg-[#245640] text-white font-bold text-xs shadow-sm transition-all"
            >
              Save Endpoint
            </button>
            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={isSendingTest}
              className="px-5 py-3 rounded-2xl bg-[#E5F4EC] hover:bg-[#D5EFE2] text-[#1B4332] font-bold text-xs border border-[#C7E4D6] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingTest ? 'Sending...' : 'Test Webhook'}</span>
            </button>
          </form>

          {testResult && (
            <div className="p-3 rounded-xl bg-[#E5F4EC] border border-[#C7E4D6] text-[#1B4332] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
              <span>{testResult}</span>
            </div>
          )}
        </div>

        {/* 1-Click External Draw Export Section */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2ECE3]">
            <div>
              <h3 className="text-base font-bold font-serif text-[#24211D]">
                Export Data for External Draw (Random.org)
              </h3>
              <p className="text-xs text-[#7A7067] mt-0.5">
                Preserves exact sequential lucky numbers. No draw is run on this website.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => {
                const txt = generateLuckyNumbersTxt(participants, true);
                navigator.clipboard.writeText(txt);
                setCopiedCodes(true);
                setTimeout(() => setCopiedCodes(false), 2500);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE3] text-[#24211D] border border-[#E5DDD4] text-xs font-bold transition-all"
            >
              {copiedCodes ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>Copied {eligibleCount} Codes!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#7A7067]" />
                  <span>Copy All Codes to Clipboard</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                const csv = generateParticipantsCsv(participants, true);
                downloadFile(csv, `BabyBites_Participants_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
              }}
              className="py-3 px-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2ECE3] border border-[#E2D9CE] text-xs font-bold text-[#24211D] flex items-center justify-center gap-2 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#2D6A4F]" />
              <span>Download CSV File</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const excel = generateExcelCompatibleCsv(participants, true);
                downloadFile(excel, `BabyBites_Excel_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
              }}
              className="py-3 px-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2ECE3] border border-[#E2D9CE] text-xs font-bold text-[#24211D] flex items-center justify-center gap-2 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#E76F51]" />
              <span>Download Excel-Ready File</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const txt = generateLuckyNumbersTxt(participants, true);
                downloadFile(txt, `BabyBites_Lucky_Numbers_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain;charset=utf-8;');
              }}
              className="py-3 px-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2ECE3] border border-[#E2D9CE] text-xs font-bold text-[#24211D] flex items-center justify-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4 text-[#2563EB]" />
              <span>Download TXT (Numbers Only)</span>
            </button>
          </div>
        </div>

        {/* Two-Column Grid: Live Cumulative Participants List & Realtime Webhook Events */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Cumulative Participants List */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8DFD3] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#F2ECE3] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-serif text-[#24211D]">
                  Cumulative Entrants ({participants.length})
                </h3>
                <p className="text-xs text-[#7A7067]">
                  Permanently assigned unique sequential lucky numbers
                </p>
              </div>

              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E2D9CE] text-xs text-[#24211D] w-36 sm:w-44 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
              />
            </div>

            <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#7A7067] uppercase font-bold sticky top-0 border-b border-[#E8DFD3]">
                  <tr>
                    <th className="py-2.5 px-4">#</th>
                    <th className="py-2.5 px-4">Lucky Number</th>
                    <th className="py-2.5 px-4">Participant</th>
                    <th className="py-2.5 px-4">Baby's Age</th>
                    <th className="py-2.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFEA] text-[#474039]">
                  {filteredParticipants.map((p, index) => (
                    <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-4 font-bold text-[#8A8077]">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#2D6A4F]">
                        {p.lucky_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#24211D]">{p.full_name}</div>
                        <div className="text-[11px] text-[#8A8077]">{p.email}</div>
                      </td>
                      <td className="py-3 px-4 text-[#5D554E]">
                        {p.baby_age}
                      </td>
                      <td className="py-3 px-4 text-[#8A8077] whitespace-nowrap">
                        {new Date(p.registered_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}

                  {filteredParticipants.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#8A8077] italic">
                        No participants registered yet. Fill out the registration form to see real-time updates!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Realtime Webhook Event Stream Log */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8DFD3] shadow-sm overflow-hidden flex flex-col max-h-[540px]">
            <div className="p-5 border-b border-[#F2ECE3] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-serif text-[#24211D]">
                  Webhook Event Stream
                </h3>
                <p className="text-xs text-[#7A7067]">
                  Audit log of outgoing payloads
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E5F4EC] text-[#1B4332]">
                Active
              </span>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                    selectedEvent?.id === evt.id
                      ? 'bg-[#E5F4EC]/60 border-[#2D6A4F] shadow-sm'
                      : 'bg-[#FAF8F5] border-[#E8DFD3] hover:border-[#2D6A4F]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-[#2D6A4F]">
                      {evt.participant.lucky_number} &bull; {evt.participant.full_name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        evt.status === 'delivered'
                          ? 'bg-[#E5F4EC] text-[#1B4332]'
                          : evt.status === 'failed'
                          ? 'bg-[#FFF3F0] text-[#E76F51]'
                          : 'bg-[#FAF5EE] text-[#7A7067]'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#8A8077]">
                    <span>Total pool: {evt.cumulative.total_participants}</span>
                    <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}

              {events.length === 0 && (
                <div className="py-12 text-center text-[#8A8077] italic text-xs">
                  No webhook events yet. Test the button above or submit a registration.
                </div>
              )}
            </div>

            {/* Selected Event Payload Viewer */}
            {selectedEvent && (
              <div className="p-4 bg-[#24211D] text-[#E5F4EC] border-t border-[#3A3530] text-[11px] font-mono max-h-48 overflow-y-auto">
                <div className="flex justify-between items-center text-[#8A8077] mb-1">
                  <span>PAYLOAD INSPECTOR ({selectedEvent.event})</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedEvent, null, 2))}
                    className="text-xs text-[#2D6A4F] hover:underline"
                  >
                    Copy JSON
                  </button>
                </div>
                <pre className="whitespace-pre-wrap">{JSON.stringify(selectedEvent, null, 2)}</pre>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
