import React from 'react'
import AssetEditor from '../asset-editor'
import Dialog from '../dialog'

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
