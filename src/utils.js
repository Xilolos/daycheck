export const pad2 = (n) => String(n).padStart(2, '0');
export const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

// m is 0-indexed
export const dateKey = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;

export function displayValue(tracker, raw) {
  if (raw === undefined || raw === null || raw === '') return '';
  switch (tracker.type) {
    case 'time':     return raw;
    case 'check':    return '×';
    case 'weight':   return `${raw} ${tracker.unit || 'kg'}`;
    case 'counter':  return String(raw);
    case 'distance': return `${raw} ${tracker.unit || 'km'}`;
    case 'duration': return `${raw} min`;
    case 'mood':     return String(raw);
    default:         return String(raw);
  }
}

export function parseTimeToMin(s) {
  if (!s) return null;
  const m = String(s).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10), mn = parseInt(m[2], 10);
  const ap = (m[3] || '').toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + mn;
}

export function minToTime(min) {
  let h = Math.floor(min / 60), mn = min % 60;
  const ap = h >= 12 ? 'PM' : 'AM';
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${pad2(mn)} ${ap}`;
}

const _now = new Date();
export const TODAY = { y: _now.getFullYear(), m: _now.getMonth(), d: _now.getDate() };
