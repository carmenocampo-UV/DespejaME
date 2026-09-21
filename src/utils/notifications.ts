import { ShiftConfig } from '../types';
import { playChime, triggerVibration } from './audio';

const STORAGE_KEY = 'despejame_shift_config';

export const DEFAULT_SHIFT_CONFIG: ShiftConfig = {
  shiftType: 'manana',
  intervalMinutes: 60,
  enabled: false,
  soundEnabled: true,
  vibrationEnabled: true,
  emergencyMuteUntil: null,
  scheduledHours: ['10:00', '12:00', '14:00', '16:00'],
};

export function loadShiftConfig(): ShiftConfig {
  if (typeof window === 'undefined') return DEFAULT_SHIFT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SHIFT_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // Fallback to default
  }
  return DEFAULT_SHIFT_CONFIG;
}

export function saveShiftConfig(config: ShiftConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage error
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    if (Notification.permission === 'granted') {
      return true;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}

export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export function triggerActivePauseNotification(options?: {
  title?: string;
  body?: string;
  force?: boolean;
}): boolean {
  const config = loadShiftConfig();

  // Check emergency mute
  if (!options?.force && config.emergencyMuteUntil && Date.now() < config.emergencyMuteUntil) {
    return false;
  }

  const title = options?.title || '🩺 DespejaME: 60s de Pausa Activa';
  const body = options?.body || 'Tómate un minuto para respirar, estirar o relajar la vista. Tus pacientes y tu cuerpo lo agradecerán.';

  // Trigger sound & vibration if enabled
  if (config.soundEnabled) {
    playChime('start');
  }
  if (config.vibrationEnabled) {
    triggerVibration([150, 100, 150]);
  }

  // Browser Notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'despejame-reminder',
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      return true;
    } catch {
      return false;
    }
  }

  return true;
}
