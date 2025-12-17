import axios from 'axios';
import { Job, CreateJobData } from '@/src/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const jobsApi = {
  // Get all jobs with optional filters
  getAll: async (filters?: { status?: string; priority?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    
    const response = await api.get<Job[]>(`/jobs?${params.toString()}`);
    return response.data;
  },

  // Get a single job by ID
  getById: async (id: number) => {
    const response = await api.get<Job>(`/jobs/${id}`);
    return response.data;
  },

  // Create a new job
  create: async (data: CreateJobData) => {
    const response = await api.post<Job>('/jobs', data);
    return response.data;
  },

  // Run a job
  run: async (id: number) => {
    const response = await api.post(`/run-job/${id}`);
    return response.data;
  },
};

export default api;