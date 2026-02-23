'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Download,
  Upload,
  FolderPlus,
  File,
  Pencil,
  Trash2,
  ChevronRight,
  FolderUp,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { CustomPopup } from '@/components/custom-popup'

interface FileItem {
  name: string
  path: string
  type: 'file'
  size: number
  extension: string
  modified: string
}

interface FolderItem {
  name: string
  path: string
  type: 'folder'
  modified: string
}

interface FileManagerProps {
  jobFolderPath: string
  onUploadComplete?: () => void
}

export function FileManager({ jobFolderPath, onUploadComplete }: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [currentPath, setCurrentPath] = useState(jobFolderPath)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renameTarget, setRenameTarget] = useState<{ path: string; name: string; type: 'file' | 'folder' } | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ path: string; name: string; type: 'file' | 'folder' } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [uploadMessage, setUploadMessage] = useState<'success' | 'error' | null>(null)
  const [folderUploadProgress, setFolderUploadProgress] = useState<{ current: number; total: number } | null>(null)
  const [showUploadFolderConfirm, setShowUploadFolderConfirm] = useState(false)
  const [localOnlyMessage, setLocalOnlyMessage] = useState<string | null>(null)

  useEffect(() => {
    loadFiles()
  }, [currentPath])

  const loadFiles = async () => {
    setLoading(true)
    setLocalOnlyMessage(null)
    try {
      const response = await fetch('/api/list-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: currentPath }),
      })
      const data = await response.json()
      if (data.success) {
        setFiles(data.files || [])
        setFolders(data.folders || [])
      } else if (response.status === 503 && data.code === 'LOCAL_ONLY') {
        setFiles([])
        setFolders([])
        setLocalOnlyMessage(data.details || data.error || 'File and folder operations are only available when running the app on your computer.')
      }
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadMessage(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folderPath', currentPath)

      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        await loadFiles()
        onUploadComplete?.()
        setUploadMessage('success')
        setTimeout(() => setUploadMessage(null), 3000)
      } else {
        const data = await response.json().catch(() => ({}))
        const message = (response.status === 503 && data.code === 'LOCAL_ONLY')
          ? (data.details || data.error || 'Upload is only available when running the app on your computer.')
          : (data.error || data.details || 'Upload failed')
        setActionError(message)
        setUploadMessage('error')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setActionError('Failed to upload file')
      setUploadMessage('error')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList?.length) return

    const fileArray = Array.from(fileList) as File[]
    const total = fileArray.length
    setUploading(true)
    setUploadMessage(null)
    setFolderUploadProgress({ current: 0, total })
    setActionError(null)

    let uploaded = 0
    let lastError: string | null = null

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name
      setFolderUploadProgress({ current: i + 1, total })

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folderPath', currentPath)
        formData.append('relativePath', relativePath.replace(/\\/g, '/'))

        const response = await fetch('/api/upload-file', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          uploaded++
        } else {
          const data = await response.json().catch(() => ({}))
          lastError = (response.status === 503 && data.code === 'LOCAL_ONLY')
            ? (data.details || data.error || 'Upload is only available when running the app on your computer.')
            : (data.error || data.details || 'Upload failed')
        }
      } catch {
        lastError = 'Failed to upload file'
      }
    }

    setUploading(false)
    setFolderUploadProgress(null)
    event.target.value = ''

    if (uploaded > 0) {
      await loadFiles()
      onUploadComplete?.()
    }
    if (lastError) {
      setActionError(uploaded > 0 ? `${lastError} (${uploaded}/${total} files uploaded)` : lastError)
      setUploadMessage('error')
    } else {
      setUploadMessage('success')
      setTimeout(() => setUploadMessage(null), 3000)
    }
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await fetch('/api/download-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: file.path }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const response = await fetch('/api/create-subfolder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderPath: currentPath,
          subfolderName: newFolderName,
        }),
      })

      if (response.ok) {
        setNewFolderName('')
        setIsNewFolderOpen(false)
        await loadFiles()
      } else {
        const data = await response.json()
        setActionError(data.error || data.message || 'Failed to create folder')
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      setActionError('Failed to create folder')
    }
  }

  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim()) return

    setActionError(null)
    try {
      const response = await fetch('/api/rename-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: renameTarget.path, newName: renameValue.trim() }),
      })
      const data = await response.json()

      if (response.ok) {
        setRenameTarget(null)
        setRenameValue('')
        await loadFiles()
      } else {
        setActionError(data.error || 'Failed to rename')
      }
    } catch (error) {
      console.error('Error renaming:', error)
      setActionError('Failed to rename')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setActionError(null)
    try {
      const response = await fetch('/api/delete-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: deleteTarget.path, type: deleteTarget.type }),
      })

      if (response.ok) {
        const wasViewingDeletedFolder = deleteTarget.type === 'folder' && currentPath === deleteTarget.path
        setDeleteTarget(null)
        if (wasViewingDeletedFolder) {
          const parentPath = currentPath.split('\\').slice(0, -1).join('\\')
          setCurrentPath(parentPath || jobFolderPath)
        }
        await loadFiles()
      } else {
        const data = await response.json()
        setActionError(data.error || 'Failed to delete')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      setActionError('Failed to delete')
    }
  }

  const openRename = (item: { path: string; name: string }, type: 'file' | 'folder') => {
    setRenameTarget({ ...item, type })
    setRenameValue(item.name)
    setActionError(null)
  }

  const openDelete = (item: { path: string; name: string }, type: 'file' | 'folder') => {
    setDeleteTarget({ ...item, type })
    setActionError(null)
  }

  const getFileIcon = (extension: string) => {
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(extension)) {
      return <ImageIcon className="h-5 w-5 text-blue-400" />
    } else if (extension === '.pdf') {
      return <FileText className="h-5 w-5 text-red-400" />
    } else if (extension === '.dwg') {
      return <File className="h-5 w-5 text-amber" />
    }
    return <File className="h-5 w-5 text-muted-foreground" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Job folder name (last segment of path) and breadcrumb from job root to current folder
  const jobFolderName = jobFolderPath.split('\\').filter(Boolean).pop() || 'Job folder'
  const relativePath = currentPath.replace(jobFolderPath.replace(/\\$/, ''), '').replace(/^\\+/, '')
  const pathSegments = relativePath ? relativePath.split('\\') : []
  const breadcrumb: { name: string; path: string }[] = [{ name: jobFolderName, path: jobFolderPath }]
  for (let i = 0; i < pathSegments.length; i++) {
    breadcrumb.push({
      name: pathSegments[i],
      path: pathSegments.slice(0, i + 1).reduce((acc, seg) => `${acc}\\${seg}`, jobFolderPath),
    })
  }
  const currentFolderName = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : jobFolderName

  return (
    <div className="space-y-4">
      {/* Folder tree / breadcrumb: job folder as root, then path to current */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Folder tree</Label>
        <div className="flex flex-wrap items-center gap-1 text-sm bg-secondary/50 border border-border rounded-lg p-2">
          {breadcrumb.map((seg, i) => (
            <span key={seg.path} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              <button
                type="button"
                onClick={() => setCurrentPath(seg.path)}
                className={`font-medium truncate max-w-[180px] text-left hover:underline focus:outline-none focus:underline ${
                  i === breadcrumb.length - 1 ? 'text-amber' : 'text-muted-foreground hover:text-foreground'
                }`}
                title={seg.path}
              >
                {seg.name}
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Header: actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-sm text-muted-foreground">
          {currentPath === jobFolderPath
            ? `Contents of job folder "${jobFolderName}"`
            : `Contents of "${currentFolderName}"`}
        </Label>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsNewFolderOpen(true)}
          >
            <FolderPlus className="h-4 w-4 mr-1" />
            New Folder
          </Button>
          <Button
            size="sm"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-1" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowUploadFolderConfirm(true)}
            disabled={uploading}
          >
            <FolderUp className="h-4 w-4 mr-1" />
            {folderUploadProgress
              ? `Uploading ${folderUploadProgress.current}/${folderUploadProgress.total}...`
              : 'Upload Folder'}
          </Button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf,.xlsx,.xlsm,.bak"
          />
          <input
            id="folder-upload"
            type="file"
            className="hidden"
            {...({ webkitdirectory: '', directory: '', multiple: true } as React.InputHTMLAttributes<HTMLInputElement>)}
            onChange={handleFolderUpload}
          />
        </div>
      </div>

      <CustomPopup
        isOpen={showUploadFolderConfirm}
        onClose={() => setShowUploadFolderConfirm(false)}
        type="confirm"
        title="Upload folder"
        message="You'll choose a folder from your device. All files inside will be uploaded here, keeping the same folder structure. If your browser shows another confirmation for large folders, click Upload to continue."
        confirmText="Choose folder"
        cancelText="Cancel"
        onConfirm={() => {
          setShowUploadFolderConfirm(false)
          document.getElementById('folder-upload')?.click()
        }}
      />

      {localOnlyMessage && (
        <div className="rounded-lg border border-amber/50 bg-amber/10 p-4 text-sm text-foreground">
          <p className="font-medium text-amber mb-1">Available only when running the app on your computer</p>
          <p className="text-muted-foreground">{localOnlyMessage}</p>
        </div>
      )}

      {uploadMessage === 'success' && (
        <p className="text-sm text-green-500">
          Upload complete. Files are in {currentPath}
        </p>
      )}
      {uploadMessage === 'error' && actionError && (
        <p className="text-sm text-destructive">{actionError}</p>
      )}
      {actionError && !uploadMessage && (
        <p className="text-sm text-destructive">{actionError}</p>
      )}

      {/* Full path (for reference) */}
      <div className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded border border-border font-mono break-all">
        {currentPath}
      </div>

      {/* File List - folders first (click to open and add content), then files */}
      <div className="border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">Loading...</div>
        ) : folders.length === 0 && files.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {localOnlyMessage
              ? localOnlyMessage
              : 'No files or folders yet. Create a folder or upload a file in this location.'}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Folders - click to open folder and add documents there */}
            {folders.map((folder) => (
              <div
                key={folder.path}
                className="flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors group"
              >
                <div
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => setCurrentPath(folder.path)}
                >
                  <Folder className="h-5 w-5 text-amber shrink-0" />
                  <span className="font-medium truncate">{folder.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">(click to open)</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 mr-2">
                  {new Date(folder.modified).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      openRename(folder, 'folder')
                    }}
                    title="Rename folder"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      openDelete(folder, 'folder')
                    }}
                    title="Delete folder"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Files */}
            {files.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(file.extension)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {new Date(file.modified).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(file)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => openRename(file, 'file')}
                    title="Rename file"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => openDelete(file, 'file')}
                    title="Delete file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back Button */}
      {currentPath !== jobFolderPath && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const parentPath = currentPath.split('\\').slice(0, -1).join('\\')
            setCurrentPath(parentPath || jobFolderPath)
          }}
        >
          ← Back to Parent Folder
        </Button>
      )}

      {/* New Folder Dialog */}
      <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder()
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog
        open={!!renameTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRenameTarget(null)
            setRenameValue('')
            setActionError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {renameTarget?.type === 'folder' ? 'Folder' : 'File'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {actionError && (
              <p className="text-sm text-destructive">{actionError}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="renameValue">New name</Label>
              <Input
                id="renameValue"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Enter new name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename()
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRenameTarget(null)
                setRenameValue('')
                setActionError(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setActionError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.type === 'folder' ? 'Folder' : 'File'}?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {actionError && (
              <p className="text-sm text-destructive">{actionError}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              {deleteTarget?.type === 'folder' && ' This will remove all contents inside the folder.'}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteTarget(null)
                setActionError(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
