import React, { useState } from 'react'
import EditIcon from '@material-ui/icons/Edit'

import { CollectionNames, FullAsset } from '../../modules/assets'
import UsernameLink from '../username-link'
import FormattedDate from '../formatted-date'
import EditorRecordManager from '../editor-record-manager'
import useIsEditor from '../../hooks/useIsEditor'
import Message from '../message'
import Button from '../button'
import InlineAssetEditor from '../inline-asset-editor'
import Heading from '../heading'

const QueuedAssetInfo = ({
  asset,
  hydrate,
}: {
  asset: FullAsset
  hydrate: () => void
}) => {
  const isEditor = useIsEditor()
  const [isEditing, setIsEditing] = useState(false)

  return (
    <Message title="Queued Asset">
      Published by{' '}
      <UsernameLink
        id={asset.publishedby}
        username={asset.publishedbyusername}
      />{' '}
      <FormattedDate date={asset.publishedat} />
      {isEditor ? (
        <>
          <br />
          <br />
          <Button
            onClick={() => setIsEditing(true)}
            color="default"
            icon={<EditIcon />}>
            Inline Edit
          </Button>
          <br />
          <br />
          {isEditing && (
            <InlineAssetEditor
              asset={asset}
              onDone={() => {
                setIsEditing(false)
                hydrate()
              }}
              onCancel={() => setIsEditing(false)}
            />
          )}
          <EditorRecordManager
            id={asset.id}
            collectionName={CollectionNames.Assets}
            metaCollectionName={CollectionNames.AssetsMeta}
            existingApprovalStatus={asset.approvalstatus}
            existingPublishStatus={asset.publishstatus}
            existingAccessStatus={asset.accessstatus}
            existingEditorNotes={asset.editornotes}
            onDone={hydrate}
            allowDeclineOptions={true}
          />
        </>
      ) : null}
    </Message>
  )
}

export default QueuedAssetInfo
