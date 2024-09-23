import React, { useCallback } from 'react'
import PaginatedView, { PaginatedViewProps } from '../paginated-view'
import { AssetCategory, PublicAsset, ViewNames } from '../../modules/assets'
import AssetResults from '../asset-results'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import AssetsByArea from '../assets-by-area'

// const Renderer = ({
//   items,
//   hydrate,
// }: {
//   items?: PublicAsset[]
//   hydrate?: () => void
// }) => <AssetResults assets={items} hydrate={hydrate} />

interface ExtraRendererProps {
  categoryName?: string
  groupByAreaEnabled?: boolean
}

const Renderer = ({
  items,
  hydrate,
  // extra
  categoryName,
  groupByAreaEnabled,
}: {
  items?: PublicAsset[]
  hydrate?: () => void
} & ExtraRendererProps) => {
  if (groupByAreaEnabled && categoryName) {
    return (
      <AssetsByArea
        assets={items}
        categoryName={categoryName}
        hydrate={hydrate}
      />
    )
  } else {
    return <AssetResults assets={items} hydrate={hydrate} />
  }
}

/**
 * A paginated view but assets only with adult content filtered.
 * @param props
 * @returns
 */
const AssetsPaginatedView = ({
  categoryName,
  groupByAreaEnabled,
  ...props
}: ExtraRendererProps & PaginatedViewProps<PublicAsset>) => {
  const isAdultContentEnabled = useIsAdultContentEnabled()

  const getQuery = useCallback(
    (query, selectedSubView) => {
      // always check for "true" to prevent accidental inclusion
      query =
        isAdultContentEnabled !== true ? query.is('isadult', false) : query

      if (props.getQuery) {
        query = props.getQuery(query, selectedSubView)
      }

      return query
    },
    [isAdultContentEnabled, props.getQuery]
  )

  return (
    <PaginatedView<PublicAsset>
      viewName={ViewNames.GetPublicAssets}
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
      getQuery={getQuery}
      {...props}>
      <Renderer
        categoryName={categoryName}
        groupByAreaEnabled={groupByAreaEnabled}
      />
    </PaginatedView>
  )
}

export default AssetsPaginatedView
