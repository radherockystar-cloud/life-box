import { formatClock, formatDuration, formatKm } from './tripAnalysis';
import { formatTripDate } from './tripModels';

// The story as a list of moments, in the order they happened
export const buildTimeline = (entry) => {
  const middle = [];

  (entry.stops || []).forEach((s) =>
    middle.push({
      kind: 'stop',
      t: s.startT,
      emoji: '📍',
      title: `Stopped at ${s.name}`,
      sub: `${formatDuration(s.durationMs)} · ${formatClock(s.startT)} – ${formatClock(s.endT)}`,
    })
  );

  (entry.famous || []).forEach((f) =>
    middle.push({
      kind: 'famous',
      t: f.t,
      emoji: '⭐',
      title: `Passed near ${f.title}`,
      sub: f.extract || 'A famous place on your way',
    })
  );

  middle.sort((a, b) => a.t - b.t);

  return [
    {
      kind: 'start',
      t: entry.startedAt,
      emoji: '🚩',
      title: `Started from ${(entry.from && entry.from.name) || 'your starting point'}`,
      sub: formatClock(entry.startedAt),
    },
    ...middle,
    {
      kind: 'end',
      t: entry.endedAt,
      emoji: '🏁',
      title: `Reached ${(entry.to && entry.to.name) || 'your destination'}`,
      sub: `${formatClock(entry.endedAt)} · ${formatKm(entry.distanceKm)} in ${formatDuration(entry.durationMs)}`,
    },
  ];
};

export const buildStoryShareText = (entry) => {
  const lines = [`🧳 ${entry.title}`, formatTripDate(entry.startedAt), ''];
  buildTimeline(entry).forEach((item) => lines.push(`${item.emoji} ${item.title}`));
  lines.push('', `📏 ${formatKm(entry.distanceKm)} · ⏱️ ${formatDuration(entry.durationMs)} · 📍 ${(entry.stops || []).length} stops`);
  if (entry.companions && entry.companions.length > 0) lines.push(`👥 Travelled with ${entry.companions.join(', ')}`);
  lines.push('', 'Recorded with Life Box');
  return lines.join('\n');
};
