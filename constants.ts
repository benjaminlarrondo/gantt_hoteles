
import { Task, Holiday } from './types';

// Función auxiliar para parsear fechas del formato D/M/YYYY
export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr || dateStr === '-' || dateStr.trim() === '' || dateStr.toLowerCase().includes('fin')) return null;
  // Limpiar posibles espacios o comentarios en la celda
  const cleanStr = dateStr.split(' ')[0].trim();
  const parts = cleanStr.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  return new Date(year, month - 1, day);
};

export const REAL_DATA_CSV = `CCVV,CENTRO,PARTIDA,INICIO OBRAS,FIN OBRAS ,DIAS ,
PALOMAR,PALOMAR,HOTELES,1/05/2026,13/08/2026,104,
WIFI,PALOMAR,CERRADURAS,6/04/2026,8/04/2026,2,
CERRADURAS,PALOMAR,WIFI,1/06/2026,7/06/2026,6,
Entrega de Terreno,PALOMAR,OOCC,1/05/2026,1/05/2026,0,
Entrega Mobiliario,PALOMAR,OOCC,30/03/2026,14/05/2026,45,
Retiro Activos Bloque 1,PALOMAR,OOCC,29/04/2026,30/04/2026,1,
Bloque 1 Habitaciones,PALOMAR,OOCC,1/05/2026,21/05/2026,20,
Habilitación Muebles Bloque 1,PALOMAR,OOCC,21/05/2026,23/05/2026,2,
Retiro Activos Bloque 2,PALOMAR,OOCC,19/05/2026,20/05/2026,1,
Bloque 2 Habitaciones,PALOMAR,OOCC,21/05/2026,10/06/2026,20,
Habilitación Muebles Bloque 2,PALOMAR,OOCC,10/06/2026,12/06/2026,2,
Retiro Activos Bloque 3,PALOMAR,OOCC,8/06/2026,9/06/2026,1,
Bloque 3 Habitaciones,PALOMAR,OOCC,10/06/2026,30/06/2026,20,
Habilitación Muebles Bloque 3,PALOMAR,OOCC,30/06/2026,2/07/2026,2,
Retiro Bloque 4 Habitaciones,PALOMAR,OOCC,28/06/2026,29/06/2026,1,
Bloque 4 Habitaciones,PALOMAR,OOCC,30/06/2026,20/07/2026,20,
Habilitación Muebles Bloque 4,PALOMAR,OOCC,20/07/2026,22/07/2026,2,
Retiro Bloque 5 Habitaciones,PALOMAR,OOCC,18/07/2026,19/07/2026,1,
Bloque 5 Habitaciones,PALOMAR,OOCC,20/07/2026,4/08/2026,15,
Habiliyación Muebles Bloque 5,PALOMAR,OOCC,4/08/2026,6/08/2026,2,
Entrega Activos ,PALOMAR,OOCC,20/07/2026,22/07/2026,2,
Áreas Comunes,PALOMAR,OOCC,1/05/2026,24/08/2026,115,
LA SERENA,LA SERENA,HOTELES,1/05/2026,31/07/2026,92,
WIFI,LA SERENA,WIFI,12/05/2026,18/05/2026,6,
CERRADURAS,LA SERENA,CERRADURAS,1/04/2026,4/04/2026,3,
Entrega de Terreno,LA SERENA,OOCC,1/05/2026,1/05/2026,0,
Entrega Mobiliario,LA SERENA,OOCC,30/03/2026,14/05/2026,45,
Retiro Activos Bloque 1,LA SERENA,OOCC,29/04/2026,30/04/2026,1,
Bloque 1 Habitaciones,LA SERENA,OOCC,1/05/2026,11/05/2026,10,
Habilitación Muebles Bloque 1,LA SERENA,OOCC,11/05/2026,13/05/2026,2,
Retiro Activos Bloque 2,LA SERENA,OOCC,9/05/2026,10/05/2026,1,
Bloque 2 Habitaciones,LA SERENA,OOCC,11/05/2026,21/05/2026,10,
Habilitación Muebles Bloque 2,LA SERENA,OOCC,21/05/2026,23/05/2026,2,
Retiro Activos Bloque 3,LA SERENA,OOCC,19/05/2026,20/05/2026,1,
Bloque 3 Habitaciones,LA SERENA,OOCC,21/05/2026,31/05/2026,10,
Habilitación Muebles Bloque 3,LA SERENA,OOCC,31/05/2026,2/06/2026,2,
Retiro Activos Bloque 4,LA SERENA,OOCC,29/05/2026,30/05/2026,1,
Bloque 4 Habitaciones,LA SERENA,OOCC,31/05/2026,10/06/2026,10,
Habilitación Muebles Bloque 4,LA SERENA,OOCC,10/06/2026,12/06/2026,2,
Retiro Activos Bloque 5,LA SERENA,OOCC,8/06/2026,9/06/2026,1,
Bloque 5 Habitaciones,LA SERENA,OOCC,10/06/2026,25/06/2026,15,
Habilitación Muebles Bloque 5,LA SERENA,OOCC,25/06/2026,27/06/2026,2,
Retiro Activos Bloque 6,LA SERENA,OOCC,23/06/2026,24/06/2026,1,
Bloque 6 Habitaciones,LA SERENA,OOCC,25/06/2026,5/07/2026,10,
Habilitación Muebles Bloque 6,LA SERENA,OOCC,5/07/2026,7/07/2026,2,
Entrega Activos ,LA SERENA,OOCC,20/07/2026,22/07/2026,2,
Áreas Comunes,LA SERENA,OOCC,1/05/2026,25/07/2026,85,
PUNTA LARGA,PUNTA LARGA,PROXIMOS,30/06/2026,28/09/2026,90,
WIFI,PUNTA LARGA,CERRADURAS,23/04/2026,26/04/2026,3,
CERRADURAS,PUNTA LARGA,WIFI,8/04/2026,22/04/2026,14,
HORNITOS,HORNITOS,PROXIMOS,30/06/2026,17/08/2026,48,
WIFI,HORNITOS,WIFI,20/05/2026,26/05/2026,6,
LLANURAS,LLANURAS,PROXIMOS,30/06/2026,24/08/2026,56,
CERRADURAS,LLANURAS,CERRADURAS,28/04/2026,1/05/2026,3,
WIFI,LLANURAS,WIFI,8/04/2026,14/04/2026,6,
HUALLILEMU,HUALLILEMU,PROXIMOS,4/01/2027,14/04/2027,100,
CERRADURAS,HUALLILEMU,CERRADURAS,4/05/2026,7/05/2026,3,
WIFI,HUALLILEMU,WIFI,11/05/2026,25/05/2026,14,
LAGO RANCO,LAGO RANCO,PROXIMOS,4/01/2027,15/03/2027,70,
LAGO RANCO,LAGO RANCO,CERRADURAS,20/04/2026,22/04/2026,2,
WIFI,LAGO RANCO,WIFI,24/04/2026,30/04/2026,6,
LAS MELLIZAS,LAS MELLIZAS,PROXIMOS,4/01/2027,25/03/2027,80,
LAS MELLIZAS,LAS MELLIZAS,CERRADURAS,13/04/2026,15/04/2026,2,
LAS MELIZAS  - WIFI,LAS MELLIZAS,WIFI,20/04/2026,27/04/2026,7,
COSTANERA,COSTANERA,PROXIMOS,-,-,-,
CERRADURAS,COSTANERA,CERRADURAS,16/04/2026,18/04/2026,2,
WIFI,COSTANERA,WIFI,24/04/2026,30/04/2026,6,
RR PALOMAR,PALOMAR,RESTO/RECEP,31/05/2026,15/07/2026,45,
RR HUALLILEMU,HUALLILEMU,RESTO/RECEP,31/05/2026,15/07/2026,45,
RR LAS MELLIZAS,LAS MELLIZAS,RESTO/RECEP,30/06/2026,29/08/2026,60,
RR LAGO RANCO,LAGO RANCO,RESTO/RECEP,30/06/2026,29/08/2026,60,
WIFI,MACHALI,WIFI,1/06/2026,7/06/2026,6,
WIFI,LA HUAYCA,WIFI,28/05/2026,7/06/2026,10,
Año Nuevo,,FERIADO,1/01/2026,-,,
Viernes Santo,,FERIADO,3/04/2026,-,,
Sábado Santo,,FERIADO,4/04/2026,-,,
Día del Trabajo,,FERIADO,1/05/2026,-,,
Día de las Glorias Navales,,FERIADO,21/05/2026,-,,
Día Nac. Pueblos Indígenas,,FERIADO,21/06/2026,-,,
San Pedro y San Pablo,,FERIADO,29/06/2026,-,,
Día de la Virgen del Carmen,,FERIADO,16/07/2026,-,,
Asunción de la Virgen,,FERIADO,15/08/2026,-,,
Independencia Nacional,,FERIADO,18/09/2026,-,,
Día de las Glorias del Ejército,,FERIADO,19/09/2026,-,,
Encuentro de Dos Mundos,,FERIADO,12/10/2026,-,,
Día de Iglesias Evangélicas,,FERIADO,31/10/2026,-,,
Día de Todos los Santos,,FERIADO,1/11/2026,-,,
Inmaculada Concepción,,FERIADO,8/12/2026,-,,
Navidad,,FERIADO,25/12/2026,25/12/2026,0,
DIRECTORIO CLA,,FERIADO,24/04/2026,28/04/2026,0,`;

export const processCSVData = (csvContent: string) => {
  const lines = csvContent.trim().split('\n');
  const tasks: Task[] = [];
  const holidays: Holiday[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row.length < 5) continue;
    
    const [ccvv, centro, partida, inicio, fin] = row.map(s => s.trim());
    
    if (partida === 'FERIADO' || (partida === '' && ccvv.includes('Directorio')) || ccvv.toUpperCase().includes('DIRECTORIO CLA')) {
      const date = parseDate(inicio);
      const endDate = parseDate(fin);
      if (date) {
        holidays.push({ 
          date, 
          endDate: endDate || undefined,
          description: ccvv 
        });
      }
      continue;
    }

    const startDate = parseDate(inicio);
    const endDate = parseDate(fin);

    if (startDate && endDate) {
      // Evitar tareas con fecha final anterior a la inicial por errores de data (como el caso del Bloque 5 en Palomar)
      const correctedEndDate = endDate < startDate ? startDate : endDate;
      
      tasks.push({
        id: `${i}-${ccvv}`,
        name: ccvv === centro ? `${ccvv} (${partida})` : ccvv,
        start: startDate,
        end: correctedEndDate,
        center: centro || 'SIN ASIGNAR',
        status: 'pending',
        progress: 0
      });
    }
  }

  return { tasks, holidays };
};

const defaultProcessed = processCSVData(REAL_DATA_CSV);
export const TASKS = defaultProcessed.tasks;
export const HOLIDAYS = defaultProcessed.holidays;
