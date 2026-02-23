'use client'

import { Job } from '@/lib/types'
import { X, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FileManager } from '@/components/file-manager'

interface JobDetailPanelProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (job: Job) => void
  onDelete?: (job: Job) => void
}

const statusColors = {
  active: 'bg-amber/20 text-amber border-amber/50',
  'in-review': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  complete: 'bg-green-500/20 text-green-400 border-green-500/50',
  'on-hold': 'bg-gray-500/20 text-gray-400 border-gray-500/50',
}

const statusLabels = {
  active: 'Active',
  'in-review': 'In Review',
  complete: 'Complete',
  'on-hold': 'On Hold',
}

const jobTypeLabels: Record<string, string> = {
  'lindsay-precast': 'Lindsay Precast',
  'lindsay-renewables': 'Lindsay Renewables',
}

export function JobDetailPanel({
  job,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: JobDetailPanelProps) {
  if (!job) return null

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 transition-opacity z-40',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full md:w-[600px] bg-background border-l border-border shadow-2xl transition-transform duration-300 ease-in-out z-50 overflow-y-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-amber">{job.jobName}</h2>
              <p className="text-muted-foreground mt-1">#{job.jobNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
                statusColors[job.status]
              )}
            >
              {statusLabels[job.status]}
            </span>
          </div>

          {/* Details Grid */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Job Type</label>
                <p className="text-foreground font-medium mt-1">{jobTypeLabels[job.jobType] ?? job.jobType}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Customer Name</label>
                <p className="text-foreground font-medium mt-1">{job.customerName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Project Manager</label>
                <p className="text-foreground font-medium mt-1">{job.projectManager}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Location</label>
                <p className="text-foreground font-medium mt-1">{job.jobLocation || 'N/A'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Date Started</label>
                <p className="text-foreground font-medium mt-1">
                  {new Date(job.dateStarted).toLocaleDateString()}
                </p>
              </div>
            </div>

            {job.fileLocationPath && (
              <div>
                <label className="text-sm text-muted-foreground">File Location Path</label>
                <p className="text-foreground font-mono text-sm mt-1 bg-secondary/50 p-2 rounded border border-border">
                  {job.fileLocationPath}
                </p>
              </div>
            )}

            {job.description && (
              <div>
                <label className="text-sm text-muted-foreground">Description</label>
                <p className="text-foreground mt-1 leading-relaxed">{job.description}</p>
              </div>
            )}

            {/* File Manager */}
            {job.fileLocationPath && (
              <div>
                <FileManager jobFolderPath={job.fileLocationPath} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-border">
            <Button
              onClick={() => onEdit?.(job)}
              className="flex-1"
              variant="default"
            >
              Edit Job
            </Button>
            <Button
              onClick={() => onDelete?.(job)}
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
