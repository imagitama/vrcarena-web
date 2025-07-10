import React, { useCallback } from 'react'

import useUserId from '../../hooks/useUserId'
import * as routes from '../../routes'
import PaginatedView, { GetQueryFn } from '../paginated-view'
import AssetResults from '../asset-results'
import { Asset, ViewNames } from '../../modules/assets'
import {
  AccessStatus,
  ApprovalStatus,
  PublishStatus,
} from '../../modules/common'

const Renderer = ({ items }: { items?: Asset[] }) => (
  <AssetResults assets={items} showStates />
)

enum SubView {
  Visible = 'visible',
  Drafts = 'drafts',
  Deleted = 'deleted',
}

const MyUploads = () => {
  const userId = useUserId()
  const getQuery = useCallback<GetQueryFn<Asset, SubView>>(
    (query, selectedSubView) => {
      query = query.eq('createdby', userId)

      switch (selectedSubView) {
        case SubView.Visible:
          query = query
            .eq('publishstatus', PublishStatus.Published)
            .eq('approvalstatus', ApprovalStatus.Approved)
            .eq('accessstatus', AccessStatus.Public)
          break

        case SubView.Drafts:
          query = query.eq('publishstatus', PublishStatus.Draft)
          break

        case SubView.Deleted:
          query = query.or(
            `accessstatus.eq.${AccessStatus.Deleted},accessstatus.eq.${AccessStatus.Archived}`
          )
      }

      return query
    },
    [userId]
  )

  return (
    <PaginatedView<Asset>
      viewName={ViewNames.GetFullAssets}
      getQuery={getQuery}
      name="view-category"
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
      defaultFieldName={'createdat'}
      urlWithPageNumberVar={routes.myAccountWithTabNameVarAndPageNumberVar.replace(
        ':tabName',
        'assets'
      )}
      subViews={[
        {
          id: SubView.Visible,
          label: 'Visible',
        },
        {
          id: SubView.Drafts,
          label: 'Drafts',
        },
        {
          id: SubView.Deleted,
          label: 'Deleted',
        },
      ]}>
      <Renderer />
    </PaginatedView>
  )
}

export default MyUploads
