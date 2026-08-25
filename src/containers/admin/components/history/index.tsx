import React, { useState } from 'react'
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
import Button from '@/components/button'
import Heading from '@/components/heading'
import { getIsNullOrEmpty } from '@/utils'

const Renderer = ({
  items,
  isAllExpanded,
}: {
  items?: FullHistoryEntry[]
  isAllExpanded: boolean
}) => {
  const highlightedEntryId = useQueryParam('entryId') // TODO: add to routelist so less guessing
  return (
    <HistoryResults
      results={items!}
      highlightedEntryId={highlightedEntryId || undefined}
      isAllExpanded={isAllExpanded}
    />
  )
}

const AdminHistory = () => {
  const createdByUserId = useQueryParam('userId')
  const parentType = useQueryParam('parentType')
  const parentId = useQueryParam('parentId')
  const [isAllExpanded, setIsAllExpanded] = useState(false)

  const filters: Filter<HistoryEntry>[] = [
    {
      fieldName: 'createdby',
      type: FilterType.Equal,
      subType: FilterSubType.UserId,
      label: 'Logged By',
      defaultValue: createdByUserId,
      defaultActive: !getIsNullOrEmpty(createdByUserId),
    },
    {
      fieldName: 'parenttable',
      type: FilterType.Equal,
      label: 'Parent Type',
      suggestions: [UsersCollectionNames.Users, AssetsCollectionNames.Assets],
      defaultValue: parentType,
      defaultActive: !getIsNullOrEmpty(parentType),
    },
    {
      fieldName: 'parent',
      type: FilterType.Equal,
      label: 'Parent ID',
      defaultValue: parentId,
      defaultActive: !getIsNullOrEmpty(parentId),
    },
    {
      fieldName: 'message',
      type: FilterType.Equal,
      label: 'Message',
      suggestions: [createMessage, editMessage],
    },
  ]

  return (
    <>
      <Heading variant="h1">History</Heading>
      <PaginatedView
        viewName={ViewNames.GetFullHistory}
        name="admin-history"
        sortOptions={[{ fieldName: 'createdat', label: 'Date' }]}
        defaultFieldName="createdat"
        defaultDirection={OrderDirections.DESC}
        filters={filters}
        extraControls={[
          <Button onClick={() => setIsAllExpanded((currentVal) => !currentVal)}>
            Expand All
          </Button>,
        ]}>
        <Renderer isAllExpanded={isAllExpanded} />
      </PaginatedView>
    </>
  )
}

export default AdminHistory
