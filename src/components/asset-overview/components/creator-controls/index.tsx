import React, { useContext, useState } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import Button from '@/components/button'
import TabContext from '../../context'
import AssetEditorDialog from '@/components/asset-editor-dialog'

export default () => {
  const { assetId, isLoading, hydrate } = useContext(TabContext)
  const [isQuickEditing, setIsQuickEditing] = useState(false)

  if (isLoading) {
    return null
  }

  const onDoneEditing = () => {
    hydrate()
    setIsQuickEditing(false)
  }

  return (
    <>
      <Button
        onClick={() => setIsQuickEditing((currentVal) => !currentVal)}
        color="secondary"
        hollow={false}
        icon={<EditIcon />}>
        Edit Asset
      </Button>
      {isQuickEditing && (
        <AssetEditorDialog assetId={assetId} onClose={onDoneEditing} />
      )}
    </>
  )
}
