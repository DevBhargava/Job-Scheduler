export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'pending' | 'running' | 'completed' | 'failed';

export interface Job {
  id?: number;
  taskName: string;
  payload: any;
  priority: Priority;
  status: Status;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date | null;
}

export interface CreateJobDTO {
  taskName: string;
  payload: any;
  priority: Priority;
}

export interface WebhookPayload {
  jobId: number;
  taskName: string;
  priority: Priority;
  payload: any;
  completedAt: string;
}