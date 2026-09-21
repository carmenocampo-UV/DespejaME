import React from 'react';
import { Play, Shuffle, User, Users, Clock, ShieldCheck, Sparkles, Flame } from 'lucide-react';
import { Exercise, ParticipantMode } from '../types';

interface QuickStartHeroProps {
  exercise: Exercise;
  participantMode: 'solo' | 'duo';
  todayCount: number;
  streakDays: number;
  onStart: () => void;
  onShuffle: () => void;
  onToggleParticipantMode: (mode: 'solo' | 'duo') => void;
}

export const QuickStartHero: React.FC<QuickStartHeroProps> = ({
  exercise,
  participantMode,
  todayCount,
  streakDays,
  onStart,
  onShuffle,
  onToggleParticipantMode,
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-teal-950/15">
      {/* Decorative calm background elements */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left column: Quick presentation & Exercise focus */}
        <div className="flex-1 text-center md:text-left">
          {/* Mode Switcher Pills */}
          <div className="inline-flex items-center p-1 bg-teal-950/60 rounded-xl border border-teal-700/50 backdrop-blur-sm mb-4">
            <button
              id="hero-mode-solo-btn"
              onClick={() => onToggleParticipantMode('solo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                participantMode === 'solo'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-teal-200/80 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Estoy Solo(a)</span>
            </button>
            <button
              id="hero-mode-duo-btn"
              onClick={() => onToggleParticipantMode('duo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                participantMode === 'duo'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-teal-200/80 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Con un Compañero(a)</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight font-heading">
            Tómate 60 segundos ahora
          </h1>
          <p className="text-teal-100/90 text-sm mt-1.5 max-w-lg leading-relaxed">
            Tu cuerpo y mente sostienen la salud de otros. 1 minuto de pausa activa restablece tu pulso, relaja tu postura y previene el agotamiento.
          </p>

          {/* Current selected preview badge */}
          <div className="mt-4 p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 max-w-lg flex items-start gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-teal-500/30 border border-teal-300/30 flex items-center justify-center text-teal-200 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Recomendado para tu turno
                </span>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                  {exercise.space === 'cero_espacio' ? 'Cero espacio' : 'En el puesto'}
                </span>
              </div>
              <h3 className="font-bold text-base text-white truncate mt-0.5">
                {exercise.title}
              </h3>
              <p className="text-xs text-teal-100/80 line-clamp-1 mt-0.5">
                {exercise.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Right column: 1-Tap Big Action Button & Shuffle */}
        <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
          <button
            id="hero-start-pause-btn"
            onClick={onStart}
            className="group relative w-full sm:w-60 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-extrabold text-base flex items-center justify-center gap-3 shadow-lg shadow-teal-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-98"
          >
            <span className="w-8 h-8 rounded-full bg-slate-950/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-current text-slate-950 ml-0.5" />
            </span>
            <span className="tracking-tight">INICIAR 60 SEGUNDOS</span>
          </button>

          {/* Shuffle / Alternate button */}
          <button
            id="hero-shuffle-exercise-btn"
            onClick={onShuffle}
            className="flex items-center gap-2 text-xs font-semibold text-teal-200 hover:text-white py-1.5 px-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5 text-teal-300" />
            <span>Cambiar ejercicio (Sorpréndeme)</span>
          </button>

          {/* Mini Shift Pill Indicators */}
          <div className="flex items-center gap-4 text-xs text-teal-200/90 pt-1 border-t border-teal-700/50 w-full justify-center">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-300" />
              <span><strong>{todayCount}</strong> hoy</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-teal-500"></div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Racha <strong>{streakDays}d</strong></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
