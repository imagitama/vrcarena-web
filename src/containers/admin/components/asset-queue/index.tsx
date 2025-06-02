import React, { useState } from 'react'
import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '../../../../hooks/useDatabaseQuery'
import {
  AssetSyncQueueItem,
  AssetSyncStatus,
  ViewNames,
} from '../../../../modules/assets'
import AssetSyncQueue from '../../../../components/asset-sync-queue'
import Button from '../../../../components/button'

const AdminAssetSyncQueue = () => {
  const [isAllShown, setIsAllShown] = useState(false)
  const [isLoading, lastErrorCode, queuedItems, hydrate] =
    useDatabaseQuery<AssetSyncQueueItem>(
      ViewNames.GetFullMyAssetSyncQueuedItems,
      isAllShown ? [] : [['status', Operators.EQUALS, AssetSyncStatus.Waiting]],
      {
        queryName: 'get-full-sync-queued-items',
        orderBy: ['createdat', OrderDirections.DESC],
      }
    )

  return (
    <>
      <Button checked={isAllShown} onClick={() => setIsAllShown(!isAllShown)}>
        Show All
      </Button>
      <AssetSyncQueue
        isLoading={isLoading}
        lastErrorCode={lastErrorCode}
        items={queuedItems}
        hydrate={hydrate}
        showMoreInfo
      />
    </>
  )
}

export default AdminAssetSyncQueue
