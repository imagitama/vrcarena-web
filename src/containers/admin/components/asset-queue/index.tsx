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
import InfoMessage from '../../../../components/info-message'
import { FilterType, MultichoiceFilter } from '../../../../filters'

const Renderer = ({ items, hydrate }: RendererProps<AssetSyncQueueItem>) => (
  <AssetSyncQueue items={items!} hydrate={hydrate} showMoreInfo />
)

const AdminAssetSyncQueue = () => (
  <>
    <InfoMessage title="How It Works">
      Users can add a source URL to the asset queue. When they do, the site
      automatically grabs the data from Gumroad, Booth, Itch or Jinxxy and
      creates an asset for them.
      <br />
      <br />
      Sometimes this system fails so you can see the queue here and manually
      re-trigger the grabbing.
    </InfoMessage>
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
  </>
)

export default AdminAssetSyncQueue
