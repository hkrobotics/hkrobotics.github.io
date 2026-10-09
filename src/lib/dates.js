import { profile } from '../data/profile.js';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const parseMonth = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return { y, m };
};

// Whole months between a "YYYY-MM" start and now.
export function monthsSince(ym, now = new Date()) {
  const { y, m } = parseMonth(ym);
  return (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
}

export function experienceYears(now = new Date()) {
  return Math.floor(monthsSince(profile.careerStart, now) / 12);
}

// "4+ years" — derived from careerStart so it never goes stale.
export const experienceLabel = (now) => `${experienceYears(now)}+ years`;

// "4y 0m" — monitor uptime readout.
export function uptime(now = new Date()) {
  const total = monthsSince(profile.careerStart, now);
  return `${Math.floor(total / 12)}y ${total % 12}m`;
}

// "oct 2023" / "Oct 2023"
export function formatMonth(ym, { capital = false } = {}) {
  const { y, m } = parseMonth(ym);
  const name = MONTHS[m - 1];
  return `${capital ? name[0].toUpperCase() + name.slice(1) : name} ${y}`;
}

export function formatRange(from, to, opts) {
  return `${formatMonth(from, opts)} — ${to ? formatMonth(to, opts) : opts?.capital ? 'Present' : 'present'}`;
}

// "3 days ago" for ISO dates.
export function relativeDays(iso, now = new Date()) {
  const days = Math.round((now - new Date(iso)) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}
