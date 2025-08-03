import React from 'react'
import Link from '../link'
import * as routes from '../../routes'
import useIsEditor from '../../hooks/useIsEditor'
import useDataStoreItems from '../../hooks/useDataStoreItems'
import {
  AdminQueueItem,
  AdminQueueItemType,
  ViewNames,
} from '../../modules/admin-queue'
import ErrorMessage from '../error-message'
import Message from '../message'

const UnapprovedAssetsMessage = () => {
  const isEditor = useIsEditor()
  const [isLoading, lastErrorCode, queueItems] =
    useDataStoreItems<AdminQueueItem>(
      ViewNames.GetAdminQueue,
      isEditor ? undefined : false
    )

  if (!isEditor || isLoading || !queueItems || !queueItems.length) {
    return null
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to get admin queue (code {lastErrorCode})
      </ErrorMessage>
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
    <Message title="Editor Message">
      There are {queueItems.length} items in the admin queue ({tally.assets}{' '}
      assets, {tally.amendments} amendments, {tally.reports} reports,{' '}
      {tally.avatars} avatars). Click <Link to={routes.admin}>here</Link> to
      review.
    </Message>
  )
}

export default UnapprovedAssetsMessage
