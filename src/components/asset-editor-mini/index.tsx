import React from 'react'
import { CollectionNames } from '../../modules/assets'
import GenericEditor from '../generic-editor'

const AssetEditorMini = ({
  assetId,
  onDone,
}: {
  assetId: string
  onDone: () => void
}) => {
  return (
    <GenericEditor
      isAccordion
      collectionName={CollectionNames.Assets}
      id={assetId}
      onDone={onDone}
      saveBtnRecordType="Asset"
    />
  )
}

export default AssetEditorMini
