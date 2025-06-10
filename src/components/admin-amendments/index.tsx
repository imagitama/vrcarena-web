import React, { useState, useCallback } from 'react'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'

import Button from '../button'
import PaginatedView, { GetQueryFn } from '../paginated-view'
import AmendmentResults from '../amendment-results'
import TextInput from '../text-input'
import { FullAmendment, ViewNames } from '../../modules/amendments'
import NoResultsMessage from '../no-results-message'
import { ApprovalStatus } from '../../modules/common'

const Renderer = ({ items }: { items?: FullAmendment[] }) =>
  items ? (
    <AmendmentResults results={items} />
  ) : (
    <NoResultsMessage>No amendments found</NoResultsMessage>
  )

const subViews = {
  WAITING: 0,
  APPROVED: 1,
  REJECTED: 2,
}

const analyticsCategoryName = 'AdminAmendments'

const UserIdFilter = ({ onChange }: { onChange: (userId: string) => void }) => {
  const [val, setVal] = useState('')
  return (
    <>
      <TextInput
        onChange={(e) => setVal(e.target.value)}
        value={val}
        placeholder="User ID"
        size="small"
      />
      <Button onClick={() => onChange(val)}>Apply</Button>
    </>
  )
}

export default () => {
  const [selectedSubView, setSelectedSubView] = useState(subViews.WAITING)
  const [userIdToFilter, setUserIdToFilter] = useState('')
  const getQuery = useCallback<GetQueryFn<FullAmendment>>(
    (query) => {
      if (userIdToFilter) {
        query = query.eq('createdby', userIdToFilter)
      }

      switch (selectedSubView) {
        case subViews.WAITING:
          query = query.eq('approvalstatus', ApprovalStatus.Waiting)
          break

        case subViews.APPROVED:
          query = query.eq('approvalstatus', ApprovalStatus.Approved)
          break

        case subViews.REJECTED:
          query = query.eq('approvalstatus', ApprovalStatus.Declined)
      }

      return query
    },
    [userIdToFilter, selectedSubView]
  )

  const toggleSubView = (subView: number) =>
    setSelectedSubView((currentVal) => {
      if (currentVal === subView) {
        return subViews.WAITING
      }
      return subView
    })

  return (
    <PaginatedView<FullAmendment>
      viewName={ViewNames.GetFullAmendments}
      getQuery={getQuery}
      sortKey="view-amendments"
      sortOptions={[
        {
          label: 'Submission date',
          fieldName: 'createdat',
        },
      ]}
      defaultFieldName="createdat"
      urlWithPageNumberVar={routes.adminWithTabNameVarAndPageNumberVar.replace(
        ':tabName',
        'amendments'
      )}
      extraControls={[
        <Button
          icon={
            selectedSubView === subViews.WAITING ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }
          onClick={() => {
            setSelectedSubView(subViews.WAITING)
            trackAction(
              analyticsCategoryName,
              'Click on view waiting amendments'
            )
          }}
          color="secondary">
          Waiting
        </Button>,
        <Button
          icon={
            selectedSubView === subViews.APPROVED ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }
          onClick={() => {
            toggleSubView(subViews.APPROVED)
            trackAction(
              analyticsCategoryName,
              'Click on view approved amendments'
            )
          }}
          color="secondary">
          Approved
        </Button>,
        <Button
          icon={
            selectedSubView === subViews.REJECTED ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }
          onClick={() => {
            toggleSubView(subViews.REJECTED)
            trackAction(
              analyticsCategoryName,
              'Click on view rejected amendments'
            )
          }}
          color="secondary">
          Rejected
        </Button>,
        <UserIdFilter onChange={(newVal) => setUserIdToFilter(newVal)} />,
      ]}>
      <Renderer />
    </PaginatedView>
  )
}
