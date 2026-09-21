import React from 'react';
import { Bell, BellOff, Volume2, VolumeX, ShieldAlert, Sparkles, BarChart3, Activity } from 'lucide-react';
import { ShiftConfig } from '../types';

interface HeaderProps {
  shiftConfig: ShiftConfig;
  todayCount: number;
  onOpenNotifications: () => void;
  onOpenStats: () => void;
  onToggleSound: () => void;
  onToggleEmergencyMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  shiftConfig,
  todayCount,
  onOpenNotifications,
  onOpenStats,
  onToggleSound,
  onToggleEmergencyMute,
}) => {
  const isEmergencyMuted = !!(shiftConfig.emergencyMuteUntil && Date.now() < shiftConfig.emergencyMuteUntil);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900 font-heading">
                Despeja<span className="text-teal-600">ME</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                60s Salud
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Pausas activas hospitalarias
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Emergency Mute Quick Button */}
          <button
            id="header-emergency-mute-btn"
            onClick={onToggleEmergencyMute}
            title={isEmergencyMuted ? "Modo Emergencia Activo (Alertas silenciadas). Toca para reanudar." : "Activar Modo Emergencia / Código Azul (Silenciar alertas)"}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              isEmergencyMuted
                ? 'bg-rose-100 text-rose-800 border border-rose-300 ring-2 ring-rose-400/20 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
            }`}
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${isEmergencyMuted ? 'text-rose-600' : 'text-slate-500'}`} />
            <span className="hidden md:inline">
              {isEmergencyMuted ? 'Emergencia Activa' : 'Código Azul'}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            id="header-sound-toggle-btn"
            onClick={onToggleSound}
            title={shiftConfig.soundEnabled ? 'Sonidos suaves activados' : 'Sonidos silenciados'}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            aria-label="Alternar sonido"
          >
            {shiftConfig.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-teal-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Notifications config */}
          <button
            id="header-notifications-btn"
            onClick={onOpenNotifications}
            title="Configurar recordatorios de turno"
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            aria-label="Configurar notificaciones"
          >
            {shiftConfig.enabled && !isEmergencyMuted ? (
              <>
                <Bell className="w-4 h-4 text-teal-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white"></span>
              </>
            ) : (
              <BellOff className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Shift Stats / Progress */}
          <button
            id="header-stats-btn"
            onClick={onOpenStats}
            title="Ver progreso de pausas en tu turno"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200/80 text-teal-900 text-xs font-semibold hover:bg-teal-100 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
            <span>{todayCount}</span>
            <span className="hidden sm:inline text-teal-700 font-normal">pausas</span>
          </button>
        </div>
      </div>

      {/* Emergency Mute Banner Notice if active */}
      {isEmergencyMuted && (
        <div className="bg-rose-50 border-t border-rose-200 py-1 px-4 text-center text-xs text-rose-800 flex items-center justify-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Alertas silenciadas temporalmente por emergencia clínica.</span>
          <button 
            onClick={onToggleEmergencyMute}
            className="underline font-semibold hover:text-rose-950 ml-1"
          >
            Reanudar ahora
          </button>
        </div>
      )}
    </header>
  );
};
