import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Clock, 
  Volume2, 
  Smartphone, 
  ShieldAlert, 
  CheckCircle, 
  AlertCircle,
  Play
} from 'lucide-react';
import { ShiftConfig } from '../types';
import { 
  requestNotificationPermission, 
  getNotificationPermissionStatus,
  triggerActivePauseNotification 
} from '../utils/notifications';

interface NotificationSettingsModalProps {
  config: ShiftConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: ShiftConfig) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
}) => {
  const [localConfig, setLocalConfig] = useState<ShiftConfig>(config);
  const [permissionStatus, setPermissionStatus] = useState(getNotificationPermissionStatus());
  const [testTriggered, setTestTriggered] = useState(false);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(getNotificationPermissionStatus());
    if (granted) {
      setLocalConfig((prev) => ({ ...prev, enabled: true }));
    }
  };

  const handleToggleEmergencyMute = (durationMinutes: number) => {
    const muteUntil = localConfig.emergencyMuteUntil && Date.now() < localConfig.emergencyMuteUntil
      ? null
      : Date.now() + durationMinutes * 60 * 1000;

    setLocalConfig((prev) => ({ ...prev, emergencyMuteUntil: muteUntil }));
  };

  const handleTestNotification = () => {
    setTestTriggered(true);
    triggerActivePauseNotification({
      title: '🩺 DespejaME: ¡Prueba de Pausa Activa!',
      body: 'Así sonará y se verá tu recordatorio de 60 segundos durante el turno.',
      force: true,
    });
    setTimeout(() => setTestTriggered(false), 2500);
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const isEmergencyActive = !!(localConfig.emergencyMuteUntil && Date.now() < localConfig.emergencyMuteUntil);

  return (
    <div 
      id="notification-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div 
        id="notification-modal-card"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 font-heading">
                Notificaciones de Turno
              </h3>
              <p className="text-xs text-slate-500">
                Ajustadas a tu horario clínico y flujo de trabajo
              </p>
            </div>
          </div>

          <button
            id="notif-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-left max-h-[75vh] overflow-y-auto">
          {/* Permission Status Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              {permissionStatus === 'granted' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Permiso de Notificaciones del Navegador
                </span>
                <p className="text-xs text-slate-500">
                  {permissionStatus === 'granted'
                    ? 'Activadas. Recibirás alertas incluso si estás en otra pestaña o pantalla.'
                    : 'Necesario para avisarte durante tu turno de trabajo.'}
                </p>
              </div>
            </div>

            {permissionStatus !== 'granted' && (
              <button
                id="btn-request-notif-permission"
                onClick={handleRequestPermission}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs whitespace-nowrap shadow-sm"
              >
                Habilitar Alertas
              </button>
            )}
          </div>

          {/* Master Enable Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100">
            <div>
              <span className="text-sm font-bold text-blue-950 block">
                Recordatorios Periódicos de Pausa Activa
              </span>
              <span className="text-xs text-blue-800">
                Te enviará un aviso cada intervalo seleccionado durante el turno
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="notif-master-toggle"
                type="checkbox"
                checked={localConfig.enabled}
                onChange={(e) => setLocalConfig({ ...localConfig, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Shift Type Presets */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Tipo de Turno Clínico
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'manana', label: 'Turno Mañana', hours: '07:00 - 15:00' },
                { id: 'tarde', label: 'Turno Tarde', hours: '13:00 - 21:00' },
                { id: 'noche', label: 'Guardia Nocturna', hours: '19:00 - 07:00' },
                { id: 'guardia_24', label: 'Turno 24 Horas', hours: 'Guardia continua' },
                { id: 'personalizado', label: 'Horario Libre', hours: 'A tu propio ritmo' },
              ].map((shift) => (
                <button
                  key={shift.id}
                  onClick={() => setLocalConfig({ ...localConfig, shiftType: shift.id as typeof localConfig.shiftType })}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    localConfig.shiftType === shift.id
                      ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <span className="text-xs font-bold block">{shift.label}</span>
                  <span className={`text-[10px] block mt-0.5 ${localConfig.shiftType === shift.id ? 'text-blue-100' : 'text-slate-500'}`}>
                    {shift.hours}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interval frequency */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Frecuencia de Pausa Activa
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { min: 30, label: '30 min' },
                { min: 45, label: '45 min' },
                { min: 60, label: '60 min', rec: true },
                { min: 90, label: '90 min' },
                { min: 120, label: '120 min' },
              ].map((item) => (
                <button
                  key={item.min}
                  onClick={() => setLocalConfig({ ...localConfig, intervalMinutes: item.min })}
                  className={`py-2 px-1 rounded-xl text-center border transition-all ${
                    localConfig.intervalMinutes === item.min
                      ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs block">{item.label}</span>
                  {item.rec && (
                    <span className="text-[9px] text-blue-500 block font-normal">Sugerido</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              💡 La Sociedad de Medicina del Trabajo recomienda una pausa de 60 segundos cada 60 a 90 minutos para reducir la sobrecarga osteomuscular.
            </p>
          </div>

          {/* Sound & Vibration Options */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Campana suave</span>
                  <span className="text-[10px] text-slate-500">Sonido de cuenco</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.soundEnabled}
                onChange={(e) => setLocalConfig({ ...localConfig, soundEnabled: e.target.checked })}
                className="accent-blue-600 w-4 h-4 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Vibración</span>
                  <span className="text-[10px] text-slate-500">Pulso háptico</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.vibrationEnabled}
                onChange={(e) => setLocalConfig({ ...localConfig, vibrationEnabled: e.target.checked })}
                className="accent-blue-600 w-4 h-4 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Emergency Mute / Código Azul feature */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <div className="flex items-start gap-2.5 mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-900">
                  Modo Código Azul / Emergencia Clínica
                </h4>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Silencia todas las alertas y notificaciones temporalmente si surge una urgencia médica sin alterar tu configuración habitual.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button
                id="notif-emergency-mute-30m"
                onClick={() => handleToggleEmergencyMute(30)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors ${
                  isEmergencyActive
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-rose-800 border border-rose-300 hover:bg-rose-100'
                }`}
              >
                {isEmergencyActive ? '✓ Emergencia Activa (Pausar silencio)' : 'Silenciar 30 minutos'}
              </button>

              <button
                id="notif-emergency-mute-60m"
                onClick={() => handleToggleEmergencyMute(60)}
                className="py-1.5 px-3 rounded-xl text-xs font-medium text-rose-800 bg-white border border-rose-200 hover:bg-rose-100"
              >
                60 min
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            id="notif-test-btn"
            onClick={handleTestNotification}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current text-blue-600" />
            <span>{testTriggered ? '¡Alerta enviada!' : 'Probar Notificación'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="notif-save-btn"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-colors"
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
