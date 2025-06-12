import React from 'react'
import { OrderDirections } from '../../../../hooks/useDatabaseQuery'
import {
  FullHistoryEntry,
  HistoryEntry,
  ViewNames,
  createMessage,
  editMessage,
} from '../../../../modules/history'
import HistoryResults from '../../../../components/history-results'

import { CollectionNames as UsersCollectionNames } from '../../../../modules/user'
import { CollectionNames as AssetsCollectionNames } from '../../../../modules/assets'
import PaginatedView from '../../../../components/paginated-view'
import { Filter, FilterSubType, FilterType } from '../../../../filters'

const filters: Filter<HistoryEntry>[] = [
  {
    fieldName: 'createdby',
    type: FilterType.Equal,
    subType: FilterSubType.UserId,
    label: 'Logged By',
  },
  {
    fieldName: 'parenttable',
    type: FilterType.Equal,
    label: 'Parent Type',
    suggestions: [UsersCollectionNames.Users, AssetsCollectionNames.Assets],
  },
  {
    fieldName: 'parent',
    type: FilterType.Equal,
    label: 'Parent ID',
  },
  {
    fieldName: 'message',
    type: FilterType.Equal,
    label: 'Message',
    suggestions: [createMessage, editMessage],
  },
]

const Renderer = ({ items }: { items?: FullHistoryEntry[] }) => (
  <HistoryResults results={items!} />
)

const History = () => {
  return (
    <>
      <PaginatedView
        viewName={ViewNames.GetFullHistory}
        name="admin-history"
        sortOptions={[{ fieldName: 'createdat', label: 'Date' }]}
        defaultFieldName="createdat"
        defaultDirection={OrderDirections.DESC}
        filters={filters}>
        <Renderer />
      </PaginatedView>
    </>
  )
}

export default History
