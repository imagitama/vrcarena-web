import React from 'react'
import AssetEditor from '@/components/asset-editor'
import Dialog from '@/components/dialog'

const AssetEditorDialog = ({
  onClose,
  assetId,
}: {
  onClose: () => void
  assetId: string
}) => (
  <Dialog onClose={onClose} fullWidth maxWidth={false}>
    <AssetEditor assetId={assetId} onDone={onClose} />
  </Dialog>
)

export default AssetEditorDialog
