'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Folder,
  FileText,
  Image,
  Download,
  Upload,
  FolderPlus,
  File,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

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

  useEffect(() => {
    loadFiles()
  }, [currentPath])

  const loadFiles = async () => {
    setLoading(true)
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
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
      event.target.value = ''
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
      }
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }

  const getFileIcon = (extension: string) => {
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(extension)) {
      return <Image className="h-5 w-5 text-blue-400" />
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-sm text-muted-foreground">Files & Folders</Label>
        <div className="flex gap-2">
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
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
          />
        </div>
      </div>

      {/* Current Path */}
      <div className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded border border-border font-mono break-all">
        {currentPath}
      </div>

      {/* File List */}
      <div className="border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">Loading...</div>
        ) : folders.length === 0 && files.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No files or folders yet. Upload a file or create a folder to get started.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Folders */}
            {folders.map((folder) => (
              <div
                key={folder.path}
                className="flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => setCurrentPath(folder.path)}
              >
                <div className="flex items-center gap-3">
                  <Folder className="h-5 w-5 text-amber" />
                  <span className="font-medium">{folder.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(folder.modified).toLocaleDateString()}
                </span>
              </div>
            ))}

            {/* Files */}
            {files.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
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
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(file)}
                >
                  <Download className="h-4 w-4" />
                </Button>
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
    </div>
  )
}
