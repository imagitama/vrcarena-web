import React, { useCallback } from 'react'
import PaginatedView, {
  GetQueryFn,
  PaginatedViewProps,
  RendererProps,
} from '../paginated-view'
import { AssetCategory, PublicAsset, ViewNames } from '../../modules/assets'
import AssetResults from '../asset-results'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import AssetsByArea from '../assets-by-area'

interface ExtraRendererProps {
  categoryName?: string
  defaultGroupByArea?: boolean
}

enum SubView {
  GroupByArea = 'group-by-area',
}

const Renderer = ({
  items,
  hydrate,
  selectedSubView,
  // extra
  categoryName,
}: RendererProps<PublicAsset> & ExtraRendererProps) => {
  if (selectedSubView === SubView.GroupByArea && categoryName) {
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
  defaultGroupByArea = true,
  ...props
}: ExtraRendererProps & PaginatedViewProps<PublicAsset>) => {
  const isAdultContentEnabled = useIsAdultContentEnabled()

  const getQuery = useCallback<GetQueryFn<PublicAsset>>(
    (query, selectedSubView, activeFilters) => {
      // always check for "true" to prevent accidental inclusion
      query =
        isAdultContentEnabled === true ? query : query.is('isadult', false)

      if (props.getQuery) {
        return props.getQuery(query, selectedSubView, activeFilters)
      }

      return query
    },
    [isAdultContentEnabled, props.getQuery]
  )

  return (
    <PaginatedView<PublicAsset>
      viewName={ViewNames.GetPublicAssets}
      name="view-assets"
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
      subViews={
        categoryName !== AssetCategory.Avatar
          ? [
              {
                id: SubView.GroupByArea,
                label: 'Group By Area',
                defaultActive: defaultGroupByArea,
              },
            ]
          : undefined
      }
      {...props}
      // NOTE: Do not override props with this as we do adult check
      getQuery={getQuery}>
      {/* @ts-ignore */}
      <Renderer categoryName={categoryName} />
    </PaginatedView>
  )
}

export default AssetsPaginatedView
