import React, { useCallback } from 'react'
import { AssetFieldNames } from '../../../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../../../hooks/useIsAdultContentEnabled'
import useUserOverview from '../../useUserOverview'
import PaginatedView from '../../../paginated-view'
import AssetResults from '../../../asset-results'

const Renderer = ({ items }) => <AssetResults assets={items} />

export default () => {
  const { userId, user } = useUserOverview()
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(
    query => {
      query = query.eq(AssetFieldNames.createdBy, userId)
      if (isAdultContentEnabled !== true) {
        query = query.eq(AssetFieldNames.isAdult, false)
      }
      return query
    },
    [userId, isAdultContentEnabled]
  )

  if (!userId || !user) {
    return null
  }

  return (
    <PaginatedView
      viewName="getPublicAssets"
      getQuery={getQuery}
      sortKey="view-user-assets"
      sortOptions={[
        {
          label: 'Submission date',
          fieldName: AssetFieldNames.createdAt
        },
        {
          label: 'Title',
          fieldName: AssetFieldNames.title
        }
      ]}
      defaultFieldName={AssetFieldNames.createdAt}>
      <Renderer />
    </PaginatedView>
  )
}
