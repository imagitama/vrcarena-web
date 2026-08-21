import React from 'react'
import LaunchIcon from '@mui/icons-material/Launch'

import {
  AttachmentType,
  AttachmentFields,
  CollectionNames as AttachmentsCollectionNames,
} from '@/modules/attachments'
import { getIsUrlAYoutubeVideo } from '@/utils'
import useDatabaseQuery, { Operators } from '@/hooks/useDatabaseQuery'
import {
  CollectionNames,
  ImageConvertQueueItem,
} from '@/modules/imageconvertqueue'

import VideoPlayer from '@/components/video-player'
import Button, { RefreshButton } from '@/components/button'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import QueueStatusLabel from '../queue-status-label'
import Paper from '../paper'
import FailureInfoOutput from '../failure-info-output'
import WarningMessage from '../warning-message'

const AttachmentImageConvertQueueOutput = ({
  attachmentId,
  onRefresh,
}: {
  attachmentId: string
  onRefresh: () => void
}) => {
  if (!attachmentId) throw new Error('Need attachment ID')

  const [isLoading, lastErrorCode, results, hydrate] =
    useDatabaseQuery<ImageConvertQueueItem>(CollectionNames.ImageConvertQueue, [
      ['parenttable', Operators.EQUALS, AttachmentsCollectionNames.Attachments],
      ['parent', Operators.EQUALS, attachmentId],
    ])

  const onClickRefresh = () => {
    hydrate()
    onRefresh()
  }

  if (isLoading) return <LoadingIndicator message="Loading queue items..." />

  if (lastErrorCode !== null)
    return (
      <ErrorMessage errorCode={lastErrorCode}>
        Failed to load queue items
      </ErrorMessage>
    )

  if (!results?.length)
    return (
      <ErrorMessage>
        Attachment has no URL but nothing is in the queue (this should not
        happen)
      </ErrorMessage>
    )

  const queuedItem = results[0]

  return (
    <>
      <WarningMessage>
        This attachment is in a queue to download, convert and upload it to our
        servers
      </WarningMessage>
      <Paper>
        <QueueStatusLabel id={queuedItem.id} status={queuedItem.status} />
        {queuedItem.failureinfo && (
          <FailureInfoOutput failureInfo={queuedItem.failureinfo} />
        )}
        {queuedItem.notes}
        <br />
        <br />
        <RefreshButton onClick={onClickRefresh}>Refresh</RefreshButton>
      </Paper>
    </>
  )
}

const Attachment = ({
  attachment: { type, url },
  showFileUrls = false,
  width = undefined,
  attachmentId,
  onRefresh,
}: {
  attachment: AttachmentFields
  showFileUrls?: boolean
  width?: string | number
  // for queue:
  attachmentId?: string
  onRefresh?: () => void
}) => {
  if (url === null)
    return (
      <AttachmentImageConvertQueueOutput
        onRefresh={onRefresh!}
        attachmentId={attachmentId!}
      />
    )

  switch (type) {
    case AttachmentType.Image:
      return <img src={url} width={width} />
    case AttachmentType.Url:
      if (getIsUrlAYoutubeVideo(url)) {
        return (
          <VideoPlayer
            url={url}
            config={{
              youtube: { playerVars: { autoplay: 1 } },
              file: { attributes: { autoPlay: true } },
            }}
            width={width}
          />
        )
      } else {
        return (
          <>
            {showFileUrls ? url : null}
            <Button
              url={url}
              size="large"
              icon={<LaunchIcon />}
              color="secondary">
              Visit Link
            </Button>
          </>
        )
      }
    default:
      return <Button url={url}>View File</Button>
  }
}

export default Attachment
