import React, { useState } from 'react';
import { 
  Wind, 
  Activity, 
  Smile, 
  Eye, 
  Users, 
  User, 
  Search, 
  Clock, 
  Play, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { Exercise, CategoryId } from '../types';
import { CATEGORIES } from '../data/exercises';

interface ExerciseSelectorProps {
  exercises: Exercise[];
  participantMode: 'solo' | 'duo';
  onSelectExercise: (exercise: Exercise) => void;
  onSetParticipantMode: (mode: 'solo' | 'duo') => void;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  exercises,
  participantMode,
  onSelectExercise,
  onSetParticipantMode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [spaceFilter, setSpaceFilter] = useState<'all' | 'cero_espacio' | 'sentado' | 'de_pie'>('all');

  // Filter exercises
  const filtered = exercises.filter((ex) => {
    // Category match
    if (selectedCategory !== 'all' && ex.category !== selectedCategory) {
      return false;
    }

    // Participant mode filter
    if (participantMode === 'solo' && ex.participantMode === 'duo' && selectedCategory !== 'equipo') {
      // Keep available if they specifically clicked team category
      return false;
    }

    // Space filter
    if (spaceFilter !== 'all' && ex.space !== spaceFilter) {
      return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ex.title.toLowerCase().includes(q);
      const matchTag = ex.tagline.toLowerCase().includes(q);
      const matchBenefit = ex.clinicalBenefit.toLowerCase().includes(q);
      const matchRole = ex.targetRole.toLowerCase().includes(q);
      if (!matchTitle && !matchTag && !matchBenefit && !matchRole) {
        return false;
      }
    }

    return true;
  });

  const getCategoryIcon = (id: CategoryId) => {
    switch (id) {
      case 'respiracion': return <Wind className="w-4 h-4" />;
      case 'estiramiento': return <Activity className="w-4 h-4" />;
      case 'relajacion': return <Smile className="w-4 h-4" />;
      case 'descanso_visual': return <Eye className="w-4 h-4" />;
      case 'equipo': return <Users className="w-4 h-4" />;
    }
  };

  return (
    <section className="mt-8 space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
            Catálogo de Pausas de 60s
          </h2>
          <p className="text-xs text-slate-500">
            Variedad médica para no caer en la monotonía y adaptarse a tu necesidad del momento
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="exercise-search-input"
            type="text"
            placeholder="Buscar por zona (cuello, ojos, lumbares)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          id="category-tab-all"
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Todos ({exercises.length})</span>
        </button>

        {CATEGORIES.map((cat) => {
          const count = exercises.filter((e) => e.category === cat.id).length;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              id={`category-tab-${cat.id}`}
              onClick={() => {
                setSelectedCategory(cat.id);
                if (cat.id === 'equipo') {
                  onSetParticipantMode('duo');
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary filter chips: Space */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-600">Espacio:</span>
          {[
            { id: 'all', label: 'Cualquier espacio' },
            { id: 'cero_espacio', label: 'Cero espacio (en el sitio)' },
            { id: 'sentado', label: 'Sentado(a)' },
            { id: 'de_pie', label: 'De pie' },
          ].map((sp) => (
            <button
              key={sp.id}
              onClick={() => setSpaceFilter(sp.id as typeof spaceFilter)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                spaceFilter === sp.id
                  ? 'bg-teal-100 text-teal-800 font-semibold border border-teal-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>

        <span className="hidden sm:inline text-slate-400">
          Mostrando {filtered.length} ejercicio{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Grid of Exercises */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((exercise) => {
            const catMeta = CATEGORIES.find((c) => c.id === exercise.category);

            return (
              <div
                key={exercise.id}
                id={`exercise-card-${exercise.id}`}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300 p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${catMeta?.bgColor} ${catMeta?.textColor} border ${catMeta?.borderColor}`}>
                      {catMeta?.name}
                    </span>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="flex items-center gap-0.5 font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3" />
                        60s
                      </span>
                      {exercise.participantMode === 'duo' ? (
                        <span className="flex items-center gap-0.5 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-medium">
                          <Users className="w-3 h-3" /> Pareja
                        </span>
                      ) : exercise.participantMode === 'solo' ? (
                        <span className="flex items-center gap-0.5 text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          <User className="w-3 h-3" /> Solo
                        </span>
                      ) : (
                        <span className="text-slate-400">Solo o Dúo</span>
                      )}
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                    {exercise.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {exercise.tagline}
                  </p>

                  {/* Clinical Benefit Pill */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider mb-0.5">
                      Beneficio clínico:
                    </span>
                    <p className="line-clamp-2 text-slate-600 text-[11px] leading-relaxed">
                      {exercise.clinicalBenefit}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {exercise.space === 'cero_espacio'
                      ? 'Cero espacio'
                      : exercise.space === 'sentado'
                      ? 'Sentado(a)'
                      : 'De pie'}
                  </span>

                  <button
                    id={`btn-start-${exercise.id}`}
                    onClick={() => onSelectExercise(exercise)}
                    className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 group-hover:bg-teal-600 group-hover:text-white"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Realizar 60s</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm font-semibold text-slate-700">No encontramos pausas con ese filtro.</p>
          <p className="text-xs text-slate-500 mt-1">Prueba seleccionando otra categoría o borrando la búsqueda.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setSpaceFilter('all');
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors"
          >
            Ver todos los ejercicios
          </button>
        </div>
      )}
    </section>
  );
};
