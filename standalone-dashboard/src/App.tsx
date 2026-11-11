import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Copy, 
  Check, 
  Sparkles, 
  Users, 
  RefreshCw, 
  ShieldCheck, 
  Send,
  Eye,
  Lock,
  Globe
} from 'lucide-react';

interface Participant {
  id: string;
  lucky_number: string;
  full_name: string;
  email: string;
  baby_age: string;
  country?: string;
  feeding_challenge?: string;
  registered_at: string;
  registration_status: string;
}

interface WebhookPayload {
  id: string;
  event: string;
  timestamp: string;
  participant: Participant;
  cumulative: {
    total_participants: number;
    latest_number: string;
    all_lucky_numbers: string[];
  };
}

export const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [events, setEvents] = useState<WebhookPayload[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WebhookPayload | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync with localStorage or receive live events
  const loadStoredData = () => {
    try {
      const storedParticipants = localStorage.getItem('babybites_giveaway_participants_v1');
      if (storedParticipants) {
        setParticipants(JSON.parse(storedParticipants));
      }

      const storedEvents = localStorage.getItem('babybites_webhook_events_v1');
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    loadStoredData();
    const interval = setInterval(loadStoredData, 2000); // Polling local bus every 2s for instant update
    return () => clearInterval(interval);
  }, []);

  const totalRegistered = participants.length;
  const eligibleCount = participants.filter(p => p.registration_status === 'valid').length;

  // Export 1: CSV
  const handleDownloadCsv = () => {
    const headers = ['Lucky Number', 'Full Name', 'Email', "Baby's Age", 'Country', 'Registration Date', 'Feeding Challenge'];
    const rows = participants.map(p => [
      p.lucky_number,
      `"${p.full_name.replace(/"/g, '""')}"`,
      p.email,
      `"${p.baby_age}"`,
      `"${p.country || ''}"`,
      p.registered_at.split('T')[0],
      `"${(p.feeding_challenge || '').replace(/"/g, '""')}"`
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BabyBites_Giveaway_Participants_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Export 2: Excel-compatible
  const handleDownloadExcel = () => {
    const headers = ['Lucky Number', 'Full Name', 'Email', "Baby's Age", 'Country', 'Registration Date', 'Feeding Challenge'];
    const rows = participants.map(p => [
      p.lucky_number,
      `"${p.full_name.replace(/"/g, '""')}"`,
      p.email,
      `"${p.baby_age}"`,
      `"${p.country || ''}"`,
      p.registered_at.split('T')[0],
      `"${(p.feeding_challenge || '').replace(/"/g, '""')}"`
    ].join(','));

    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BabyBites_Excel_Ready_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Export 3: Lucky numbers only for Random.org
  const handleDownloadTxt = () => {
    const txt = participants.map(p => p.lucky_number).join('\r\n');
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BabyBites_Lucky_Numbers_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const handleCopyCodes = () => {
    const txt = participants.map(p => p.lucky_number).join('\n');
    navigator.clipboard.writeText(txt);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2500);
  };

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
    <div className="min-h-screen bg-[#F8F6F1] text-[#24211D] p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8DFD3] shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
                Autonomous Webhook Control Station
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#24211D]">
              BabyBites Operations Dashboard
            </h1>
            <p className="text-xs text-[#7A7067] mt-1">
              Separate Standalone Controller &bull; Listens to registration website webhooks &bull; External draw preparation
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadStoredData}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE3] text-[#5D554E] font-bold text-xs border border-[#E5DDD4] transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-[#2D6A4F]" />
              <span>Refresh Now</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E8DFD3] shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7067] block mb-1">
              Total Entrants
            </span>
            <span className="text-3xl font-serif font-bold text-[#24211D]">
              {totalRegistered}
            </span>
            <span className="text-[11px] text-[#2D6A4F] block mt-1 font-semibold">
              {eligibleCount} eligible for draw
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8DFD3] shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7067] block mb-1">
              Webhook Events
            </span>
            <span className="text-3xl font-serif font-bold text-[#2D6A4F]">
              {events.length}
            </span>
            <span className="text-[11px] text-[#7A7067] block mt-1">
              Live event stream
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
              {participants[0]?.full_name || 'Awaiting registrations'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8DFD3] shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7067] block mb-1">
              Draw Policy
            </span>
            <span className="text-lg font-bold text-[#24211D] block mt-1">
              Random.org Ready
            </span>
            <span className="text-[11px] text-[#2D6A4F] block font-semibold">
              External verified draw
            </span>
          </div>
        </div>

        {/* 1-Click Export Center for External Draw */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2ECE3]">
            <div>
              <h3 className="text-base font-bold font-serif text-[#24211D]">
                Export Data for External Random Draw (Random.org)
              </h3>
              <p className="text-xs text-[#7A7067] mt-0.5">
                Download formatted files preserving the exact sequential lucky numbers.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyCodes}
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
                  <span>Copy All Codes ({eligibleCount})</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="py-3 px-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2ECE3] border border-[#E2D9CE] text-xs font-bold text-[#24211D] flex items-center justify-center gap-2 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#2D6A4F]" />
              <span>Download CSV File</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadExcel}
              className="py-3 px-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2ECE3] border border-[#E2D9CE] text-xs font-bold text-[#24211D] flex items-center justify-center gap-2 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#E76F51]" />
              <span>Download Excel-Ready File</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="py-3 px-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2ECE3] border border-[#E2D9CE] text-xs font-bold text-[#24211D] flex items-center justify-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4 text-[#2563EB]" />
              <span>Download TXT (Numbers Only)</span>
            </button>
          </div>
        </div>

        {/* Live Cumulative List & Webhook Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Cumulative Participants List */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8DFD3] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#F2ECE3] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-serif text-[#24211D]">
                  Live Cumulative Entrants ({participants.length})
                </h3>
                <p className="text-xs text-[#7A7067]">
                  Received via registration webhooks &bull; Permanent lucky numbers
                </p>
              </div>

              <input
                type="text"
                placeholder="Search entrant..."
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
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">Mother's Name</th>
                    <th className="py-2.5 px-4">Baby's Stage</th>
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
                        No participants registered yet. As mothers register on the website, they will appear here in real time!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Webhook Events Stream */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8DFD3] shadow-sm overflow-hidden flex flex-col max-h-[540px]">
            <div className="p-5 border-b border-[#F2ECE3] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-serif text-[#24211D]">
                  Incoming Webhook Stream
                </h3>
                <p className="text-xs text-[#7A7067]">
                  Real-time payloads from registration site
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E5F4EC] text-[#1B4332]">
                Listening
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
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#E5F4EC] text-[#1B4332]">
                      Received
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#8A8077]">
                    <span>Pool: {evt.cumulative?.total_participants || 1} entrants</span>
                    <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}

              {events.length === 0 && (
                <div className="py-12 text-center text-[#8A8077] italic text-xs">
                  Awaiting first incoming webhook event.
                </div>
              )}
            </div>

            {selectedEvent && (
              <div className="p-4 bg-[#24211D] text-[#E5F4EC] border-t border-[#3A3530] text-[11px] font-mono max-h-48 overflow-y-auto">
                <div className="flex justify-between items-center text-[#8A8077] mb-1">
                  <span>PAYLOAD INSPECTOR</span>
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
