import React from 'react'
import { makeStyles } from '@mui/styles'
import LoyaltyIcon from '@mui/icons-material/Loyalty'
import { Helmet } from '@unhead/react/helmet'

import useDataStoreItem from '@/hooks/useDataStoreItem'
import {
  FullAttachment,
  CollectionNames,
  ViewNames,
  AttachmentReason,
  isFullAttachment,
} from '@/modules/attachments'
import useIsEditor from '@/hooks/useIsEditor'
import * as routes from '@/routes'
import { CollectionNames as AssetCollectionNames } from '@/modules/assets'
import useIsAdultContentEnabled from '@/hooks/useIsAdultContentEnabled'
import useDatabaseQuery, { Operators } from '@/hooks/useDatabaseQuery'
import {
  ImageConvertQueueItem,
  CollectionNames as ImageConvertQueueCollectionNames,
} from '@/modules/imageconvertqueue'

import LoadingIndicator from '@/components/loading-indicator'
import NoResultsMessage from '@/components/no-results-message'
import AttachmentOutput from '@/components/attachment'
import ErrorMessage from '@/components/error-message'
import EditorRecordManager from '@/components/editor-record-manager'
import PublicEditorNotes from '@/components/public-editor-notes'
import Heading from '@/components/heading'
import Link from '@/components/link'
import TagChips from '@/components/tag-chips'
import Paper from '@/components/paper'
import FormattedDate from '@/components/formatted-date'
import AdultContentGate from '@/components/adult-content-gate'
import useAdultContentGate from '@/hooks/useAdultContentGate'
import Markdown from '@/components/markdown'
import InfoMessage from '@/components/info-message'
import { AccessStatus } from '@/modules/common'

const useStyles = makeStyles({
  output: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  caption: {},
})

const getLabelForReason = (reason: AttachmentReason): string => {
  switch (reason) {
    case AttachmentReason.AssetFile:
      return 'Asset Attachment'
    case AttachmentReason.Tutorial:
      return 'Tutorial'
    case AttachmentReason.UserAdded:
      return 'User Upload'
    default:
      return 'Attachment'
  }
}

const getParentLink = (parentTable: string, parentId: string): string => {
  switch (parentTable) {
    case AssetCollectionNames.Assets:
      return routes.viewAssetWithVar.replace(':assetId', parentId)
    default:
      return '#error'
  }
}

const getParentLabel = (parentTable: string, parentId: string): string => {
  switch (parentTable) {
    case AssetCollectionNames.Assets:
      return 'asset'
    default:
      return 'error'
  }
}

const AttachmentOverview = ({ attachmentId }: { attachmentId: string }) => {
  const [isLoading, lastErrorCode, attachment, hydrate] =
    useDataStoreItem<FullAttachment>(ViewNames.GetFullAttachments, attachmentId)
  const isEditor = useIsEditor()
  const classes = useStyles()
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const [allowContent] = useAdultContentGate(`attachment_${attachmentId}`)
  const [, , imageConvertQueueItems] = useDatabaseQuery<ImageConvertQueueItem>(
    ImageConvertQueueCollectionNames.ImageConvertQueue,
    isEditor
      ? [
          ['parenttable', Operators.EQUALS, CollectionNames.Attachments],
          ['parent', Operators.EQUALS, attachmentId],
        ]
      : false
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading attachment..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load attachment (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!attachment) {
    return <NoResultsMessage>Attachment not found</NoResultsMessage>
  }

  if (attachment.isadult && !isAdultContentEnabled && !allowContent) {
    return <AdultContentGate toggleId={`attachment_${attachmentId}`} />
  }

  return (
    <>
      <Helmet>
        <title>
          {attachment.title || `Attachment by ${attachment.createdbyusername}`}
        </title>
        <meta
          name="description"
          content={
            attachment.description ||
            'An attachment for an asset or other thing.'
          }
        />
      </Helmet>
      {attachment.accessstatus === AccessStatus.Deleted && (
        <ErrorMessage>
          This attachment has been deleted and will not show anywhere on the
          site.
        </ErrorMessage>
      )}
      {attachment.editornotes && (
        <PublicEditorNotes notes={attachment.editornotes} />
      )}
      {attachment.title && (
        <Heading variant="h1">
          <Link
            to={routes.viewAttachmentWithVar.replace(
              ':attachmentId',
              attachment.id
            )}>
            {attachment.title} {attachment.isadult ? <LoyaltyIcon /> : null}
          </Link>
        </Heading>
      )}
      <Heading variant="h2" noTopMargin>
        {getLabelForReason(attachment.reason)}
      </Heading>
      <div className={classes.output}>
        <AttachmentOutput attachment={attachment} />
      </div>
      {attachment.description ? (
        <Paper>
          <Markdown source={attachment.description} />
        </Paper>
      ) : null}
      <Paper noMargin={!attachment.description}>
        Posted <FormattedDate date={attachment.createdat} /> by{' '}
        <Link
          to={routes.viewUserWithVar.replace(':userId', attachment.createdby)}>
          {isFullAttachment(attachment)
            ? attachment.createdbyusername
            : '(no name)'}
        </Link>{' '}
        {attachment.parenttable && attachment.parentid ? (
          <>
            {' '}
            for{' '}
            <Link
              to={getParentLink(attachment.parenttable, attachment.parentid)}>
              {getParentLabel(attachment.parenttable, attachment.parentid)}
            </Link>
          </>
        ) : null}
        {attachment.tags && attachment.tags.length ? (
          <>
            <br />
            <br />
            <TagChips tags={attachment.tags} />
          </>
        ) : null}
      </Paper>
      {isEditor && (
        <>
          <br />
          <br />
          <EditorRecordManager
            editUrl={routes.editAttachmentWithVar.replace(
              ':attachmentId',
              attachment.id
            )}
            id={attachment.id}
            metaCollectionName={CollectionNames.AttachmentsMeta}
            existingApprovalStatus={attachment.approvalstatus}
            existingAccessStatus={attachment.accessstatus}
            existingEditorNotes={attachment.editornotes}
            showPublishButtons={false}
            showStatuses
            onDone={hydrate}
            comments="Note: Attachments waiting for approval are still public"
          />
          {imageConvertQueueItems && imageConvertQueueItems.length ? (
            <InfoMessage>
              Image convert queue: {imageConvertQueueItems[0].status}
            </InfoMessage>
          ) : null}
        </>
      )}
    </>
  )
}

export default AttachmentOverview
