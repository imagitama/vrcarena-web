import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { CollectionNames, FullAsset } from '../../modules/assets'
import EditorBox from '../editor-box'
import UsernameLink from '../username-link'
import FormattedDate from '../formatted-date'
import EditorRecordManager from '../editor-record-manager'
import useIsEditor from '../../hooks/useIsEditor'
import Message from '../message'

const QueuedAssetInfo = ({
  asset,
  hydrate,
}: {
  asset: FullAsset
  hydrate?: () => void
}) => {
  const isEditor = useIsEditor()
  return (
    <Message title="Queued Asset">
      Published by{' '}
      <UsernameLink
        id={asset.publishedby}
        username={asset.publishedbyusername}
      />{' '}
      <FormattedDate date={asset.publishedat} />
      {isEditor ? (
        <EditorRecordManager
          id={asset.id}
          collectionName={CollectionNames.Assets}
          metaCollectionName={CollectionNames.AssetsMeta}
          existingApprovalStatus={asset.approvalstatus}
          existingPublishStatus={asset.publishstatus}
          existingAccessStatus={asset.accessstatus}
          existingEditorNotes={asset.editornotes}
          onDone={hydrate}
          showBox={false}
          allowDeclineOptions={true}
        />
      ) : null}
    </Message>
  )
}

export default QueuedAssetInfo
