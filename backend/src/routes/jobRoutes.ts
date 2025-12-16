import express, { Request, Response } from 'express';
import * as jobController from '../controllers/jobControllers';

const router = express.Router();

// Job routes
router.post('/jobs', jobController.createJob);
router.get('/jobs', jobController.getAllJobs);
router.get('/jobs/:id', jobController.getJobById);
router.post('/run-job/:id', jobController.runJob);

// Optional: Webhook test endpoint
router.post('/webhook-test', (req: Request, res: Response) => {
  console.log('📥 Webhook received:', JSON.stringify(req.body, null, 2));
  res.status(200).json({ message: 'Webhook received successfully', data: req.body });
});

export default router;