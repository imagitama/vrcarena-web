import React, { useContext, useState } from 'react'
import EditorRecordManager from '../../../editor-record-manager'
import TabContext from '../../context'
import Control from '../control'
import { CollectionNames } from '../../../../modules/assets'
import Button from '@/components/button'
import AssetEditorMini from '@/components/asset-editor-mini'
import EditorBox from '@/components/editor-box'
import Heading from '@/components/heading'
import Dialog from '@/components/dialog'

const QuickEditor = ({
  onClose,
  assetId,
}: {
  onClose: () => void
  assetId: string
}) => (
  <Dialog onClose={onClose}>
    <Heading variant="h2" noTopMargin>
      Quick Edit Asset
    </Heading>
    <AssetEditorMini assetId={assetId} onDone={onClose} />
  </Dialog>
)

export default () => {
  const [isQuickEditing, setIsQuickEditing] = useState(false)
  const { assetId, asset, isLoading, hydrate } = useContext(TabContext)

  if (isLoading || !asset) {
    return null
  }

  return (
    <Control>
      <EditorBox>
        <Button
          onClick={() => setIsQuickEditing((currentVal) => !currentVal)}
          color="secondary">
          Admin Quick Edit
        </Button>
      </EditorBox>
      {isQuickEditing ? (
        <QuickEditor
          assetId={assetId}
          onClose={() => setIsQuickEditing(false)}
        />
      ) : null}
      <br />
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
    </Control>
  )
}
