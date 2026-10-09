import activity from '../data/activity.json';

// Local YYYY-MM-DD (toISOString would shift dates for timezones ahead of UTC).
export const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const sum = (map) => Object.values(map).reduce((s, n) => s + n, 0);

const merged = { ...activity.gitlab };
for (const [day, n] of Object.entries(activity.github)) merged[day] = (merged[day] || 0) + n;

const days = Object.keys(merged).sort();

export const contributions = {
  byDay: merged,
  total: sum(merged),
  gitlab: sum(activity.gitlab),
  github: sum(activity.github),
  activeDays: days.length,
  peak: Math.max(0, ...Object.values(merged)),
  lastActive: days.at(-1) || null,
  fetchedAt: activity.fetchedAt,
};

// Contributions per week, oldest first — feeds the monitor sparkline.
export function weeklySeries(weeks = 26, now = new Date()) {
  const out = Array(weeks).fill(0);
  for (const [day, n] of Object.entries(merged)) {
    const age = Math.floor((now - new Date(`${day}T00:00:00`)) / (7 * 86_400_000));
    if (age >= 0 && age < weeks) out[weeks - 1 - age] += n;
  }
  return out;
}

// Most recent active days with a per-source breakdown — feeds the activity log.
export function recentDays(limit = 8) {
  return days.slice(-limit).reverse().map((day) => ({
    day,
    total: merged[day],
    gitlab: activity.gitlab[day] || 0,
    github: activity.github[day] || 0,
  }));
}
