
import { GoogleGenAI, Type } from "@google/genai";
import { Task, Holiday } from "../types";

export const analyzeGanttInterferences = async (tasks: Task[], holidays: Holiday[]) => {
  // Siempre obtener la key del entorno
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key no configurada. Asegúrate de tener GEMINI_API_KEY en tu entorno.");
  }

  // Crear nueva instancia
  const ai = new GoogleGenAI({ apiKey });
  
  const tasksSummary = tasks.slice(0, 40).map(t => ({
    name: t.name,
    start: t.start.toISOString().split('T')[0],
    end: t.end.toISOString().split('T')[0],
    center: t.center
  }));

  const holidaysSummary = holidays.map(h => ({
    date: h.date.toISOString().split('T')[0],
    desc: h.description
  }));

  const prompt = `Actúa como un experto en planificación de obras. Analiza estas tareas y detecta interferencias con feriados o el hito 'DIRECTORIO CLA'.
  
  Tareas: ${JSON.stringify(tasksSummary)}
  Feriados: ${JSON.stringify(holidaysSummary)}
  
  Indica:
  1. Qué tareas están en conflicto directo con feriados o el hito CLA.
  2. El impacto en los centros de costo.
  3. Sugerencias para mitigar retrasos.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interferences: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Conflictos detectados."
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Plan de mitigación."
            },
            impactSummary: {
              type: Type.STRING,
              description: "Resumen del impacto en la ruta crítica."
            }
          },
          required: ["interferences", "suggestions", "impactSummary"]
        }
      }
    });

    // Fix: Safely handle response.text which could be undefined
    const text = response.text?.trim();
    if (!text) {
      throw new Error("No se pudo obtener una respuesta válida de la IA.");
    }
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
