'use client'

import { JobStats } from '@/lib/types'

interface StatsBarProps {
  stats: JobStats
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-secondary/50 border border-border rounded-lg p-4 hover:border-amber transition-colors">
        <div className="text-muted-foreground text-sm font-medium">Total Jobs</div>
        <div className="text-3xl font-bold text-foreground mt-2">{stats.total}</div>
      </div>
      <div className="bg-secondary/50 border border-border rounded-lg p-4 hover:border-amber transition-colors">
        <div className="text-muted-foreground text-sm font-medium">Active</div>
        <div className="text-3xl font-bold text-amber mt-2">{stats.active}</div>
      </div>
      <div className="bg-secondary/50 border border-border rounded-lg p-4 hover:border-amber transition-colors">
        <div className="text-muted-foreground text-sm font-medium">In Review</div>
        <div className="text-3xl font-bold text-blue-400 mt-2">{stats.inReview}</div>
      </div>
      <div className="bg-secondary/50 border border-border rounded-lg p-4 hover:border-amber transition-colors">
        <div className="text-muted-foreground text-sm font-medium">Complete</div>
        <div className="text-3xl font-bold text-green-400 mt-2">{stats.complete}</div>
      </div>
    </div>
  )
}
