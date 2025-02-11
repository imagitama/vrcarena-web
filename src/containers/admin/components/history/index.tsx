import React, { useMemo, useState } from 'react'
import useDatabaseQuery, {
  Operators,
  OrderDirections,
  WhereClause,
} from '../../../../hooks/useDatabaseQuery'
import {
  HistoryEntry,
  ViewNames,
  createMessage,
  editMessage,
} from '../../../../modules/history'
import LoadingIndicator from '../../../../components/loading-indicator'
import ErrorMessage from '../../../../components/error-message'
import HistoryResults from '../../../../components/history-results'

import { CollectionNames as UsersCollectionNames } from '../../../../modules/user'
import { CollectionNames as AssetsCollectionNames } from '../../../../modules/assets'
import Filters, { Filter, FilterType } from '../../../../components/filters'
import useFilters, { StoredFilter } from '../../../../hooks/useFilters'
import PaginatedView from '../../../../components/paginated-view'

const filters: Filter<HistoryEntry>[] = [
  {
    fieldName: 'createdby',
    type: FilterType.UserId,
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

const storageKey = 'admin-history'

const Renderer = ({ items }: { items?: HistoryEntry[] }) => (
  <HistoryResults results={items!} />
)

const History = () => {
  const [activeFilters] = useFilters<HistoryEntry>(storageKey)
  const whereClauses: WhereClause<HistoryEntry>[] = useMemo(
    () =>
      activeFilters.map(({ fieldName, value }) => [
        fieldName,
        Operators.EQUALS,
        value,
      ]),
    [JSON.stringify(activeFilters)]
  )

  // const [isLoading, lastErrorCode, historyEntries] =
  //   useDatabaseQuery<HistoryEntry>(ViewNames.GetFullHistory, whereClauses, {
  //     orderBy: ['createdat', OrderDirections.DESC],
  //   })

  // if (lastErrorCode !== null) {
  //   return <ErrorMessage>Failed to load history entries</ErrorMessage>
  // }

  // if (isLoading || !historyEntries) {
  //   return <LoadingIndicator message="Loading history entries..." />
  // }

  return (
    <>
      <Filters filters={filters} storageKey={storageKey} />
      <PaginatedView
        viewName={ViewNames.GetFullHistory}
        whereClauses={whereClauses}
        sortKey="admin-history"
        sortOptions={[{ fieldName: 'createdat', label: 'Date' }]}
        defaultFieldName="createdat"
        defaultDirection={OrderDirections.DESC}>
        <Renderer />
      </PaginatedView>
    </>
  )
}

export default History
