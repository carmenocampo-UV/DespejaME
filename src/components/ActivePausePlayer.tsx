import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Volume2, 
  VolumeX, 
  Users, 
  User, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  Heart,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Exercise, CategoryId } from '../types';
import { playChime, triggerVibration } from '../utils/audio';

interface ActivePausePlayerProps {
  exercise: Exercise;
  soundEnabled: boolean;
  participantMode: 'solo' | 'duo';
  onComplete: (data: { exerciseId: string; moodBefore?: number; moodAfter?: number }) => void;
  onClose: () => void;
  onSwitchExercise: () => void;
}

export const ActivePausePlayer: React.FC<ActivePausePlayerProps> = ({
  exercise,
  soundEnabled,
  participantMode,
  onComplete,
  onClose,
  onSwitchExercise,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [localSound, setLocalSound] = useState<boolean>(soundEnabled);
  const midpointPlayedRef = useRef<boolean>(false);

  const totalDuration = 60;
  const elapsed = totalDuration - secondsLeft;

  // Find active step based on elapsed seconds
  const currentStep = exercise.steps.find(
    (step) => elapsed >= step.secondStart && elapsed < step.secondEnd
  ) || exercise.steps[exercise.steps.length - 1];

  const currentStepIndex = exercise.steps.findIndex(
    (step) => elapsed >= step.secondStart && elapsed < step.secondEnd
  );

  // Initial chime on mount and reset when exercise changes
  useEffect(() => {
    setSecondsLeft(60);
    setIsRunning(true);
    setIsFinished(false);
    midpointPlayedRef.current = false;
    setSelectedMood(null);

    if (localSound) {
      playChime('start');
    }
    triggerVibration([80]);
  }, [exercise.id, localSound]);

  // Main countdown timer
  useEffect(() => {
    if (!isRunning || isFinished) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }

        // Midpoint chime at 30 seconds
        if (prev === 31 && !midpointPlayedRef.current) {
          midpointPlayedRef.current = true;
          if (localSound) playChime('midpoint');
          triggerVibration([50, 50, 50]);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isFinished, localSound]);

  const handleFinish = () => {
    setIsFinished(true);
    setIsRunning(false);

    if (localSound) {
      playChime('complete');
    }
    triggerVibration([100, 80, 200]);

    // Launch celebratory clinical confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#1d4ed8', '#2563eb', '#0284c7', '#38bdf8', '#6366f1'],
      });
    } catch {
      // Confetti fallback
    }
  };

  const handleRestart = () => {
    setSecondsLeft(60);
    setIsRunning(true);
    setIsFinished(false);
    midpointPlayedRef.current = false;
    setSelectedMood(null);
    if (localSound) playChime('start');
  };

  const handleSaveAndExit = () => {
    onComplete({
      exerciseId: exercise.id,
      moodAfter: selectedMood || 4,
    });
  };

  // SVG Progress calculation
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (elapsed / totalDuration) * circumference;

  return (
    <div 
      id="active-pause-player-overlay"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div 
        id="active-pause-player-card"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto transition-all"
      >
        {/* Top bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Pausa Activa de 60s
            </span>
            {participantMode === 'duo' ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                <Users className="w-3 h-3" /> En Pareja
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full">
                <User className="w-3 h-3" /> Individual
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              id="player-sound-toggle-btn"
              onClick={() => setLocalSound(!localSound)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              title={localSound ? 'Silenciar campanadas' : 'Activar sonido'}
            >
              {localSound ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              id="player-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              title="Cerrar pausa"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="p-5 flex-1 flex flex-col items-center text-center">
          {!isFinished ? (
            <>
              {/* Exercise Title and Target */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900 leading-tight font-heading">
                  {exercise.title}
                </h2>
                <p className="text-xs text-blue-700 font-medium mt-1">
                  {exercise.targetRole}
                </p>
              </div>

              {/* Circular Timer & Visual Breathing / Stretch Cue */}
              <div className="relative w-52 h-52 my-2 flex items-center justify-center">
                {/* SVG Ring */}
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
                  <circle
                    cx="120"
                    cy="120"
                    r={radius}
                    className="text-slate-100 stroke-current"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r={radius}
                    className="text-blue-600 stroke-current transition-all duration-1000 ease-linear"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Inner Pulse / Rhythm Animation */}
                <div className="absolute inset-4 rounded-full flex flex-col items-center justify-center pointer-events-none">
                  {/* Dynamic Pulsing Orb */}
                  <motion.div
                    animate={
                      currentStep?.visualCue === 'inhale'
                        ? { scale: [1, 1.25], opacity: [0.7, 1] }
                        : currentStep?.visualCue === 'hold'
                        ? { scale: 1.25, opacity: 0.9 }
                        : currentStep?.visualCue === 'exhale'
                        ? { scale: [1.25, 0.95], opacity: [1, 0.7] }
                        : currentStep?.visualCue === 'shake'
                        ? { x: [-3, 3, -3, 3, 0], scale: 1 }
                        : { scale: [0.98, 1.03, 0.98] }
                    }
                    transition={{
                      duration: currentStep?.visualCue === 'inhale' || currentStep?.visualCue === 'exhale' ? 4 : 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-100 to-sky-100 border border-blue-200/60 flex flex-col items-center justify-center shadow-inner"
                  >
                    <span className="text-3xl font-bold font-mono text-slate-800 tracking-tight">
                      {secondsLeft}s
                    </span>
                    <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider mt-0.5">
                      {currentStep?.visualCue === 'inhale'
                        ? 'Inhala'
                        : currentStep?.visualCue === 'exhale'
                        ? 'Exhala'
                        : currentStep?.visualCue === 'hold'
                        ? 'Sostén'
                        : currentStep?.visualCue === 'blink'
                        ? 'Parpadea'
                        : currentStep?.visualCue === 'shake'
                        ? 'Sacude'
                        : 'Respira'}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Step indicator bar */}
              <div className="flex items-center gap-1.5 mb-3 w-full max-w-xs justify-center">
                {exercise.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStepIndex
                        ? 'w-8 bg-blue-600'
                        : idx < currentStepIndex
                        ? 'w-4 bg-blue-300'
                        : 'w-4 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* Current Step Instructions */}
              <div className="w-full bg-blue-50/80 border border-blue-100 rounded-2xl p-4 min-h-[96px] flex flex-col justify-center mb-2">
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-1 block">
                  Paso {currentStepIndex + 1} de {exercise.steps.length}: {currentStep?.title}
                </span>
                <p className="text-sm font-medium text-slate-800 leading-relaxed">
                  {currentStep?.instruction}
                </p>
              </div>

              {/* Partner note if in duo mode */}
              {participantMode === 'duo' && exercise.teamNote && (
                <div className="text-xs text-sky-900 bg-sky-50 border border-sky-200 rounded-xl px-3 py-1.5 mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>{exercise.teamNote}</span>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mt-3 w-full">
                <button
                  id="player-restart-btn"
                  onClick={handleRestart}
                  className="p-3 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200"
                  title="Reiniciar 60s"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  id="player-play-pause-btn"
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-md transition-transform active:scale-95 ${
                    isRunning
                      ? 'bg-slate-800 text-white hover:bg-slate-900'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Reanudar</span>
                    </>
                  )}
                </button>

                <button
                  id="player-switch-btn"
                  onClick={onSwitchExercise}
                  className="p-3 rounded-full text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors border border-slate-200"
                  title="Cambiar ejercicio"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            /* FINISHED STATE */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-4 flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 font-heading">
                ¡60 segundos completados!
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Has regalado a tu cuerpo y mente un respiro vital en medio de la guardia.
              </p>

              {/* Mood Check */}
              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 my-4">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  ¿Cómo te sientes ahora?
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 1, label: 'Aliviado', emoji: '😌' },
                    { id: 2, label: 'En calma', emoji: '🧘' },
                    { id: 3, label: 'Con energía', emoji: '⚡' },
                    { id: 4, label: 'Enfocado', emoji: '🎯' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMood(m.id)}
                      className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs transition-all ${
                        selectedMood === m.id
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-lg">{m.emoji}</span>
                      <span className="text-[10px] mt-0.5">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clinical encouragement note */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 text-left flex items-start gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Beneficio clínico obtenido:</strong> {exercise.clinicalBenefit}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <button
                  id="player-save-exit-btn"
                  onClick={handleSaveAndExit}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all"
                >
                  <span>Volver al turno</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="player-do-another-btn"
                  onClick={onSwitchExercise}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                >
                  Otra pausa distinta
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom micro-footer */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Espacio: {exercise.space === 'cero_espacio' ? 'Cero espacio (en el sitio)' : exercise.space === 'sentado' ? 'Sentado(a)' : 'De pie'}</span>
          <span className="text-blue-700 font-semibold">{exercise.category.replace('_', ' ').toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
