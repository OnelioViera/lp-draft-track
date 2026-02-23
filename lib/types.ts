export type JobType = 'lindsay-precast' | 'lindsay-renewables'

export interface Job {
  id: string
  jobType: JobType
  jobNumber: string
  jobName: string
  customerName: string
  jobLocation?: string
  projectManager: string
  status: 'active' | 'in-review' | 'complete' | 'on-hold'
  dateStarted: string
  description?: string
  fileLocationPath?: string
  attachments?: any[]
  createdAt?: string
  updatedAt?: string
}

export interface JobStats {
  total: number
  active: number
  inReview: number
  complete: number
}
