'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search, Plus, Filter } from 'lucide-react'
import { Job, JobStats } from '@/lib/types'
import { StatsBar } from '@/components/stats-bar'
import { JobTable } from '@/components/job-table'
import { JobDetailPanel } from '@/components/job-detail-panel'
import { CustomPopup } from '@/components/custom-popup'
import { JobFormDialog } from '@/components/job-form-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [pmFilter, setPmFilter] = useState<string>('all')
  const [stats, setStats] = useState<JobStats>({
    total: 0,
    active: 0,
    inReview: 0,
    complete: 0,
  })
  const [popup, setPopup] = useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'confirm'
    title: string
    message: string
    onConfirm?: () => void
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  // Fetch jobs from API
  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      const data = await response.json()
      if (data.docs) {
        const formattedJobs: Job[] = data.docs.map((doc: any) => ({
          id: doc.id,
          jobNumber: doc.jobNumber,
          jobName: doc.jobName,
          customerName: doc.customerName,
          jobLocation: doc.jobLocation,
          projectManager: doc.projectManager,
          status: doc.status,
          dateStarted: doc.dateStarted,
          description: doc.description,
          fileLocationPath: doc.fileLocationPath,
          attachments: doc.attachments,
        }))
        setJobs(formattedJobs)
        calculateStats(formattedJobs)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setJobs([])
    }
  }

  const calculateStats = (jobsList: Job[]) => {
    const newStats: JobStats = {
      total: jobsList.length,
      active: jobsList.filter((j) => j.status === 'active').length,
      inReview: jobsList.filter((j) => j.status === 'in-review').length,
      complete: jobsList.filter((j) => j.status === 'complete').length,
    }
    setStats(newStats)
  }

  // Filter jobs
  useEffect(() => {
    let filtered = jobs

    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.jobName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((job) => job.status === statusFilter)
    }

    if (pmFilter !== 'all') {
      filtered = filtered.filter((job) => job.projectManager === pmFilter)
    }

    setFilteredJobs(filtered)
  }, [jobs, searchQuery, statusFilter, pmFilter])

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    setIsPanelOpen(true)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    setTimeout(() => setSelectedJob(null), 300)
  }

  const handleNewJob = () => {
    setEditingJob(null)
    setIsFormOpen(true)
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setIsFormOpen(true)
    handleClosePanel()
  }

  const handleSaveJob = async (jobData: Partial<Job>) => {
    try {
      // Generate job-specific folder path
      const basePath = 'C:\\Users\\ojvie\\OneDrive - Lindsay Precast\\WORK FROM HOME'
      const sanitizedJobName = jobData.jobName?.replace(/[\\/:*?"<>|]/g, '-').toUpperCase() || 'UNNAMED'
      const jobFolderPath = `${basePath}\\${jobData.jobNumber}-${sanitizedJobName}`

      // Update jobData with the full folder path
      const updatedJobData = {
        ...jobData,
        fileLocationPath: jobFolderPath
      }

      if (editingJob) {
        // Update existing job
        const response = await fetch(`/api/jobs/${editingJob.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedJobData),
        })
        if (response.ok) {
          // Create the folder
          await fetch('/api/create-folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderPath: jobFolderPath }),
          })

          await fetchJobs()
          setPopup({
            isOpen: true,
            type: 'success',
            title: 'Job Updated',
            message: `Job "${jobData.jobName}" has been successfully updated and folder created at:\n${jobFolderPath}`,
          })
        } else {
          throw new Error('Failed to update job')
        }
      } else {
        // Create new job
        const response = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedJobData),
        })
        if (response.ok) {
          // Create the folder
          await fetch('/api/create-folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderPath: jobFolderPath }),
          })

          await fetchJobs()
          setPopup({
            isOpen: true,
            type: 'success',
            title: 'Job Created',
            message: `Job "${jobData.jobName}" has been successfully created and folder created at:\n${jobFolderPath}`,
          })
        } else {
          throw new Error('Failed to create job')
        }
      }
    } catch (error) {
      setPopup({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: `Failed to ${editingJob ? 'update' : 'create'} job. Please try again.`,
      })
    }
  }

  const handleDeleteJob = async (job: Job) => {
    setPopup({
      isOpen: true,
      type: 'confirm',
      title: 'Delete Job',
      message: `Are you sure you want to delete job "${job.jobName}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/jobs/${job.id}`, {
            method: 'DELETE',
          })
          if (response.ok) {
            await fetchJobs()
            handleClosePanel()
            setPopup({
              isOpen: true,
              type: 'success',
              title: 'Job Deleted',
              message: `Job "${job.jobName}" has been successfully deleted.`,
            })
          } else {
            throw new Error('Failed to delete job')
          }
        } catch (error) {
          setPopup({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete job. Please try again.',
          })
        }
      },
    })
  }

  const uniquePMs = Array.from(
    new Set(jobs.map((job) => job.projectManager))
  ).sort()

  return (
    <div className="min-h-screen blueprint-bg">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="https://static.wixstatic.com/media/9011e5_cf796f4367f54052a843ba0ed695b544~mv2.png"
                alt="Lindsay Precast"
                width={180}
                height={60}
                className="h-12 w-auto"
              />
              <div className="h-8 w-px bg-border" />
              <h1 className="text-2xl font-bold text-amber">LP Draft Track</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Bar */}
        <StatsBar stats={stats} />

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by job number, name, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          <Select value={pmFilter} onValueChange={setPmFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by PM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PMs</SelectItem>
              {uniquePMs.map((pm) => (
                <SelectItem key={pm} value={pm}>
                  {pm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="w-full md:w-auto" onClick={handleNewJob}>
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </div>

        {/* Job Table */}
        <JobTable
          jobs={filteredJobs}
          onJobClick={handleJobClick}
          selectedJobId={selectedJob?.id}
        />
      </main>

      {/* Job Detail Panel */}
      <JobDetailPanel
        job={selectedJob}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onEdit={handleEditJob}
        onDelete={handleDeleteJob}
      />

      {/* Job Form Dialog */}
      <JobFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveJob}
        job={editingJob}
      />

      {/* Custom Popup */}
      <CustomPopup
        isOpen={popup.isOpen}
        onClose={() => setPopup({ ...popup, isOpen: false })}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onConfirm={popup.onConfirm}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}
