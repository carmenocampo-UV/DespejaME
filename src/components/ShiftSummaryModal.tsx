import React from 'react';
import { 
  X, 
  BarChart3, 
  Clock, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  HeartHandshake, 
  BookOpen, 
  Users, 
  User 
} from 'lucide-react';
import { UserStats } from '../types';
import { CLINICAL_ERGONOMIC_TIPS, CATEGORIES } from '../data/exercises';

interface ShiftSummaryModalProps {
  stats: UserStats;
  isOpen: boolean;
  onClose: () => void;
  onStartPause: () => void;
}

export const ShiftSummaryModal: React.FC<ShiftSummaryModalProps> = ({
  stats,
  isOpen,
  onClose,
  onStartPause,
}) => {
  if (!isOpen) return null;

  // Compute breakdown by category
  const categoryCounts: Record<string, number> = {};
  stats.completedSessions.forEach((s) => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  });

  return (
    <div 
      id="shift-summary-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div 
        id="shift-summary-card"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto text-left"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 font-heading">
                Tu Autocuidado en Turno
              </h3>
              <p className="text-xs text-slate-500">
                Resumen de recuperación y pausas de 60s
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="text-2xl font-black text-blue-900 block font-heading">
                {stats.todaySessionsCount}
              </span>
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block mt-0.5">
                Pausas Hoy
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100">
              <span className="text-2xl font-black text-sky-900 block font-heading">
                {stats.todaySessionsCount} min
              </span>
              <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider block mt-0.5">
                Recuperados
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-2xl font-black text-amber-900 block font-heading flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-amber-500" />
                {stats.currentStreakDays}
              </span>
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block mt-0.5">
                Días Racha
              </span>
            </div>
          </div>

          {/* Category Distribution */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Variedad de Pausas Realizadas
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const count = categoryCounts[cat.id] || 0;
                return (
                  <div
                    key={cat.id}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                  >
                    <span className="text-xs font-medium text-slate-700 truncate">
                      {cat.name}
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent sessions log */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Últimas Pausas del Turno</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {stats.completedSessions.length} registradas
              </span>
            </h4>

            {stats.completedSessions.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {stats.completedSessions.slice(0, 6).map((session) => (
                  <div
                    key={session.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 block">
                          {session.exerciseTitle}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {session.participantMode === 'duo' ? ' • Con colega' : ' • En solitario'}
                        </span>
                      </div>
                    </div>

                    {session.moodAfter && (
                      <span className="text-xs" title="Estado de ánimo reportado">
                        {session.moodAfter === 1 ? '😌 Aliviado' : session.moodAfter === 2 ? '🧘 En calma' : session.moodAfter === 3 ? '⚡ Con energía' : '🎯 Enfocado'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Aún no has completado pausas en este turno. ¡Empieza tu primer minuto de autocuidado!
              </div>
            )}
          </div>

          {/* Clinical Ergonomic Tips */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Píldoras Ergonómicas Hospitalarias</span>
            </h4>

            <div className="space-y-2.5">
              {CLINICAL_ERGONOMIC_TIPS.map((tip, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block mb-0.5">
                    {tip.title}
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {tip.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Cuidarte a ti es cuidar a tus pacientes
          </span>

          <button
            onClick={() => {
              onClose();
              onStartPause();
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Hacer Pausa de 60s Ahora
          </button>
        </div>
      </div>
    </div>
  );
};
