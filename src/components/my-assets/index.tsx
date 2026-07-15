import React, { useCallback } from 'react'

import useUserId from '@/hooks/useUserId'
import * as routes from '@/routes'
import { Asset, AssetForList, ViewNames } from '@/modules/assets'
import { AccessStatus, ApprovalStatus, PublishStatus } from '@/modules/common'

import PaginatedView, { GetQueryFn } from '@/components/paginated-view'
import AssetResults from '@/components/asset-results'

const Renderer = ({ items }: { items?: AssetForList[] }) => (
  <AssetResults assets={items} showStates />
)

enum SubView {
  Visible = 'visible',
  Drafts = 'drafts',
  Deleted = 'deleted',
  Queued = 'queued',
}

const MyUploads = () => {
  const userId = useUserId()
  const getQuery = useCallback<GetQueryFn<AssetForList, SubView>>(
    (query, selectedSubView) => {
      query = query.eq('createdby', userId)

      switch (selectedSubView) {
        case SubView.Visible:
          query = query
            .eq('publishstatus', PublishStatus.Published)
            .or(
              `approvalstatus.eq.${ApprovalStatus.Approved},approvalstatus.eq.${ApprovalStatus.AutoApproved}`
            )
            .eq('accessstatus', AccessStatus.Public)
          break

        case SubView.Drafts:
          query = query
            .eq('publishstatus', PublishStatus.Draft)
            .eq('accessstatus', AccessStatus.Public)
          break

        case SubView.Deleted:
          query = query.or(
            `accessstatus.eq.${AccessStatus.Deleted},accessstatus.eq.${AccessStatus.Archived}`
          )
          break

        case SubView.Queued:
          query = query
            .eq('publishstatus', PublishStatus.Published)
            .eq('accessstatus', AccessStatus.Public)
          break
      }

      return query
    },
    [userId]
  )

  return (
    <PaginatedView<AssetForList>
      viewName={ViewNames.GetAssetsForList}
      getQuery={getQuery}
      name="my-assets"
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
      urlWithSubViewNameAndPageNumberVar={routes.myAccountWithTabNameVarAndSubViewNameVarAndPageNumberVar.replace(
        ':tabName',
        'assets'
      )}
      subViews={[
        {
          id: SubView.Visible,
          label: 'Visible',
        },
        {
          id: SubView.Queued,
          label: 'Queued',
        },
        {
          id: SubView.Drafts,
          label: 'Drafts',
        },
        {
          id: SubView.Deleted,
          label: 'Deleted',
        },
      ]}
      itemNamePlural="assets">
      <Renderer />
    </PaginatedView>
  )
}

export default MyUploads
