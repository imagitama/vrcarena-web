import React from 'react'
import { OrderDirections } from '@/hooks/useDatabaseQuery'
import {
  FullHistoryEntry,
  HistoryEntry,
  ViewNames,
  createMessage,
  editMessage,
} from '@/modules/history'
import HistoryResults from '@/components/history-results'

import { CollectionNames as UsersCollectionNames } from '@/modules/users'
import { CollectionNames as AssetsCollectionNames } from '@/modules/assets'
import PaginatedView from '@/components/paginated-view'
import { Filter, FilterSubType, FilterType } from '@/filters'
import useQueryParam from '@/hooks/useQueryParam'

const Renderer = ({ items }: { items?: FullHistoryEntry[] }) => {
  const highlightedEntryId = useQueryParam('entryId')
  return (
    <HistoryResults
      results={items!}
      highlightedEntryId={highlightedEntryId || undefined}
    />
  )
}

const History = () => {
  const createdByUserId = useQueryParam('userId')
  const parentType = useQueryParam('parentType')
  const parentId = useQueryParam('parentId')

  const filters: Filter<HistoryEntry>[] = [
    {
      fieldName: 'createdby',
      type: FilterType.Equal,
      subType: FilterSubType.UserId,
      label: 'Logged By',
      defaultValue: createdByUserId,
      defaultActive: createdByUserId !== null,
    },
    {
      fieldName: 'parenttable',
      type: FilterType.Equal,
      label: 'Parent Type',
      suggestions: [UsersCollectionNames.Users, AssetsCollectionNames.Assets],
      defaultValue: parentType,
      defaultActive: parentType !== null,
    },
    {
      fieldName: 'parent',
      type: FilterType.Equal,
      label: 'Parent ID',
      defaultValue: parentId,
      defaultActive: parentId !== null,
    },
    {
      fieldName: 'message',
      type: FilterType.Equal,
      label: 'Message',
      suggestions: [createMessage, editMessage],
    },
  ]

  return (
    <PaginatedView
      viewName={ViewNames.GetFullHistory}
      name="admin-history"
      sortOptions={[{ fieldName: 'createdat', label: 'Date' }]}
      defaultFieldName="createdat"
      defaultDirection={OrderDirections.DESC}
      filters={filters}>
      <Renderer />
    </PaginatedView>
  )
}

export default History
