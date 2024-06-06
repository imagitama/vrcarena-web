import React, { useCallback } from 'react'
import PaginatedView, { PaginatedViewProps } from '../paginated-view'
import { PublicAsset } from '../../modules/assets'
import AssetResults from '../asset-results'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'

const Renderer = ({ items }: { items?: PublicAsset[] }) => (
  <AssetResults assets={items} />
)

/**
 * A paginated view but assets only with adult content filtered.
 * @param props
 * @returns
 */
const AssetsPaginatedView = (props: PaginatedViewProps<PublicAsset>) => {
  const isAdultContentEnabled = useIsAdultContentEnabled()

  const getQuery = useCallback(
    (query, selectedSubView) => {
      query =
        isAdultContentEnabled === false ? query.is('isadult', false) : query

      if (props.getQuery) {
        query = props.getQuery(query, selectedSubView)
      }

      return query
    },
    [isAdultContentEnabled, props.getQuery]
  )

  return (
    <PaginatedView<PublicAsset>
      viewName="getPublicAssets"
      sortKey="view-assets"
      sortOptions={[
        {
          label: 'Submission date',
          fieldName: 'createdat',
        },
        {
          label: 'Title',
          fieldName: 'title',
        },
      ]}
      defaultFieldName="createdat"
      {...props}
      // TODO: Allow to override
      getQuery={getQuery}>
      <Renderer />
    </PaginatedView>
  )
}

export default AssetsPaginatedView
