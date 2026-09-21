import { UserStats, CompletedSession } from '../types';

const STATS_KEY = 'despejame_user_stats';

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadUserStats(): UserStats {
  if (typeof window === 'undefined') {
    return {
      todaySessionsCount: 0,
      totalMinutes: 0,
      currentStreakDays: 1,
      lastSessionDate: getTodayString(),
      completedSessions: [],
    };
  }

  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed: UserStats = JSON.parse(raw);
      const today = getTodayString();

      // Reset today count if it's a new day
      if (parsed.lastSessionDate !== today) {
        return {
          ...parsed,
          todaySessionsCount: 0,
          lastSessionDate: today,
        };
      }
      return parsed;
    }
  } catch {
    // ignore
  }

  return {
    todaySessionsCount: 0,
    totalMinutes: 0,
    currentStreakDays: 1,
    lastSessionDate: getTodayString(),
    completedSessions: [],
  };
}

export function recordCompletedSession(session: Omit<CompletedSession, 'id' | 'timestamp'>): UserStats {
  const current = loadUserStats();
  const today = getTodayString();

  const newSession: CompletedSession = {
    ...session,
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  const isNewDay = current.lastSessionDate !== today;
  const newStreak = isNewDay ? current.currentStreakDays + 1 : current.currentStreakDays;

  const updated: UserStats = {
    todaySessionsCount: (isNewDay ? 0 : current.todaySessionsCount) + 1,
    totalMinutes: current.totalMinutes + Math.round(session.durationSeconds / 60),
    currentStreakDays: newStreak,
    lastSessionDate: today,
    completedSessions: [newSession, ...current.completedSessions].slice(0, 50), // keep last 50
  };

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return updated;
}
