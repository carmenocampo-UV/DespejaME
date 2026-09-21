export type CategoryId = 
  | 'respiracion' 
  | 'estiramiento' 
  | 'relajacion' 
  | 'descanso_visual' 
  | 'equipo';

export type SpaceRequirement = 'cero_espacio' | 'sentado' | 'de_pie';

export type ParticipantMode = 'solo' | 'duo' | 'ambos';

export interface ExerciseStep {
  secondStart: number;
  secondEnd: number;
  title: string;
  instruction: string;
  visualCue?: 'inhale' | 'hold' | 'exhale' | 'stretch' | 'blink' | 'focus' | 'smile' | 'shake';
}

export interface Exercise {
  id: string;
  title: string;
  category: CategoryId;
  durationSeconds: number; // usually 60
  targetRole: string; // e.g., "Para enfermería y médicos tras horas de pie"
  space: SpaceRequirement;
  participantMode: ParticipantMode;
  tagline: string;
  clinicalBenefit: string;
  iconName: string;
  steps: ExerciseStep[];
  teamNote?: string; // specific instruction if done in pair/team
}

export interface ShiftConfig {
  shiftType: 'manana' | 'tarde' | 'noche' | 'guardia_24' | 'personalizado';
  intervalMinutes: number; // 30, 45, 60, 90, 120
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  emergencyMuteUntil: number | null; // timestamp when mute ends
  scheduledHours: string[]; // e.g. ["09:00", "11:00", "13:30", "16:00"]
}

export interface CompletedSession {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  category: CategoryId;
  timestamp: number;
  durationSeconds: number;
  participantMode: 'solo' | 'duo';
  moodBefore?: number; // 1 to 5
  moodAfter?: number; // 1 to 5
}

export interface UserStats {
  todaySessionsCount: number;
  totalMinutes: number;
  currentStreakDays: number;
  lastSessionDate: string;
  completedSessions: CompletedSession[];
}
