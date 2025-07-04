import React from 'react'
import { makeStyles } from '@mui/styles'
import LoyaltyIcon from '@mui/icons-material/Loyalty'
import { Helmet } from 'react-helmet'

import useDataStoreItem from '../../hooks/useDataStoreItem'
import {
  FullAttachment,
  CollectionNames,
  ViewNames,
  AttachmentReason,
  isFullAttachment,
} from '../../modules/attachments'
import LoadingIndicator from '../loading-indicator'
import NoResultsMessage from '../no-results-message'
import AttachmentOutput from '../attachment'
import ErrorMessage from '../error-message'
import EditorRecordManager from '../editor-record-manager'
import useIsEditor from '../../hooks/useIsEditor'
import PublicEditorNotes from '../public-editor-notes'
import Heading from '../heading'
import Link from '../link'
import * as routes from '../../routes'
import TagChips from '../tag-chips'
import { CollectionNames as AssetCollectionNames } from '../../modules/assets'
import Paper from '../paper'
import FormattedDate from '../formatted-date'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import AdultContentGate from '../adult-content-gate'
import useAdultContentGate from '../../hooks/useAdultContentGate'
import Markdown from '../markdown'
import InfoMessage from '../info-message'
import useDatabaseQuery, { Operators } from '../../hooks/useDatabaseQuery'
import {
  ImageConvertQueueItem,
  CollectionNames as ImageConvertQueueCollectionNames,
} from '../../modules/imageconvertqueue'

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
          {attachment.title || `Tutorial by ${attachment.createdbyusername}`} |
          VRCArena
        </title>
        <meta
          name="description"
          content={attachment.description || 'View this tutorial.'}
        />
      </Helmet>
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
      <Paper margin={!!attachment.description}>
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
