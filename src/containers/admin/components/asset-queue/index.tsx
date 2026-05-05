import React from 'react'
import { Operators, OrderDirections } from '@/hooks/useDatabaseQuery'
import {
  AssetSyncQueueItem,
  QueueStatus,
  CollectionNames,
} from '@/modules/assetsyncqueue'
import AssetSyncQueue from '@/components/asset-sync-queue'
import PaginatedView, { RendererProps } from '@/components/paginated-view'
import { FilterSubType, FilterType, MultichoiceFilter } from '@/filters'
import useUserId from '@/hooks/useUserId'

const Renderer = ({ items, hydrate }: RendererProps<AssetSyncQueueItem>) => (
  <AssetSyncQueue items={items!} hydrate={hydrate} showMoreInfo />
)

const AdminAssetSyncQueue = () => {
  const myUserId = useUserId()
  return (
    <PaginatedView<AssetSyncQueueItem>
      viewName={CollectionNames.AssetSyncQueue}
      defaultFieldName="createdat"
      defaultDirection={OrderDirections.DESC}
      // max limit of realtime connections
      limit={100}
      filters={[
        {
          fieldName: 'createdby',
          label: 'User',
          type: FilterType.Equal,
          subType: FilterSubType.UserId,
        },
        {
          fieldName: 'status',
          type: FilterType.Multichoice,
          options: [
            QueueStatus.Failed,
            QueueStatus.Processing,
            QueueStatus.Processed,
            QueueStatus.Queued,
          ],
          defaultActive: true,
          defaultValue: [QueueStatus.Processing, QueueStatus.Queued],
        } as MultichoiceFilter<AssetSyncQueueItem, QueueStatus>,
      ]}>
      {/* @ts-ignore */}
      <Renderer />
    </PaginatedView>
  )
}

export default AdminAssetSyncQueue
