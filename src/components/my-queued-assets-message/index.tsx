import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import styled from '@emotion/styled'

import * as routes from '@/routes'
import {
  Decline as DeclineIcon,
  Quarantine as QuarantineIcon,
  Queue as QueueIcon,
} from '@/icons'
import { RootState } from '@/modules'
import { ApprovalStatus } from '@/modules/common'
import { AssetForList, ViewNames } from '@/modules/assets'

import useUserRecord from '@/hooks/useUserRecord'
import useDataStoreItems from '@/hooks/useDataStoreItems'

import Message from '@/components/message'
import WarningMessage from '@/components/warning-message'
import Button from '../button'

const Controls = styled.div`
  text-align: right;
`

const DraftAssetsMessage = () => {
  const [, , user] = useUserRecord()

  let [, , results, , hydrate] = useDataStoreItems<AssetForList>(
    ViewNames.GetMyQueuedAssets,
    user ? undefined : false,
    {
      queryName: 'my-queued-assets-message',
    }
  )

  // subscribe just so we get the forced re-render
  const publishedAssetCount = useSelector<RootState, number>(
    ({ app }) => app.publishedAssetCount
  )
  useEffect(() => {
    if (publishedAssetCount > 0) hydrate()
  }, [publishedAssetCount])

  if (!results || !results.length) {
    return null
  }

  const counts = results.reduce<{
    waiting: number
    declined: number
    quarantined: number
  }>(
    (counts, asset) => {
      switch (asset.approvalstatus) {
        case ApprovalStatus.Waiting:
          return {
            ...counts,
            waiting: counts.waiting + 1,
          }
        case ApprovalStatus.Declined:
          return {
            ...counts,
            declined: counts.declined + 1,
          }
        case ApprovalStatus.Quarantined:
          return {
            ...counts,
            quarantined: counts.quarantined + 1,
          }
        default:
          return counts
      }
    },
    {
      waiting: 0,
      declined: 0,
      quarantined: 0,
    }
  )

  if (results.length) {
    return (
      <>
        {counts.declined > 0 && (
          <WarningMessage icon={<DeclineIcon />}>
            {counts.declined} asset{counts.declined > 1 ? 's have' : ' has'}{' '}
            been declined by our staff. Please review the issues and if needed -
            un-publish the assets, make any necessary changes then publish them
            again. If you have any issues please open a support ticket or ask in
            our Discord server.
            <Controls>
              <Button
                url={routes.myAccountWithTabNameVarAndSubViewNameVar
                  .replace(':tabName', 'assets')
                  .replace(':subViewName', 'queued')}
                size="small"
                color="secondary"
                hollow>
                View Queue
              </Button>
            </Controls>
          </WarningMessage>
        )}
        {counts.quarantined > 0 && (
          <Message icon={<QuarantineIcon />}>
            {counts.quarantined} asset{counts.quarantined > 1 ? 's are' : ' is'}{' '}
            currently being reviewed by our staff members.
            <Controls>
              <Button
                url={routes.myAccountWithTabNameVarAndSubViewNameVar
                  .replace(':tabName', 'assets')
                  .replace(':subViewName', 'queued')}
                size="small"
                color="secondary"
                hollow>
                View Queue
              </Button>
            </Controls>
          </Message>
        )}
        <Message icon={<QueueIcon />}>
          You have {results.length} asset{results.length > 1 ? 's' : ''} in the
          approval queue. If your assets have not been approved within 48 hours,
          please open a support ticket or ask in our Discord server.
          <Controls>
            <Button
              url={routes.myAccountWithTabNameVarAndSubViewNameVar
                .replace(':tabName', 'assets')
                .replace(':subViewName', 'queued')}
              size="small"
              color="secondary"
              hollow>
              View Queue
            </Button>
          </Controls>
        </Message>
      </>
    )
  }
}

export default DraftAssetsMessage
