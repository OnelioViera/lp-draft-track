'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'

interface CustomPopupProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error' | 'confirm'
  title: string
  message: string
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
}

export function CustomPopup({
  isOpen,
  onClose,
  type,
  title,
  message,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: CustomPopupProps) {
  const handleConfirm = () => {
    onConfirm?.()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {type === 'success' && (
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
            )}
            {type === 'error' && (
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
            )}
            {type === 'confirm' && (
              <div className="h-12 w-12 rounded-full bg-amber/20 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-amber" />
              </div>
            )}
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          {type === 'confirm' ? (
            <>
              <Button variant="outline" onClick={onClose}>
                {cancelText}
              </Button>
              <Button variant="destructive" onClick={handleConfirm}>
                {confirmText}
              </Button>
            </>
          ) : (
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
