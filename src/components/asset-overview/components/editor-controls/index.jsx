import React, { useContext } from 'react'
import {
  AssetMetaFieldNames,
  CollectionNames,
} from '../../../../hooks/useDatabaseQuery'
import EditorRecordManager from '../../../editor-record-manager'
import TabContext from '../../context'
import Control from '../control'

export default () => {
  const { assetId, asset, isLoading, hydrate } = useContext(TabContext)

  if (isLoading) {
    return null
  }

  return (
    <Control>
      <EditorRecordManager
        id={assetId}
        collectionName={CollectionNames.Assets}
        metaCollectionName={CollectionNames.AssetMeta}
        existingApprovalStatus={asset[AssetMetaFieldNames.approvalStatus]}
        existingPublishStatus={asset[AssetMetaFieldNames.publishStatus]}
        existingAccessStatus={asset[AssetMetaFieldNames.accessStatus]}
        existingEditorNotes={asset[AssetMetaFieldNames.editorNotes]}
        onDone={() => hydrate()}
      />
    </Control>
  )
}
