import React, { useRef } from 'react'
import AssetEditor from '@/components/asset-editor'
import Dialog from '@/components/dialog'
import { DialogContent } from '@mui/material'

const scrollToTopOfElement = (element: HTMLElement) =>
  element.scrollTo({ top: 0, behavior: 'smooth' })

const AssetEditorDialog = ({
  onClose,
  assetId,
}: {
  onClose: () => void
  assetId: string
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  return (
    <Dialog onClose={onClose} fullWidth maxWidth={false}>
      <DialogContent ref={dialogRef}>
        <AssetEditor
          assetId={assetId}
          onDone={onClose}
          onAttemptSave={() => {
            // TODO: do this less fragile like
            scrollToTopOfElement(dialogRef.current! as HTMLElement)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

export default AssetEditorDialog
