/**
 * DespejaME: 60 segundos de pausa activa para personal de salud.
 * Diseñada para dispositivos móviles y estaciones clínicas durante turnos agotadores.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { QuickStartHero } from './components/QuickStartHero';
import { ExerciseSelector } from './components/ExerciseSelector';
import { ActivePausePlayer } from './components/ActivePausePlayer';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { ShiftSummaryModal } from './components/ShiftSummaryModal';
import { EXERCISES } from './data/exercises';
import { Exercise, ShiftConfig, UserStats } from './types';
import { 
  loadShiftConfig, 
  saveShiftConfig, 
  triggerActivePauseNotification 
} from './utils/notifications';
import { loadUserStats, recordCompletedSession } from './utils/stats';
import { playChime } from './utils/audio';
import { Heart, Activity, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  const [shiftConfig, setShiftConfig] = useState<ShiftConfig>(loadShiftConfig);
  const [userStats, setUserStats] = useState<UserStats>(loadUserStats);
  const [participantMode, setParticipantMode] = useState<'solo' | 'duo'>('solo');

  // Exercise states
  const [recommendedExercise, setRecommendedExercise] = useState<Exercise>(() => {
    return EXERCISES[0];
  });
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

  // Modals
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);

  // Sync Shift Config to storage whenever changed
  const handleSaveShiftConfig = (newConfig: ShiftConfig) => {
    setShiftConfig(newConfig);
    saveShiftConfig(newConfig);
  };

  // Toggle Sound quickly
  const handleToggleSound = () => {
    const updated = { ...shiftConfig, soundEnabled: !shiftConfig.soundEnabled };
    handleSaveShiftConfig(updated);
    if (updated.soundEnabled) {
      playChime('start');
    }
  };

  // Toggle Emergency Mute quickly (30 min)
  const handleToggleEmergencyMute = () => {
    const isMuted = shiftConfig.emergencyMuteUntil && Date.now() < shiftConfig.emergencyMuteUntil;
    const updated = {
      ...shiftConfig,
      emergencyMuteUntil: isMuted ? null : Date.now() + 30 * 60 * 1000,
    };
    handleSaveShiftConfig(updated);
  };

  // Shuffle recommended exercise
  const handleShuffleExercise = useCallback(() => {
    // Filter matching participant mode if possible
    const candidates = EXERCISES.filter((ex) => {
      if (participantMode === 'duo') return ex.participantMode === 'duo' || ex.participantMode === 'ambos';
      return ex.participantMode === 'solo' || ex.participantMode === 'ambos';
    });

    const currentId = activeExercise ? activeExercise.id : recommendedExercise.id;
    const otherCandidates = candidates.filter((ex) => ex.id !== currentId);
    const pool = otherCandidates.length > 0 ? otherCandidates : EXERCISES;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const nextEx = pool[randomIndex];
    
    setRecommendedExercise(nextEx);
    if (activeExercise) {
      setActiveExercise(nextEx);
    }
  }, [participantMode, recommendedExercise.id, activeExercise]);

  // Handle participant mode switch
  const handleToggleParticipantMode = (mode: 'solo' | 'duo') => {
    setParticipantMode(mode);
    if (mode === 'duo') {
      const duoEx = EXERCISES.find((e) => e.participantMode === 'duo') || EXERCISES[0];
      setRecommendedExercise(duoEx);
    } else {
      const soloEx = EXERCISES.find((e) => e.participantMode === 'solo') || EXERCISES[0];
      setRecommendedExercise(soloEx);
    }
  };

  // Start active pause
  const handleStartPause = (exercise?: Exercise) => {
    setActiveExercise(exercise || recommendedExercise);
  };

  // Complete active pause
  const handleCompletePause = ({ exerciseId, moodAfter }: { exerciseId: string; moodBefore?: number; moodAfter?: number }) => {
    const ex = EXERCISES.find((e) => e.id === exerciseId) || recommendedExercise;
    const updatedStats = recordCompletedSession({
      exerciseId: ex.id,
      exerciseTitle: ex.title,
      category: ex.category,
      durationSeconds: ex.durationSeconds,
      participantMode,
      moodAfter,
    });
    setUserStats(updatedStats);
    setActiveExercise(null);

    // Pick a new recommended exercise for next break to avoid monotony
    handleShuffleExercise();
  };

  // Periodic reminder background loop during shift
  useEffect(() => {
    if (!shiftConfig.enabled) return;

    const intervalMs = shiftConfig.intervalMinutes * 60 * 1000;
    const intervalTimer = setInterval(() => {
      triggerActivePauseNotification({
        title: '🩺 DespejaME: Tu minuto de pausa activa',
        body: 'Llevas tiempo en guardia o frente a pantallas. Tómate 60s para resetear tu cuerpo y mente.',
      });
    }, intervalMs);

    return () => clearInterval(intervalTimer);
  }, [shiftConfig.enabled, shiftConfig.intervalMinutes, shiftConfig.emergencyMuteUntil]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      {/* Top Navigation */}
      <Header
        shiftConfig={shiftConfig}
        todayCount={userStats.todaySessionsCount}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        onOpenStats={() => setIsStatsModalOpen(true)}
        onToggleSound={handleToggleSound}
        onToggleEmergencyMute={handleToggleEmergencyMute}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Quick Shift Badge */}
        <div className="flex items-center justify-between text-xs text-slate-500 bg-teal-50/60 border border-teal-100/80 rounded-xl px-3.5 py-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            <span>
              Turno: <strong className="text-teal-900 capitalize">{shiftConfig.shiftType.replace('_', ' ')}</strong>
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">
              Recordatorio cada {shiftConfig.intervalMinutes} min
            </span>
          </div>

          <button
            onClick={() => setIsNotifModalOpen(true)}
            className="text-teal-700 font-semibold hover:underline"
          >
            Ajustar turno
          </button>
        </div>

        {/* 1-Tap Quick Start Hero */}
        <QuickStartHero
          exercise={recommendedExercise}
          participantMode={participantMode}
          todayCount={userStats.todaySessionsCount}
          streakDays={userStats.currentStreakDays}
          onStart={() => handleStartPause(recommendedExercise)}
          onShuffle={handleShuffleExercise}
          onToggleParticipantMode={handleToggleParticipantMode}
        />

        {/* Catalog of 60s Breaks (Avoiding Monotony) */}
        <ExerciseSelector
          exercises={EXERCISES}
          participantMode={participantMode}
          onSelectExercise={(ex) => handleStartPause(ex)}
          onSetParticipantMode={handleToggleParticipantMode}
        />
      </main>

      {/* Active Pause Player Modal */}
      {activeExercise && (
        <ActivePausePlayer
          exercise={activeExercise}
          soundEnabled={shiftConfig.soundEnabled}
          participantMode={participantMode}
          onComplete={handleCompletePause}
          onClose={() => setActiveExercise(null)}
          onSwitchExercise={handleShuffleExercise}
        />
      )}

      {/* Notification and Shift Config Modal */}
      <NotificationSettingsModal
        config={shiftConfig}
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        onSave={handleSaveShiftConfig}
      />

      {/* Shift Summary & Clinical Ergonomics Modal */}
      <ShiftSummaryModal
        stats={userStats}
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        onStartPause={() => {
          setIsStatsModalOpen(false);
          handleStartPause();
        }}
      />

      {/* Clinical Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 px-4 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 font-heading">DespejaME</span>
            <span>— Pausas activas de 60 segundos para personal sanitario</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Cero espacio necesario</span>
            <span>•</span>
            <span>Uso individual o en equipo</span>
            <span>•</span>
            <span>Apto para guardias</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
