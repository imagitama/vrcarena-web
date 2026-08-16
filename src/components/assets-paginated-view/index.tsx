import React, { useCallback, useState } from 'react'
import PaginatedView, {
  GetQueryFn,
  PaginatedViewProps,
  RendererProps,
} from '@/components/paginated-view'
import { AssetCategory, PublicAsset, ViewNames } from '@/modules/assets'
import AssetResults from '@/components/asset-results'
import useIsAdultContentEnabled from '@/hooks/useIsAdultContentEnabled'
import AssetsByArea from '@/components/assets-by-area'
import { FilterType } from '@/filters'
import Button from '../button'
import useFilters from '@/hooks/useFilters'
import useStorage from '@/hooks/useStorage'

interface ExtraRendererProps {
  categoryName?: string
  defaultGroupByArea?: boolean
  showAreas?: boolean
  showDateMetadata?: boolean
}

enum SubView {
  GroupByArea = 'group-by-area',
}

const Renderer = ({
  items,
  hydrate,
  selectedSubView,
  showDateMetadata,
  // extra
  categoryName,
}: RendererProps<PublicAsset> & ExtraRendererProps) => {
  if (!items) {
    return <AssetResults shimmer shimmerCount={20} />
  }

  if (
    selectedSubView === SubView.GroupByArea &&
    categoryName &&
    categoryName !== AssetCategory.Avatar
  ) {
    return (
      <AssetsByArea
        assets={items}
        categoryName={categoryName}
        hydrate={hydrate}
        showDateMetadata={showDateMetadata}
      />
    )
  } else {
    return <AssetResults assets={items} showDateMetadata={showDateMetadata} />
  }
}

const FILTER_FIELDNAME_FREE = 'free'

/**
 * A paginated view but assets only with adult content filtered.
 * @param props
 * @returns
 */
const AssetsPaginatedView = ({
  categoryName,
  defaultGroupByArea = true,
  showAreas = true,
  showDateMetadata = false,
  ...props
}: ExtraRendererProps & PaginatedViewProps<PublicAsset>) => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const [isFree, setIsFree] = useStorage('AssetsPaginatedView.isFree', false)

  const getQuery = useCallback<GetQueryFn<PublicAsset>>(
    (query, selectedSubView, activeFilters) => {
      if (isFree) {
        query = query.contains('tags', ['free'])
      }

      // always check for "true" to prevent accidental inclusion
      query =
        isAdultContentEnabled === true ? query : query.is('isadult', false)

      if (props.getQuery) {
        return props.getQuery(query, selectedSubView, activeFilters)
      }

      return query
    },
    [isAdultContentEnabled, props.getQuery, isFree]
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
      defaultSubView={
        categoryName !== AssetCategory.Avatar && showAreas && defaultGroupByArea
          ? SubView.GroupByArea
          : undefined
      }
      subViews={
        categoryName !== AssetCategory.Avatar && showAreas
          ? [
              {
                id: SubView.GroupByArea,
                label: 'Group By Area',
              },
            ]
          : undefined
      }
      {...props}
      extraControls={[
        <Button checked={isFree} onClick={() => setIsFree(!isFree)}>
          Free
        </Button>,
        ...(props.extraControls || []),
      ]}
      // NOTE: Do not override props with this as we do adult check
      getQuery={getQuery}
      isRendererForLoading
      itemNamePlural="assets">
      {/* @ts-ignore */}
      <Renderer
        categoryName={categoryName}
        showDateMetadata={showDateMetadata}
      />
    </PaginatedView>
  )
}

export default AssetsPaginatedView
