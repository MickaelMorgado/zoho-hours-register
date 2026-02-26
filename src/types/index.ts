// Shared types for Zoho Hours Register

export interface Checkpoint {
  id: number;
  startTime: Date;
  endTime: Date | null;
  duration: string;
  description: string;
  isRunning: boolean;
  displayNumber?: number;
}

export interface DashboardTask {
  id: string;
  name: string;
  projectName: string;
  zohoTaskUrl: string;
  status: string;
  priority: string;
  assignedTo: string;
  projectId?: string;
  completed?: boolean;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string | null;
  lastModifiedTimeLong?: number;
}
