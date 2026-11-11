import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Info,
  ExternalLink,
  Users
} from 'lucide-react';
import { fetchAllParticipants } from '../../lib/storage';
import { 
  generateParticipantsCsv, 
  generateExcelCompatibleCsv, 
  generateLuckyNumbersTxt, 
  downloadFile 
} from '../../lib/exportUtils';
import { Participant } from '../../types/giveaway';

export const AdminExportPage: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [copiedTxt, setCopiedTxt] = useState(false);
  const [exportEligibleOnly, setExportEligibleOnly] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchAllParticipants();
      setParticipants(data);
    };
    load();
  }, []);

  const totalCount = participants.length;
  const eligibleCount = participants.filter((p) => p.registration_status === 'valid').length;
  const disqualifiedCount = totalCount - eligibleCount;

  // 1. Download CSV
  const handleDownloadCsv = () => {
    const csv = generateParticipantsCsv(participants, exportEligibleOnly);
    const filename = `BabyBites_Giveaway_${exportEligibleOnly ? 'Eligible' : 'All'}_Participants_${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  };

  // 2. Download Excel-Compatible CSV
  const handleDownloadExcel = () => {
    const excelCsv = generateExcelCompatibleCsv(participants, exportEligibleOnly);
    const filename = `BabyBites_Giveaway_ExcelReady_${exportEligibleOnly ? 'Eligible' : 'All'}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(excelCsv, filename, 'text/csv;charset=utf-8;');
  };

  // 3. Download TXT (Lucky Numbers Only, 1 per line)
  const handleDownloadTxt = () => {
    const txt = generateLuckyNumbersTxt(participants, exportEligibleOnly);
    const filename = `BabyBites_Lucky_Numbers_${exportEligibleOnly ? 'Eligible' : 'All'}_${new Date().toISOString().split('T')[0]}.txt`;
    downloadFile(txt, filename, 'text/plain;charset=utf-8;');
  };

  // Copy Lucky Numbers list to clipboard
  const handleCopyLuckyNumbers = () => {
    const txt = generateLuckyNumbersTxt(participants, exportEligibleOnly);
    navigator.clipboard.writeText(txt);
    setCopiedTxt(true);
    setTimeout(() => setCopiedTxt(false), 2500);
  };

  const luckyNumbersTxtPreview = generateLuckyNumbersTxt(participants, exportEligibleOnly)
    .split('\r\n')
    .slice(0, 15)
    .join('\n');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                AUDITED EXTERNAL DRAW PREPARATION
              </span>
            </div>
            <h1 className="text-3xl font-extrabold font-serif text-stone-900 tracking-tight">
              EXPORT PARTICIPANTS
            </h1>
            <p className="text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
              Prepare, audit, and export the official participant dataset and sequential lucky numbers for winner selection in an external, independent random draw application.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#FAF7F2] p-4 rounded-2xl border border-rose-100 shrink-0">
            <div className="text-center px-3">
              <span className="block text-2xl font-bold font-serif text-emerald-600">
                {eligibleCount}
              </span>
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                Eligible Entrants
              </span>
            </div>
            <div className="h-8 w-px bg-rose-200" />
            <div className="text-center px-3">
              <span className="block text-2xl font-bold font-serif text-stone-900">
                {totalCount}
              </span>
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                Total Registered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STRICT REGULATORY & ARCHITECTURAL NOTICE */}
      <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3 shadow-sm">
        <div className="flex items-center gap-2.5 font-bold text-sm text-amber-900">
          <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
          <span>IMPORTANT: EXTERNAL DRAW MANDATE (ZERO ON-SITE DRAWING)</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          In strict accordance with the project specification and transparent sweepstakes standards, <strong>this website does NOT perform random winner selection</strong>. There is no internal random draw button, no winner selection algorithm, and no automated winner assignment on this platform.
        </p>
        <p className="text-xs text-amber-800">
          <strong>Procedure:</strong> The administrator downloads the verified files below and imports the lucky numbers into a certified external random selection platform (e.g. <em>Random.org Third-Party Multi-Round Service</em>, certified lottery machine, or public live-streamed draw).
        </p>
      </div>

      {/* Export Options & Filter Toggle */}
      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rose-100">
          <div>
            <h3 className="text-lg font-bold font-serif text-stone-900">
              Download Official Datasets
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Choose your preferred format for the external drawing software.
            </p>
          </div>

          {/* Toggle Eligible only vs All */}
          <div className="flex items-center gap-3 bg-stone-100 p-1.5 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setExportEligibleOnly(true)}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                exportEligibleOnly
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Eligible Only ({eligibleCount})
            </button>
            <button
              type="button"
              onClick={() => setExportEligibleOnly(false)}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                !exportEligibleOnly
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              All Including Disqualified ({totalCount})
            </button>
          </div>
        </div>

        {/* 3 Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. CSV Download */}
          <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-rose-100 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-stone-900 font-serif">
                1. Standard CSV File
              </h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Complete participant dataset with headers: <code className="text-[10px] bg-white px-1 py-0.5 rounded border border-rose-200">Lucky Number, Full Name, Email, Baby's Age, Country, Registration Date</code>.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV File</span>
            </button>
          </div>

          {/* 2. Excel-Compatible File */}
          <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-rose-100 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-stone-900 font-serif">
                2. Excel-Compatible File
              </h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Formatted with UTF-8 BOM encoding for seamless instant opening in Microsoft Excel and Numbers with special characters preserved.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel File</span>
            </button>
          </div>

          {/* 3. Pure TXT (Lucky Numbers Only) */}
          <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-rose-100 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-stone-900 font-serif">
                3. Lucky Numbers TXT
              </h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Simple clean text file containing ONLY the sequential lucky numbers (e.g. <code className="text-[10px] bg-white px-1 py-0.5 rounded border">BB0001</code>), one per line. Ideal for Random.org paste.
              </p>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download TXT File</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLuckyNumbers}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedTxt ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied {eligibleCount} Codes!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Copy All Codes to Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lucky Numbers Stream Preview */}
      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold font-serif text-stone-900">
              Lucky Numbers Sequential Stream Preview
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Verifiable sequence assigned to participants
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-stone-400">
            Previewing first 15 of {exportEligibleOnly ? eligibleCount : totalCount}
          </span>
        </div>

        <pre className="p-4 rounded-2xl bg-stone-900 text-rose-300 font-mono text-xs leading-relaxed overflow-x-auto max-h-48 border border-stone-800">
          {luckyNumbersTxtPreview || '// No participants registered yet.'}
        </pre>
      </div>
    </div>
  );
};
