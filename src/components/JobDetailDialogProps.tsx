import { Job } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface JobDetailDialogProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function JobDetailDialog({ job, open, onOpenChange }: JobDetailDialogProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      running: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      High: 'bg-red-100 text-red-800 border-red-200',
      Medium: 'bg-orange-100 text-orange-800 border-orange-200',
      Low: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Job Details</DialogTitle>
          <DialogDescription>
            Complete information about job #{job.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Job ID</label>
              <p className="text-gray-900 mt-1">#{job.id}</p>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700">Task Name</label>
              <p className="text-gray-900 mt-1">{job.taskName}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Status</label>
              <div className="mt-1">
                <Badge variant="outline" className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Priority</label>
              <div className="mt-1">
                <Badge variant="outline" className={getPriorityColor(job.priority)}>
                  {job.priority}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Created At</label>
              <p className="text-gray-900 mt-1 text-sm">{formatDate(job.createdAt)}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Updated At</label>
              <p className="text-gray-900 mt-1 text-sm">{formatDate(job.updatedAt)}</p>
            </div>

            {job.completedAt && (
              <div className="col-span-2">
                <label className="text-sm font-semibold text-gray-700">Completed At</label>
                <p className="text-gray-900 mt-1 text-sm">{formatDate(job.completedAt)}</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Payload</label>
            <div className="rounded-md bg-gray-50 border border-gray-200 p-4 overflow-auto max-h-[300px]">
              <pre className="text-sm font-mono text-gray-900 whitespace-pre-wrap">
                {JSON.stringify(job.payload, null, 2)}
              </pre>
            </div>
          </div>

          {job.status === 'completed' && (
            <div className="rounded-md bg-green-50 border border-green-200 p-4">
              <p className="text-sm text-green-800">
                ✅ This job has been completed successfully. A webhook notification has been sent.
              </p>
            </div>
          )}

          {job.status === 'running' && (
            <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm text-blue-800">
                🔄 This job is currently being processed...
              </p>
            </div>
          )}

          {job.status === 'failed' && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">
                ❌ This job has failed during execution.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}