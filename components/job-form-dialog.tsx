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
import { Job } from '@/lib/types'

interface JobFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (job: Partial<Job>) => void
  job?: Job | null
}

export function JobFormDialog({ isOpen, onClose, onSave, job }: JobFormDialogProps) {
  const [formData, setFormData] = useState({
    jobNumber: '',
    jobName: '',
    customerName: '',
    jobLocation: '',
    projectManager: '',
    status: 'active' as Job['status'],
    dateStarted: new Date().toISOString().split('T')[0],
    description: '',
    fileLocationPath: 'C:\\Users\\ojvie\\OneDrive - Lindsay Precast\\WORK FROM HOME',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form data when job prop changes (for editing)
  useEffect(() => {
    if (job) {
      setFormData({
        jobNumber: job.jobNumber || '',
        jobName: job.jobName || '',
        customerName: job.customerName || '',
        jobLocation: job.jobLocation || '',
        projectManager: job.projectManager || '',
        status: job.status || 'active',
        dateStarted: job.dateStarted ? new Date(job.dateStarted).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: job.description || '',
        fileLocationPath: job.fileLocationPath || '',
      })
    } else {
      // Reset form for new job
      setFormData({
        jobNumber: '',
        jobName: '',
        customerName: '',
        jobLocation: '',
        projectManager: '',
        status: 'active',
        dateStarted: new Date().toISOString().split('T')[0],
        description: '',
        fileLocationPath: 'C:\\Users\\ojvie\\OneDrive - Lindsay Precast\\WORK FROM HOME',
      })
    }
    // Clear errors when job changes
    setErrors({})
  }, [job, isOpen])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.jobNumber.trim()) {
      newErrors.jobNumber = 'Job Number is required'
    }
    if (!formData.jobName.trim()) {
      newErrors.jobName = 'Job Name is required'
    }
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer Name is required'
    }
    if (!formData.jobLocation.trim()) {
      newErrors.jobLocation = 'Job Location is required'
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
      jobNumber: '',
      jobName: '',
      customerName: '',
      jobLocation: '',
      projectManager: '',
      status: 'active',
      dateStarted: new Date().toISOString().split('T')[0],
      description: '',
      fileLocationPath: 'C:\\Users\\ojvie\\OneDrive - Lindsay Precast\\WORK FROM HOME',
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
              <Label htmlFor="jobLocation">
                Job Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jobLocation"
                value={formData.jobLocation}
                onChange={(e) => handleChange('jobLocation', e.target.value)}
                placeholder="Enter location"
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
              <Input
                id="projectManager"
                value={formData.projectManager}
                onChange={(e) => handleChange('projectManager', e.target.value)}
                placeholder="Enter PM name"
                className={errors.projectManager ? 'border-red-500' : ''}
              />
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
            <Label htmlFor="fileLocationPath">File Location Path (Auto-Generated)</Label>
            <Input
              id="fileLocationPath"
              value={formData.fileLocationPath}
              readOnly
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              {formData.jobNumber && formData.jobName ? (
                <>Folder will be: C:\Users\ojvie\Onelio - Lindsay Precast\WORK FROM HOME\{formData.jobNumber}-{formData.jobName.replace(/[\\/:*?"<>|]/g, '-').toUpperCase()}</>
              ) : (
                <>Enter Job Number and Job Name to see the folder path</>
              )}
            </p>
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
