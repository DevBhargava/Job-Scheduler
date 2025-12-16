import { Request, Response } from 'express';
import * as jobService from '../services/jobService';
import { CreateJobDTO } from '../types';

/**
 * Create a new job
 */
export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskName, payload, priority } = req.body;

    // Validation
    if (!taskName || !payload || !priority) {
      res.status(400).json({ error: 'Missing required fields: taskName, payload, priority' });
      return;
    }

    if (!['Low', 'Medium', 'High'].includes(priority)) {
      res.status(400).json({ error: 'Priority must be Low, Medium, or High' });
      return;
    }

    // Validate payload is valid JSON
    if (typeof payload !== 'object') {
      res.status(400).json({ error: 'Payload must be a valid JSON object' });
      return;
    }

    const jobData: CreateJobDTO = {
      taskName,
      payload,
      priority
    };

    const job = await jobService.createJob(jobData);
    res.status(201).json(job);
  } catch (error: any) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job', message: error.message });
  }
};

/**
 * Get all jobs with optional filters
 */
export const getAllJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, priority } = req.query;

    const filters = {
      status: status as string | undefined,
      priority: priority as string | undefined
    };

    const jobs = await jobService.getAllJobs(filters);
    res.status(200).json(jobs);
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs', message: error.message });
  }
};

/**
 * Get a single job by ID
 */
export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const jobId = parseInt(id);

    if (isNaN(jobId)) {
      res.status(400).json({ error: 'Invalid job ID' });
      return;
    }

    const job = await jobService.getJobById(jobId);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.status(200).json(job);
  } catch (error: any) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job', message: error.message });
  }
};

/**
 * Run a job (simulate processing and trigger webhook)
 */
export const runJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const jobId = parseInt(id);

    if (isNaN(jobId)) {
      res.status(400).json({ error: 'Invalid job ID' });
      return;
    }

    // Check if job exists
    const job = await jobService.getJobById(jobId);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Check if job is already running or completed
    if (job.status === 'running') {
      res.status(400).json({ error: 'Job is already running' });
      return;
    }

    if (job.status === 'completed') {
      res.status(400).json({ error: 'Job is already completed' });
      return;
    }

    // Start the job asynchronously (don't wait for completion)
    jobService.executeJob(jobId).catch(error => {
      console.error(`Error executing job ${jobId}:`, error);
    });

    res.status(200).json({ 
      message: 'Job started successfully', 
      jobId,
      status: 'running'
    });
  } catch (error: any) {
    console.error('Error running job:', error);
    res.status(500).json({ error: 'Failed to run job', message: error.message });
  }
};