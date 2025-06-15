import React from 'react'
import { OrderDirections } from '../../../../hooks/useDatabaseQuery'
import {
  AssetSyncQueueItem,
  AssetSyncStatus,
  ViewNames,
} from '../../../../modules/assetsyncqueue'
import AssetSyncQueue from '../../../../components/asset-sync-queue'
import PaginatedView, {
  RendererProps,
} from '../../../../components/paginated-view'
import { FilterType, MultichoiceFilter } from '../../../../filters'

const Renderer = ({ items, hydrate }: RendererProps<AssetSyncQueueItem>) => (
  <AssetSyncQueue items={items!} hydrate={hydrate} showMoreInfo />
)

const AdminAssetSyncQueue = () => (
  <PaginatedView<AssetSyncQueueItem>
    viewName={ViewNames.GetFullMyAssetSyncQueuedItems}
    defaultFieldName="createdat"
    defaultDirection={OrderDirections.ASC}
    // max limit of realtime connections
    limit={100}
    filters={[
      {
        fieldName: 'status',
        type: FilterType.Multichoice,
        options: [
          AssetSyncStatus.Failed,
          AssetSyncStatus.Processing,
          AssetSyncStatus.Success,
          AssetSyncStatus.Waiting,
        ],
        defaultActive: true,
        defaultValue: [AssetSyncStatus.Processing, AssetSyncStatus.Waiting],
      } as MultichoiceFilter<AssetSyncQueueItem, AssetSyncStatus>,
    ]}>
    {/* @ts-ignore */}
    <Renderer />
  </PaginatedView>
)

export default AdminAssetSyncQueue
