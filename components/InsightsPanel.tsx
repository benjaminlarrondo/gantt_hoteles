
import React from 'react';
import { AnalysisResult } from '../types';
import { Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';

interface InsightsPanelProps {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  onRefresh: () => void;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ analysis, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="h-12 bg-slate-100 rounded mb-2"></div>
        <div className="h-12 bg-slate-100 rounded mb-2"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
        <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2" />
        <h3 className="font-semibold text-slate-700">Analizador de Interferencias</h3>
        <p className="text-sm text-slate-500 mb-4">Usa la IA para detectar conflictos con feriados y optimizar tiempos.</p>
        <button 
          onClick={onRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Generar Análisis
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-slate-800">Interferencias Detectadas</h3>
          </div>
          <button onClick={onRefresh} className="text-xs text-blue-600 hover:underline">Recalcular</button>
        </div>
        <ul className="space-y-2">
          {analysis.interferences.map((inf, i) => (
            <li key={i} className="text-sm text-slate-600 flex gap-2">
              <span className="text-red-400 font-bold">•</span> {inf}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-indigo-900">Sugerencias de Optimización</h3>
        </div>
        <ul className="space-y-2">
          {analysis.suggestions.map((sug, i) => (
            <li key={i} className="text-sm text-indigo-800 flex gap-2">
              <span className="text-indigo-400 font-bold">✓</span> {sug}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl text-white shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Impacto en Ruta Crítica</h3>
        <p className="text-sm leading-relaxed">{analysis.impactSummary}</p>
      </div>
    </div>
  );
};

export default InsightsPanel;
