import React, { useState, useCallback } from 'react'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'

import useUserId from '../../hooks/useUserId'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'

import Button from '../button'
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
  Visible,
  Drafts,
  Deleted,
}

const analyticsCategoryName = 'MyAccount'

const MyUploads = () => {
  const userId = useUserId()
  const [selectedSubView, setSelectedSubView] = useState<SubView | null>(null)
  const getQuery = useCallback<GetQueryFn<Asset>>(
    (query) => {
      query = query.eq('createdby', userId)

      switch (selectedSubView) {
        case SubView.Visible:
          query = query
            .eq('publishstatus', PublishStatus.Published)
            .eq('approvalstatus', ApprovalStatus.Approved)
            .eq('accessstatus', AccessStatus.Public)
          break

        case SubView.Drafts:
          query = query.eq('accessstatus', AccessStatus.Public)
            .or(`publishstatus.eq.${PublishStatus.Draft},\
approvalstatus.eq.${ApprovalStatus.Waiting},\
approvalstatus.eq.${ApprovalStatus.Declined}`)
          break

        case SubView.Deleted:
          query = query.or(
            `accessstatus.eq.${AccessStatus.Deleted},accessstatus.eq.${AccessStatus.Archived}`
          )
      }

      return query
    },
    [userId, selectedSubView]
  )

  const toggleSubView = (subView: number): void =>
    setSelectedSubView((currentVal) => {
      if (currentVal === subView) {
        return SubView.Visible
      }
      return subView
    })

  return (
    <PaginatedView<Asset>
      viewName={ViewNames.GetFullAssets}
      getQuery={getQuery}
      sortKey="view-category"
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
      extraControls={[
        <Button
          icon={
            selectedSubView === null ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }
          onClick={() => {
            setSelectedSubView(null)

            trackAction(analyticsCategoryName, 'Click on view my public assets')
          }}
          color="secondary">
          All
        </Button>,
        <Button
          icon={
            selectedSubView === SubView.Visible ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }
          onClick={() => {
            setSelectedSubView(SubView.Visible)

            trackAction(analyticsCategoryName, 'Click on view my public assets')
          }}
          color="secondary">
          Visible To Everyone
        </Button>,
        <Button
          icon={
            selectedSubView === SubView.Drafts ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }
          onClick={() => {
            toggleSubView(SubView.Drafts)

            trackAction(analyticsCategoryName, 'Click on view my draft assets')
          }}
          color="secondary">
          Drafts
        </Button>,
        <Button
          icon={
            selectedSubView === SubView.Deleted ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }
          onClick={() => {
            toggleSubView(SubView.Deleted)

            trackAction(
              analyticsCategoryName,
              'Click on view my deleted assets'
            )
          }}
          color="secondary">
          Deleted/Archived
        </Button>,
      ]}>
      <Renderer />
    </PaginatedView>
  )
}

export default MyUploads
