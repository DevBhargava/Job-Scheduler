export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'pending' | 'running' | 'completed' | 'failed';

export interface Job {
  id: number;
  taskName: string;
  payload: any;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CreateJobData {
  taskName: string;
  payload: any;
  priority: Priority;
}