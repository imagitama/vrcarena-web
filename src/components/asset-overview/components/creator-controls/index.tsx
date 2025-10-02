import React, { useContext, useState } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import Button from '../../../button'
import TabContext from '../../context'
import Control from '../control'
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
      <Control>
        <Button
          onClick={() => setIsQuickEditing((currentVal) => !currentVal)}
          color="secondary"
          icon={<EditIcon />}>
          Edit Asset
        </Button>
      </Control>
      {isQuickEditing && (
        <AssetEditorDialog assetId={assetId} onClose={onDoneEditing} />
      )}
    </>
  )
}
