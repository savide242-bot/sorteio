import { Participant } from '../types/giveaway';

// Helper to escape CSV cell content
function escapeCsv(value: string | number | undefined | null): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Format date nicely: YYYY-MM-DD
function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toISOString().split('T')[0];
  } catch {
    return isoString;
  }
}

// 1. Export CSV (matches exact format requested)
// Lucky Number,Full Name,Email,Baby’s Age,Country,Registration Date
export function generateParticipantsCsv(participants: Participant[], eligibleOnly = true): string {
  const filtered = eligibleOnly
    ? participants.filter(p => p.registration_status === 'valid')
    : participants;

  // Exact header line requested:
  const headers = ['Lucky Number', 'Full Name', 'Email', "Baby's Age", 'Country', 'Registration Date', 'Feeding Challenge'];
  const rows = filtered.map(p => [
    p.lucky_number,
    p.full_name,
    p.email,
    p.baby_age,
    p.country || 'N/A',
    formatDate(p.registered_at),
    p.feeding_challenge || 'N/A',
  ]);

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(',')),
  ].join('\r\n');

  return csvContent;
}

// 2. Generate Excel-compatible file (CSV with UTF-8 BOM so Excel opens with proper accents and formatting)
export function generateExcelCompatibleCsv(participants: Participant[], eligibleOnly = true): string {
  const csv = generateParticipantsCsv(participants, eligibleOnly);
  // Prepend UTF-8 BOM (\uFEFF)
  return '\uFEFF' + csv;
}

// 3. Simple text file containing ONLY the lucky numbers, one per line (for Random.org / Wheel of Names)
export function generateLuckyNumbersTxt(participants: Participant[], eligibleOnly = true): string {
  const filtered = eligibleOnly
    ? participants.filter(p => p.registration_status === 'valid')
    : participants;

  return filtered.map(p => p.lucky_number).join('\r\n');
}

// Trigger browser download
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
