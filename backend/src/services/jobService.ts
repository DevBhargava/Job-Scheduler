import pool from '../config/database';
import { Job, CreateJobDTO, WebhookPayload } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import axios from 'axios';

/**
 * Create a new job
 */
export const createJob = async (jobData: CreateJobDTO): Promise<Job> => {
  const { taskName, payload, priority } = jobData;
  
  const query = `
    INSERT INTO jobs (taskName, payload, priority, status)
    VALUES (?, ?, ?, 'pending')
  `;

  const [result] = await pool.execute<ResultSetHeader>(
    query,
    [taskName, JSON.stringify(payload), priority]
  );

  const jobId = result.insertId;
  const job = await getJobById(jobId);
  
  if (!job) {
    throw new Error('Failed to retrieve created job');
  }

  return job;
};

/**
 * Get all jobs with optional filters
 */
export const getAllJobs = async (filters?: { status?: string; priority?: string }): Promise<Job[]> => {
  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params: any[] = [];

  if (filters?.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters?.priority) {
    query += ' AND priority = ?';
    params.push(filters.priority);
  }

  query += ' ORDER BY createdAt DESC';

  const [rows] = await pool.execute<RowDataPacket[]>(query, params);

  return rows.map(row => ({
    ...row,
    payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload
  })) as Job[];
};

/**
 * Get a single job by ID
 */
export const getJobById = async (id: number): Promise<Job | null> => {
  const query = 'SELECT * FROM jobs WHERE id = ?';
  const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

  if (rows.length === 0) {
    return null;
  }

  const job = rows[0];
  return {
    ...job,
    payload: typeof job.payload === 'string' ? JSON.parse(job.payload) : job.payload
  } as Job;
};

/**
 * Update job status
 */
export const updateJobStatus = async (
  id: number, 
  status: string, 
  completedAt?: Date
): Promise<void> => {
  let query = 'UPDATE jobs SET status = ?, updatedAt = CURRENT_TIMESTAMP';
  const params: any[] = [status];

  if (completedAt) {
    query += ', completedAt = ?';
    params.push(completedAt);
  }

  query += ' WHERE id = ?';
  params.push(id);

  await pool.execute(query, params);
};

/**
 * Execute a job (simulate processing)
 */
export const executeJob = async (jobId: number): Promise<void> => {
  try {
    console.log(`🔄 Starting job ${jobId}...`);

    // Set status to running
    await updateJobStatus(jobId, 'running');

    // Simulate processing (3 seconds)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Set status to completed
    const completedAt = new Date();
    await updateJobStatus(jobId, 'completed', completedAt);

    console.log(`✅ Job ${jobId} completed`);

    // Trigger webhook
    await triggerWebhook(jobId, completedAt);
  } catch (error) {
    console.error(`❌ Job ${jobId} failed:`, error);
    await updateJobStatus(jobId, 'failed');
    throw error;
  }
};

/**
 * Trigger outbound webhook
 */
export const triggerWebhook = async (jobId: number, completedAt: Date): Promise<void> => {
  try {
    const job = await getJobById(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn('⚠️  WEBHOOK_URL not configured, skipping webhook trigger');
      return;
    }

    const payload: WebhookPayload = {
      jobId: job.id!,
      taskName: job.taskName,
      priority: job.priority,
      payload: job.payload,
      completedAt: completedAt.toISOString()
    };

    console.log(`📤 Triggering webhook for job ${jobId}...`);
    console.log('Webhook URL:', webhookUrl);
    console.log('Webhook Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log(`✅ Webhook triggered successfully for job ${jobId}`);
    console.log('Webhook Response Status:', response.status);
  } catch (error: any) {
    console.error(`❌ Webhook failed for job ${jobId}:`, error.message);
    // Don't throw error - webhook failure shouldn't fail the job
  }
};