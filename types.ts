
export interface Task {
  id: string;
  name: string;
  start: Date;
  end: Date;
  center: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
}

export interface CenterGroup {
  name: string;
  tasks: Task[];
  start: Date;
  end: Date;
  durationDays: number;
}

export interface Holiday {
  date: Date;
  endDate?: Date;
  description: string;
}

export interface GanttData {
  tasks: Task[];
  holidays: Holiday[];
}

export interface AnalysisResult {
  interferences: string[];
  suggestions: string[];
  impactSummary: string;
}
