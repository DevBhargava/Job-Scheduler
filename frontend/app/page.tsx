'use client';

import { useState, useEffect } from 'react';
import { jobsApi } from '@/src/lib/api';
import { Job, Priority, Status } from '@/src/types';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Play, Plus, Eye, RefreshCw } from 'lucide-react';
import CreateJobDialog from '@/src/components/CreateJobDialog';
import JobDetailDialog from '@/src/components/JobDetailDialog';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [runningJobs, setRunningJobs] = useState<Set<number>>(new Set());

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      
      const data = await jobsApi.getAll(filters);
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, priorityFilter]);

  const handleRunJob = async (jobId: number) => {
    try {
      setRunningJobs(prev => new Set(prev).add(jobId));
      await jobsApi.run(jobId);
      
      // Poll for status updates
      const pollInterval = setInterval(async () => {
        const updatedJob = await jobsApi.getById(jobId);
        
        setJobs(prev => prev.map(job => 
          job.id === jobId ? updatedJob : job
        ));

        if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
          clearInterval(pollInterval);
          setRunningJobs(prev => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error running job:', error);
      setRunningJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: Status) => {
    const variants: Record<Status, { className: string; label: string }> = {
      pending: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      running: { className: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Running' },
      completed: { className: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' },
      failed: { className: 'bg-red-100 text-red-800 border-red-200', label: 'Failed' },
    };
    
    const { className, label } = variants[status];
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getPriorityBadge = (priority: Priority) => {
    const variants: Record<Priority, { className: string }> = {
      High: { className: 'bg-red-100 text-red-800 border-red-200' },
      Medium: { className: 'bg-orange-100 text-orange-800 border-orange-200' },
      Low: { className: 'bg-gray-100 text-gray-800 border-gray-200' },
    };
    
    return (
      <Badge variant="outline" className={variants[priority].className}>
        {priority}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Job Scheduler Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage and monitor your automation tasks</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Job
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter jobs by status and priority</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={fetchJobs}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jobs ({jobs.length})</CardTitle>
            <CardDescription>List of all jobs in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No jobs found</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first job
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Task Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Created At</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">#{job.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{job.taskName}</div>
                        </td>
                        <td className="py-3 px-4">{getPriorityBadge(job.priority)}</td>
                        <td className="py-3 px-4">{getStatusBadge(job.status)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(job.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedJob(job)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {job.status === 'pending' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleRunJob(job.id)}
                                disabled={runningJobs.has(job.id)}
                              >
                                {runningJobs.has(job.id) ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateJobDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchJobs}
      />

      {selectedJob && (
        <JobDetailDialog
          job={selectedJob}
          open={!!selectedJob}
          onOpenChange={(open) => !open && setSelectedJob(null)}
        />
      )}
    </div>
  );
}