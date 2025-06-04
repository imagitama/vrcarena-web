import React, { useState } from 'react'
import {
  Operators,
  OrderDirections,
  WhereClause,
  WhereOperators,
} from '../../../../hooks/useDatabaseQuery'
import {
  AssetSyncQueueItem,
  AssetSyncStatus,
  ViewNames,
} from '../../../../modules/assets'
import AssetSyncQueue from '../../../../components/asset-sync-queue'
import PaginatedView, {
  RendererProps,
} from '../../../../components/paginated-view'
import ButtonDropdown from '../../../../components/button-dropdown'

const Renderer = ({ items, hydrate }: RendererProps<AssetSyncQueueItem>) => (
  <AssetSyncQueue items={items!} hydrate={hydrate} showMoreInfo />
)

const AdminAssetSyncQueue = () => {
  const [selectedStatuses, setSelectedStatuses] = useState<AssetSyncStatus[]>([
    AssetSyncStatus.Waiting,
    AssetSyncStatus.Processing,
  ])

  const whereClauses: WhereClause<AssetSyncQueueItem>[] = selectedStatuses
    .map((item) => ['status', Operators.EQUALS, item])
    .reduce((currentClauses, whereClause, i) => {
      // @ts-ignore
      const newClauses = currentClauses.concat([whereClause])

      if (i !== selectedStatuses.length - 1) {
        // @ts-ignore
        newClauses.push(WhereOperators.OR)
      }

      return newClauses
    }, [] as WhereClause<AssetSyncQueueItem>[])

  return (
    <>
      <ButtonDropdown
        label="Status"
        options={Object.values(AssetSyncStatus).map((item) => ({
          id: item,
          label: item,
        }))}
        selectedIds={selectedStatuses}
        onSelect={(id) =>
          setSelectedStatuses(
            selectedStatuses.includes(id as AssetSyncStatus)
              ? selectedStatuses.filter((item) => item !== id)
              : selectedStatuses.concat(id as AssetSyncStatus)
          )
        }
      />
      <PaginatedView<AssetSyncQueueItem>
        whereClauses={whereClauses}
        viewName={ViewNames.GetFullMyAssetSyncQueuedItems}
        defaultFieldName="createdat"
        defaultDirection={OrderDirections.ASC}
        // max limit of realtime connections
        limit={100}>
        {/* @ts-ignore */}
        <Renderer />
      </PaginatedView>
    </>
  )
}

export default AdminAssetSyncQueue
