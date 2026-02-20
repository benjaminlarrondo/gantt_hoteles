
import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { ChevronDown, ChevronRight, RefreshCw, Database, ExternalLink, Settings, X, Check, Info } from 'lucide-react';
import { Task, Holiday, CenterGroup } from '../types';

interface GanttChartProps {
  tasks: Task[];
  holidays: Holiday[];
  onSyncFromUrl?: (content: string) => void;
  lastSync?: string;
  currentUrl?: string;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, holidays, onSyncFromUrl, lastSync, currentUrl }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [expandedCenters, setExpandedCenters] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [urlInput, setUrlInput] = useState(currentUrl || '');
  const [syncError, setSyncError] = useState<string | null>(null);

  const centerColors = useMemo(() => {
    const centers = Array.from(new Set(tasks.map(t => t.center))).sort();
    const colorScale = d3.scaleOrdinal<string, string>(d3.schemeTableau10).domain(centers);
    const map: Record<string, string> = {};
    centers.forEach((c: string) => { map[c] = colorScale(c); });
    return map;
  }, [tasks]);

  useEffect(() => {
    const centers = new Set(tasks.map(t => t.center));
    setExpandedCenters(centers);
  }, [tasks]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) { setContainerWidth(entry.contentRect.width); }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleCenter = (center: string) => {
    const next = new Set(expandedCenters);
    if (next.has(center)) next.delete(center);
    else next.add(center);
    setExpandedCenters(next);
  };

  const handleSync = async () => {
    if (!urlInput.includes('docs.google.com/spreadsheets')) {
      setSyncError('URL de Google Sheets inválida.');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const match = urlInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) throw new Error('ID de documento no encontrado.');
      
      const sheetId = match[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(csvUrl)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Error al conectar con Google Drive.');
      
      const data = await response.json();
      if (!data.contents) throw new Error('No se pudo acceder. Revisa los permisos de compartir en el Sheet.');

      if (onSyncFromUrl) onSyncFromUrl(data.contents);
      setShowSettings(false);
    } catch (err: any) {
      setSyncError(err.message || 'Error de sincronización');
    } finally {
      setIsSyncing(false);
    }
  };

  const groupedData = useMemo(() => {
    const centersMap = new Map<string, Task[]>();
    tasks.forEach(t => {
      const list = centersMap.get(t.center) || [];
      list.push(t);
      centersMap.set(t.center, list);
    });

    const groups: CenterGroup[] = [];
    centersMap.forEach((tasksInCenter, centerName) => {
      const minStart = d3.min(tasksInCenter, t => t.start)!;
      const maxEnd = d3.max(tasksInCenter, t => t.end)!;
      const duration = Math.ceil((maxEnd.getTime() - minStart.getTime()) / (1000 * 60 * 60 * 24));
      groups.push({ 
        name: centerName, 
        tasks: tasksInCenter.sort((a, b) => a.start.getTime() - b.start.getTime()), 
        start: minStart, 
        end: maxEnd, 
        durationDays: duration 
      });
    });
    return groups.sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  const visibleRows = useMemo(() => {
    const rows: any[] = [];
    groupedData.forEach(group => {
      rows.push({ type: 'parent', ...group });
      if (expandedCenters.has(group.name)) {
        group.tasks.forEach(task => { rows.push({ type: 'child', ...task }); });
      }
    });
    return rows;
  }, [groupedData, expandedCenters]);

  useEffect(() => {
    if (!svgRef.current || visibleRows.length === 0 || containerWidth === 0) return;

    const timeSlotWidth = Math.max(containerWidth - 20, 2000); 
    const margin = { top: 70, right: 30, bottom: 20, left: 10 };
    const rowHeight = 36;
    const height = visibleRows.length * rowHeight + margin.top + margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", timeSlotWidth).attr("height", height);

    const minDate = d3.min(visibleRows, d => d.start)!;
    const maxDate = d3.max(visibleRows, d => d.end)!;
    const xMin = d3.timeMonth.offset(d3.timeMonth.floor(minDate), -1);
    const xMax = d3.timeMonth.offset(d3.timeMonth.ceil(maxDate), 1);

    const x = d3.scaleTime().domain([xMin, xMax]).range([margin.left, timeSlotWidth - margin.right]);
    const y = d3.scaleBand().domain(visibleRows.map((d, i) => i.toString())).range([margin.top, height - margin.bottom]).padding(0.3);

    const tooltip = d3.select("body").selectAll(".gantt-tooltip").data([0]).join("div")
      .attr("class", "gantt-tooltip")
      .style("position", "absolute").style("visibility", "hidden").style("background", "#1e293b").style("color", "white").style("padding", "8px 12px").style("border-radius", "8px").style("font-size", "11px").style("z-index", "1000").style("pointer-events", "none").style("box-shadow", "0 10px 15px -3px rgb(0 0 0 / 0.1)");

    const xAxis = d3.axisTop(x).ticks(d3.timeMonth.every(1)).tickFormat((d: any) => d3.timeFormat("%b %Y")(new Date(d)).toUpperCase());
    svg.append("g").attr("transform", `translate(0, ${margin.top - 20})`).call(xAxis).attr("font-weight", "black").attr("font-size", "9px").attr("color", "#64748b").call(g => g.select(".domain").remove());

    const holidayGroup = svg.append("g");
    holidays.forEach(h => {
      const hX = x(h.date);
      const isCLA = h.description.toUpperCase().includes("DIRECTORIO CLA");
      const color = isCLA ? "#f59e0b" : "#f43f5e";
      
      if (h.endDate && h.endDate > h.date) {
        const xStart = x(h.date);
        const xEnd = x(h.endDate);
        holidayGroup.append("rect")
          .attr("x", xStart).attr("y", margin.top - 15).attr("width", xEnd - xStart).attr("height", 8).attr("rx", 4).attr("fill", color).attr("opacity", 0.9).attr("cursor", "help")
          .on("mouseover", (event) => tooltip.style("visibility", "visible").html(`<strong>${h.description}</strong><br/>${h.date.toLocaleDateString()} al ${h.endDate?.toLocaleDateString()}`))
          .on("mousemove", (event) => tooltip.style("top", (event.pageY - 40) + "px").style("left", (event.pageX + 15) + "px"))
          .on("mouseout", () => tooltip.style("visibility", "hidden"));
      } else {
        holidayGroup.append("circle")
          .attr("cx", hX).attr("cy", margin.top - 11).attr("r", 5).attr("fill", color).attr("cursor", "help")
          .on("mouseover", (event) => tooltip.style("visibility", "visible").text(h.description))
          .on("mousemove", (event) => tooltip.style("top", (event.pageY - 40) + "px").style("left", (event.pageX + 15) + "px"))
          .on("mouseout", () => tooltip.style("visibility", "hidden"));
      }

      holidayGroup.append("line")
        .attr("x1", hX).attr("y1", margin.top).attr("x2", hX).attr("y2", height - margin.bottom)
        .attr("stroke", color).attr("stroke-width", isCLA ? 2 : 1).attr("stroke-dasharray", isCLA ? "5,3" : "3,3").attr("opacity", isCLA ? 0.5 : 0.15);
    });

    visibleRows.forEach((d, i) => {
      const isParent = d.type === 'parent';
      const rowY = y(i.toString())!;
      const barColor = centerColors[d.center || d.name];
      const rectX = x(d.start);
      const rectWidth = Math.max(5, x(d.end) - x(d.start));

      svg.append("rect")
        .attr("x", rectX).attr("y", rowY + (isParent ? 6 : 4))
        .attr("width", rectWidth).attr("height", isParent ? y.bandwidth() - 12 : y.bandwidth() - 8)
        .attr("rx", isParent ? 2 : 4).attr("fill", barColor).attr("opacity", isParent ? 0.2 : 1).attr("stroke", isParent ? barColor : "none").attr("stroke-width", isParent ? 2 : 0).attr("cursor", "pointer")
        .on("mouseover", (event) => {
           tooltip.style("visibility", "visible").html(`<strong>${d.name}</strong><br/>${d.start.toLocaleDateString()} - ${d.end.toLocaleDateString()}`);
        })
        .on("mousemove", (event) => tooltip.style("top", (event.pageY - 50) + "px").style("left", (event.pageX + 15) + "px"))
        .on("mouseout", () => tooltip.style("visibility", "hidden"));
    });
  }, [visibleRows, holidays, containerWidth, centerColors]);

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col w-full relative">
      {showSettings && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-blue-600" />
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">Origen de Datos</h4>
              </div>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                <Info className="w-5 h-5 text-amber-600 flex-none" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-amber-900 uppercase">Ajuste de Permisos</p>
                  <p className="text-[10px] text-amber-700 leading-tight">En Google Sheets: <b>Compartir</b> → Acceso General → <b>"Cualquier persona con el enlace puede leer"</b>.</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enlace del Spreadsheet</label>
                <input 
                  type="text" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              {syncError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-4">
                  <X className="w-4 h-4 text-red-600 flex-none" />
                  <p className="text-[11px] font-bold text-red-700 leading-tight">{syncError}</p>
                </div>
              )}
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase py-4 rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSyncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {isSyncing ? 'Conectando...' : 'Actualizar Plan Maestro'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between bg-white z-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Planificación de Obras</h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-black border border-emerald-100">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                DRIVE ACTIVO
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sinc: {lastSync}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden lg:flex items-center gap-6 px-6 py-2 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
               <span className="text-[10px] font-black text-slate-500 uppercase">Feriados</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-8 h-2 bg-amber-500 rounded-full shadow-sm"></div>
               <span className="text-[10px] font-black text-amber-600 uppercase">Directorio CLA</span>
             </div>
           </div>
           <div className="flex items-center gap-3">
             <button onClick={() => setShowSettings(true)} className="flex items-center gap-3 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all border border-slate-800"><Settings className="w-4 h-4" /> Configurar Drive</button>
           </div>
        </div>
      </div>
      <div className="flex flex-1 relative bg-white overflow-hidden h-[calc(100vh-280px)]">
        <div className="flex-none w-[320px] bg-slate-50/50 border-r border-slate-200 z-20 sticky left-0 shadow-[4px_0_20px_rgba(0,0,0,0.03)] overflow-y-auto gantt-scroll">
           <div className="h-[48px] border-b border-slate-200 flex items-center px-6 bg-slate-50 sticky top-0 z-30"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estructura Obras</span></div>
           <div className="flex flex-col">
              {visibleRows.map((d, i) => {
                const isParent = d.type === 'parent';
                const accentColor = centerColors[d.center || d.name];
                return (
                  <div key={i} className={`h-[36px] flex items-center justify-between px-6 border-b border-slate-100/60 relative group ${isParent ? 'bg-white/80 cursor-pointer hover:bg-slate-100/50' : 'bg-white'}`} onClick={() => isParent && toggleCenter(d.name)}>
                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: accentColor }}></div>
                    <div className="flex items-center gap-3 truncate">
                      {isParent && (expandedCenters.has(d.name) ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />)}
                      <span className={`truncate ${isParent ? 'font-black text-slate-800 text-xs uppercase' : 'text-slate-500 text-[11px] font-semibold pl-8'}`}>{d.name}</span>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
        <div ref={containerRef} className="flex-1 overflow-x-auto gantt-scroll relative bg-white"><svg ref={svgRef} className="block"></svg></div>
      </div>
    </div>
  );
};

export default GanttChart;
