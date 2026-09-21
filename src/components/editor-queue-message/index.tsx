import React from 'react'

import * as routes from '@/routes'
import {
  AdminQueueItem,
  AdminQueueItemType,
  ViewNames,
} from '@/modules/admin-queue'

import useIsEditor from '@/hooks/useIsEditor'
import useDataStoreItems from '@/hooks/useDataStoreItems'

import Link from '@/components/link'
import ErrorMessage from '@/components/error-message'
import Message from '@/components/message'
import useUserRecord from '@/hooks/useUserRecord'
import { SubEditorStatus } from '@/modules/users'

const EditorQueueMessage = () => {
  const isEditor = useIsEditor()
  const [, , user] = useUserRecord()
  const isAllowed =
    isEditor || user?.subeditorstatus === SubEditorStatus.Accepted
  const [isLoading, lastErrorCode, queueItems] =
    useDataStoreItems<AdminQueueItem>(
      ViewNames.GetAdminQueue,
      isAllowed ? undefined : false
    )

  if (!isAllowed || isLoading || !queueItems || !queueItems.length) {
    return null
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage errorCode={lastErrorCode}>Failed to get queue</ErrorMessage>
    )
  }

  const tally = queueItems.reduce(
    (currentTally, queueItem) => {
      switch (queueItem.type) {
        case AdminQueueItemType.Amendment:
          return {
            ...currentTally,
            amendments: currentTally.amendments + 1,
          }
        case AdminQueueItemType.Asset:
          return {
            ...currentTally,
            assets: currentTally.assets + 1,
          }
        case AdminQueueItemType.Report:
          return {
            ...currentTally,
            reports: currentTally.reports + 1,
          }
        case AdminQueueItemType.Avatar:
          return {
            ...currentTally,
            avatars: currentTally.avatars + 1,
          }
        default:
          throw new Error(`Unexpected type: ${(queueItem as any).type}`)
      }
    },
    {
      assets: 0,
      amendments: 0,
      reports: 0,
      avatars: 0,
    }
  )

  return (
    <Message title={`${isEditor ? 'Editor' : 'Community Editor'} Message`}>
      There are {queueItems.length} items in the queue ({tally.assets} assets,{' '}
      {tally.amendments} amendments, {tally.reports} reports, {tally.avatars}{' '}
      avatars). Click{' '}
      <Link to={isEditor ? routes.admin : routes.queue}>here</Link> to review.
    </Message>
  )
}

export default EditorQueueMessage
