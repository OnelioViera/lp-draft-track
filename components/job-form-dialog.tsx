'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Job, JobType } from '@/lib/types'

interface JobFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (job: Partial<Job>) => void
  job?: Job | null
  initialJobType?: JobType
  projectManagers?: { id: string; name: string }[]
}

export function JobFormDialog({ isOpen, onClose, onSave, job, initialJobType = 'lindsay-precast', projectManagers = [] }: JobFormDialogProps) {
  const basePaths: Record<JobType, string> = {
    'lindsay-precast':
      process.env.NEXT_PUBLIC_JOB_FOLDER_BASE_PATH_LINDSAY_PRECAST ||
      'C:\\Users\\ojvie\\OneDrive - Lindsay Precast\\WORK FROM HOME',
    'lindsay-renewables':
      process.env.NEXT_PUBLIC_JOB_FOLDER_BASE_PATH_LINDSAY_RENEWABLES ||
      'C:\\Users\\ojvie\\OneDrive - Lindsay Renewables\\WORK FROM HOME',
  }
  const [formData, setFormData] = useState({
    jobType: 'lindsay-precast' as JobType,
    jobNumber: '',
    jobName: '',
    customerName: '',
    jobLocation: '',
    projectManager: '',
    status: 'active' as Job['status'],
    dateStarted: new Date().toISOString().split('T')[0],
    description: '',
    fileLocationPath: basePaths['lindsay-precast'],
    useExistingFolder: false,
    existingFolderPath: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form data when job prop changes (for editing)
  useEffect(() => {
    if (job) {
      setFormData({
        jobType: job.jobType || 'lindsay-precast',
        jobNumber: job.jobNumber || '',
        jobName: job.jobName || '',
        customerName: job.customerName || '',
        jobLocation: job.jobLocation || '',
        projectManager: job.projectManager || '',
        status: job.status || 'active',
        dateStarted: job.dateStarted ? new Date(job.dateStarted).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: job.description || '',
        fileLocationPath: job.fileLocationPath || basePaths[job.jobType || 'lindsay-precast'],
        useExistingFolder: false,
        existingFolderPath: '',
      })
    } else {
      // Reset form for new job
      setFormData({
        jobType: initialJobType,
        jobNumber: '',
        jobName: '',
        customerName: '',
        jobLocation: '',
        projectManager: '',
        status: 'active',
        dateStarted: new Date().toISOString().split('T')[0],
        description: '',
        fileLocationPath: basePaths[initialJobType],
        useExistingFolder: false,
        existingFolderPath: '',
      })
    }
    setErrors({})
  }, [job, initialJobType, isOpen])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'jobType') {
        next.fileLocationPath = basePaths[value as JobType]
      }
      if (field === 'useExistingFolder') {
        if (value) {
          next.fileLocationPath = prev.existingFolderPath || next.fileLocationPath
        } else {
          const base = basePaths[prev.jobType]
          const sanitized = (prev.jobName || '').replace(/[\\/:*?"<>|]/g, '-').toUpperCase() || 'UNNAMED'
          next.fileLocationPath = prev.jobNumber ? `${base}\\${prev.jobNumber}-${sanitized}` : base
        }
      }
      if (field === 'existingFolderPath' && prev.useExistingFolder) {
        next.fileLocationPath = value as string
      }
      if ((field === 'jobNumber' || field === 'jobName') && !next.useExistingFolder) {
        const base = basePaths[prev.jobType]
        const num = field === 'jobNumber' ? value : prev.jobNumber
        const name = field === 'jobName' ? value : prev.jobName
        const nameStr = typeof name === 'string' ? name : ''
        const sanitized = nameStr.replace(/[\\/:*?"<>|]/g, '-').toUpperCase() || 'UNNAMED'
        const numStr = typeof num === 'string' ? num : ''
        next.fileLocationPath = numStr ? `${base}\\${numStr}-${sanitized}` : base
      }
      return next
    })
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.jobType) {
      newErrors.jobType = 'Job type is required'
    }
    if (!formData.jobNumber.trim()) {
      newErrors.jobNumber = 'Job Number is required'
    }
    if (!formData.jobName.trim()) {
      newErrors.jobName = 'Job Name is required'
    }
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer Name is required'
    }
    if (!formData.projectManager.trim()) {
      newErrors.projectManager = 'Project Manager is required'
    }
    if (!formData.dateStarted) {
      newErrors.dateStarted = 'Date Started is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData)
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      jobType: 'lindsay-precast',
      jobNumber: '',
      jobName: '',
      customerName: '',
      jobLocation: '',
      projectManager: '',
      status: 'active',
      dateStarted: new Date().toISOString().split('T')[0],
      description: '',
      fileLocationPath: basePaths['lindsay-precast'],
      useExistingFolder: false,
      existingFolderPath: '',
    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-amber">
            {job ? 'Edit Job' : 'Create New Job'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Type <span className="text-red-500">*</span></Label>
              <Select
                value={formData.jobType}
                onValueChange={(value) => handleChange('jobType', value)}
              >
                <SelectTrigger className={errors.jobType ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lindsay-precast">Lindsay Precast</SelectItem>
                  <SelectItem value="lindsay-renewables">Lindsay Renewables</SelectItem>
                </SelectContent>
              </Select>
              {errors.jobType && (
                <p className="text-xs text-red-500">{errors.jobType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobNumber">
                Job Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jobNumber"
                value={formData.jobNumber}
                onChange={(e) => handleChange('jobNumber', e.target.value)}
                placeholder="e.g., LP-2024-001"
                className={errors.jobNumber ? 'border-red-500' : ''}
              />
              {errors.jobNumber && (
                <p className="text-xs text-red-500">{errors.jobNumber}</p>
              )}
            </div>
            <div />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobName">
              Job Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="jobName"
              value={formData.jobName}
              onChange={(e) => handleChange('jobName', e.target.value)}
              placeholder="Enter job name"
              className={errors.jobName ? 'border-red-500' : ''}
            />
            {errors.jobName && (
              <p className="text-xs text-red-500">{errors.jobName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">
              Customer Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => handleChange('customerName', e.target.value)}
              placeholder="Enter customer name"
              className={errors.customerName ? 'border-red-500' : ''}
            />
            {errors.customerName && (
              <p className="text-xs text-red-500">{errors.customerName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobLocation">Job Location</Label>
              <Input
                id="jobLocation"
                value={formData.jobLocation}
                onChange={(e) => handleChange('jobLocation', e.target.value)}
                placeholder="Enter location (optional)"
                className={errors.jobLocation ? 'border-red-500' : ''}
              />
              {errors.jobLocation && (
                <p className="text-xs text-red-500">{errors.jobLocation}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectManager">
                Project Manager <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.projectManager}
                onValueChange={(value) => handleChange('projectManager', value)}
              >
                <SelectTrigger className={errors.projectManager ? 'border-red-500' : ''}>
                  <SelectValue placeholder={projectManagers.length === 0 ? 'Add project managers first' : 'Select project manager'} />
                </SelectTrigger>
                <SelectContent>
                  {formData.projectManager &&
                    !projectManagers.some((pm) => pm.name === formData.projectManager) && (
                    <SelectItem value={formData.projectManager}>
                      {formData.projectManager}
                    </SelectItem>
                  )}
                  {projectManagers.map((pm) => (
                    <SelectItem key={pm.id} value={pm.name}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {projectManagers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Add project managers via the Project Managers link in the header.
                </p>
              )}
              {errors.projectManager && (
                <p className="text-xs text-red-500">{errors.projectManager}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateStarted">
              Date Started <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dateStarted"
              type="date"
              value={formData.dateStarted}
              onChange={(e) => handleChange('dateStarted', e.target.value)}
              className={errors.dateStarted ? 'border-red-500' : ''}
            />
            {errors.dateStarted && (
              <p className="text-xs text-red-500">{errors.dateStarted}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileLocationPath">Job folder</Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useExistingFolder"
                checked={formData.useExistingFolder}
                onChange={(e) => handleChange('useExistingFolder', e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="useExistingFolder" className="font-normal cursor-pointer">
                Use existing folder
              </Label>
            </div>
            {formData.useExistingFolder ? (
              <>
                <Input
                  id="existingFolderPath"
                  value={formData.existingFolderPath || formData.fileLocationPath}
                  onChange={(e) => {
                    const v = e.target.value
                    handleChange('existingFolderPath', v)
                    handleChange('fileLocationPath', v)
                  }}
                  placeholder="e.g. C:\Users\...\WORK FROM HOME\25-1111-MY JOB"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the full path to the existing folder. The job will use this folder for files.
                </p>
              </>
            ) : (
              <>
                <Input
                  id="fileLocationPath"
                  value={formData.fileLocationPath}
                  readOnly
                  className="bg-muted cursor-not-allowed font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.jobNumber && formData.jobName ? (
                    <>New folder will be: {formData.fileLocationPath}</>
                  ) : (
                    <>Enter Job Number and Job Name to see the folder path</>
                  )}
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter job description..."
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {job ? 'Update Job' : 'Create Job'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
