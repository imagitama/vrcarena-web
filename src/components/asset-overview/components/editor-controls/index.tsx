import React, { useContext } from 'react'
import EditorRecordManager from '@/components/editor-record-manager'
import TabContext from '../../context'
import Control from '../control'
import { CollectionNames, FullAsset_Editor } from '@/modules/assets'
import AiEvaluationResult from '@/components/ai-evaluation-result'
import ErrorBoundary from '@/components/error-boundary'

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
        metaCollectionName={CollectionNames.AssetsMeta}
        existingApprovalStatus={asset.approvalstatus}
        existingPublishStatus={asset.publishstatus}
        existingAccessStatus={asset.accessstatus}
        existingEditorNotes={asset.editornotes}
        // assets
        existingDeletionReason={asset.deletionreason}
        existingArchivedReason={asset.archivedreason}
        existingDeclinedReasons={asset.declinedreasons}
        onDone={() => hydrate()}
        showStatuses
        showPublishButtons
        showFeatureButtons={false}
        showAccessButtons
        showArchiveButton
      />
      <br />
      <ErrorBoundary>
        <AiEvaluationResult asset={asset as FullAsset_Editor} />
      </ErrorBoundary>
    </Control>
  )
}
