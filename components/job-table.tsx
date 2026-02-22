'use client'

import { Job } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface JobTableProps {
  jobs: Job[]
  onJobClick: (job: Job) => void
  selectedJobId?: string
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

export function JobTable({ jobs, onJobClick, selectedJobId }: JobTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No jobs found
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="font-semibold text-amber">Job Number</TableHead>
            <TableHead className="font-semibold text-amber">Job Name</TableHead>
            <TableHead className="font-semibold text-amber">Customer</TableHead>
            <TableHead className="font-semibold text-amber">Location</TableHead>
            <TableHead className="font-semibold text-amber">PM</TableHead>
            <TableHead className="font-semibold text-amber">Status</TableHead>
            <TableHead className="font-semibold text-amber">Date Started</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow
              key={job.id}
              onClick={() => onJobClick(job)}
              className={cn(
                'cursor-pointer transition-colors',
                selectedJobId === job.id && 'bg-amber/10'
              )}
            >
              <TableCell className="font-medium">{job.jobNumber}</TableCell>
              <TableCell>{job.jobName}</TableCell>
              <TableCell>{job.customerName}</TableCell>
              <TableCell>{job.jobLocation}</TableCell>
              <TableCell>{job.projectManager}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    statusColors[job.status]
                  )}
                >
                  {statusLabels[job.status]}
                </span>
              </TableCell>
              <TableCell>
                {new Date(job.dateStarted).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
