'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { CustomPopup } from '@/components/custom-popup'

interface ProjectManager {
  id: string
  name: string
}

export default function ProjectManagersPage() {
  const [list, setList] = useState<ProjectManager[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nameValue, setNameValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
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

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/project-managers')
      const data = await res.json()
      setList(data.docs || [])
    } catch (e) {
      console.error(e)
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const openAdd = () => {
    setEditingId(null)
    setNameValue('')
    setError(null)
    setIsDialogOpen(true)
  }

  const openEdit = (pm: ProjectManager) => {
    setEditingId(pm.id)
    setNameValue(pm.name)
    setError(null)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    const name = nameValue.trim()
    if (!name) {
      setError('Name is required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editingId) {
        const res = await fetch(`/api/project-managers/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to update')
        }
      } else {
        const res = await fetch('/api/project-managers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to add. Name may already exist.')
        }
      }
      setIsDialogOpen(false)
      await fetchList()
      setPopup({
        isOpen: true,
        type: 'success',
        title: editingId ? 'Project manager updated' : 'Project manager added',
        message: editingId
          ? `"${name}" has been updated.`
          : `"${name}" has been added to the list.`,
      })
    } catch (e) {
      setError(null)
      setPopup({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: e instanceof Error ? e.message : 'Failed to save',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (pm: ProjectManager) => {
    setPopup({
      isOpen: true,
      type: 'confirm',
      title: 'Remove project manager',
      message: `Are you sure you want to remove "${pm.name}" from the list? They will no longer appear in the job form.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/project-managers/${pm.id}`, { method: 'DELETE' })
          if (res.ok) {
            await fetchList()
            setPopup({
              isOpen: true,
              type: 'success',
              title: 'Project manager removed',
              message: `"${pm.name}" has been removed from the list.`,
            })
          } else {
            const data = await res.json().catch(() => ({}))
            setPopup({
              isOpen: true,
              type: 'error',
              title: 'Error',
              message: data.error || 'Failed to remove project manager',
            })
          }
        } catch (e) {
          setPopup({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to remove project manager. Please try again.',
          })
        }
      },
    })
  }

  return (
    <div className="min-h-screen blueprint-bg">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
                Back
              </Link>
              <div className="h-8 w-px bg-border" />
              <Image
                src="https://static.wixstatic.com/media/9011e5_cf796f4367f54052a843ba0ed695b544~mv2.png"
                alt="Lindsay Precast"
                width={140}
                height={48}
                className="h-10 w-auto"
              />
              <h1 className="text-xl font-bold text-amber">Project Managers</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <p className="text-muted-foreground mb-4">
          Manage the list of project managers shown when creating or editing jobs.
        </p>
        <div className="flex justify-end mb-4">
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add project manager
          </Button>
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : list.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No project managers yet. Click &quot;Add project manager&quot; to add one.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {list.map((pm) => (
                <li
                  key={pm.id}
                  className="flex items-center justify-between p-4 hover:bg-secondary/30"
                >
                  <span className="font-medium">{pm.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(pm)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(pm)}
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit project manager' : 'Add project manager'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="pm-name">Name</Label>
              <Input
                id="pm-name"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                placeholder="e.g. Matthew"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CustomPopup
        isOpen={popup.isOpen}
        onClose={() => setPopup({ ...popup, isOpen: false })}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onConfirm={popup.onConfirm}
        confirmText="Remove"
        cancelText="Cancel"
      />
    </div>
  )
}
