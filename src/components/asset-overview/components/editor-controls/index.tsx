import React, { useContext } from 'react'
import { CollectionNames } from '../../../../hooks/useDatabaseQuery'
import EditorRecordManager from '../../../editor-record-manager'
import TabContext from '../../context'
import Control from '../control'

export default () => {
  const { assetId, asset, isLoading, hydrate } = useContext(TabContext)

  if (isLoading || !asset) {
    return null
  }

  return (
    <Control>
      <EditorRecordManager
        id={assetId}
        collectionName={CollectionNames.Assets}
        metaCollectionName={CollectionNames.AssetMeta}
        existingApprovalStatus={asset.approvalstatus}
        existingPublishStatus={asset.publishstatus}
        existingAccessStatus={asset.accessstatus}
        existingEditorNotes={asset.editornotes}
        // assets
        existingArchivedReason={asset.archivedreason}
        existingDeclinedReasons={asset.declinedreasons}
        onDone={() => hydrate()}
        showStatuses
        showPublishButtons
        showFeatureButtons={false}
        showAccessButtons
        showArchiveButton
      />
    </Control>
  )
}
