// App.tsx
import React, { useState } from 'react';
import { Calendar, Layers, Activity, ChevronRight, Database, LayoutGrid, AlertCircle, ExternalLink, Share2, Check } from 'lucide-react';
import GanttChart from './components/GanttChart';
import InsightsPanel from './components/InsightsPanel';
import { Task, Holiday, AnalysisResult } from './types';
import { TASKS, HOLIDAYS, processCSVData } from './constants';
import { analyzeGanttInterferences } from './services/geminiService';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [holidays, setHolidays] = useState<Holiday[]>(HOLIDAYS);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'gantt' | 'list'>('gantt');
  const [lastSync, setLastSync] = useState('09:00 AM');
  const [driveUrl, setDriveUrl] = useState('https://docs.google.com/spreadsheets/d/11w3ORvCyxh2m1r-swQh1qozAmM6G4lpBl2GK1XoY_rU/edit');
  const [showShareToast, setShowShareToast] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeGanttInterferences(tasks, holidays);
      setAnalysis(result);
    } catch (error: any) {
      console.error("Analysis failed", error);
      alert(error.message || "Error al analizar los datos");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSyncFromUrl = (content: string) => {
    const { tasks: newTasks, holidays: newHolidays } = processCSVData(content);
    setTasks(newTasks);
    setHolidays(newHolidays);
    const now = new Date();
    setLastSync(now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: true }));
    setAnalysis(null);
  };

  const centers = Array.from(new Set(tasks.map(t => t.center))).sort();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] overflow-hidden text-slate-900 font-inter">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm flex-none">
        <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
              <LayoutGrid className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">Gantt Master Pro</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Estatus: Sistema Operativo</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-lg shadow-blue-100"
            >
              <Share2 className="w-3.5 h-3.5" />
              Compartir Web
            </button>
            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-md flex items-center justify-center font-black text-blue-600 text-xs">
              AD
            </div>
          </div>
        </div>
      </header>

      {showShareToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-widest">Enlace copiado al portapapeles</span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-[1800px] mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">Navegación</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setActiveTab('gantt')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'gantt' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                <div className="flex items-center gap-4">
                  <Calendar className="w-5 h-5" />
                  <span className="font-black text-sm uppercase tracking-wide">Diagrama Gantt</span>
                </div>
                {activeTab === 'gantt' && <ChevronRight className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setActiveTab('list')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'list' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                <div className="flex items-center gap-4">
                  <Layers className="w-5 h-5" />
                  <span className="font-black text-sm uppercase tracking-wide">Datos en Bruto</span>
                </div>
                {activeTab === 'list' && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Centros ({centers.length})</h2>
                <Database className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto gantt-scroll pr-2">
                {centers.map(center => (
                  <div key={center} className="flex items-center justify-between text-[11px] p-3 bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-200 rounded-xl transition-all cursor-default group">
                    <span className="text-slate-700 font-bold truncate pr-3 group-hover:text-blue-600">{center}</span>
                    <span className="bg-white px-2 py-0.5 rounded-lg text-blue-600 font-black shadow-sm border border-slate-200">
                      {tasks.filter(t => t.center === center).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <InsightsPanel analysis={analysis} isLoading={isAnalyzing} onRefresh={runAnalysis} />
        </div>

        <div className="lg:col-span-9 flex flex-col min-w-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Partidas Totales</p>
                <p className="text-3xl font-black text-slate-900 leading-none">{tasks.length}</p>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Feriados Críticos</p>
                <p className="text-3xl font-black text-red-600 leading-none">{holidays.filter(h => !h.description.includes('CLA')).length}</p>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Hitos Maestros</p>
                <p className="text-3xl font-black text-amber-500 leading-none">{holidays.filter(h => h.description.includes('CLA')).length}</p>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Centros Activos</p>
                <p className="text-3xl font-black text-blue-600 leading-none">{centers.length}</p>
             </div>
          </div>
          <div className="flex-1 w-full relative">
            {activeTab === 'gantt' ? (
              <GanttChart 
                tasks={tasks} 
                holidays={holidays} 
                onSyncFromUrl={handleSyncFromUrl} 
                lastSync={lastSync}
                currentUrl={driveUrl}
              />
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[750px]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                  <h3 className="font-black text-slate-900 text-lg">Dataset Maestro (Google Sheets)</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black border border-blue-100">
                    <Activity className="w-3 h-3" /> VISTA DE TABLA
                  </div>
                </div>
                <div className="overflow-auto gantt-scroll">
                  <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                    <thead className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Partida / Obra</th>
                        <th className="px-6 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Centro de Costo</th>
                        <th className="px-6 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Inicio</th>
                        <th className="px-6 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Fin Estimado</th>
                        <th className="px-6 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Duración</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tasks.sort((a,b) => a.center.localeCompare(b.center)).map(task => (
                        <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 font-bold text-slate-800">{task.name}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase border border-slate-200 group-hover:bg-white group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
                              {task.center}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-500">{task.start.toLocaleDateString('es-CL')}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-500">{task.end.toLocaleDateString('es-CL')}</td>
                          <td className="px-6 py-4 text-right font-black text-slate-400">
                             {Math.ceil((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24))}d
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="bg-white border-t border-slate-200 px-8 py-4 flex-none">
        <div className="max-w-[1800px] mx-auto flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span>© 2026 Sistema de Gestión Estratégica</span>
            <span className="text-slate-200">|</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Motor de IA Gemini 3.0 Conectado</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span>Latency: 9ms</span>
            <span className="text-blue-600">v6.2.0-PRO</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
