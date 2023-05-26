import React, { useState, useCallback } from 'react'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import { CommonMetaFieldNames } from '../../data-store'

import Button from '../button'
import PaginatedView from '../paginated-view'
import AmendmentResults from '../amendment-results'
import TextInput from '../text-input'
import { ApprovalStatuses } from '../../hooks/useDatabaseQuery'
import { FullAmendment } from '../../modules/amendments'
import NoResultsMessage from '../no-results-message'

const Renderer = ({ items }: { items?: FullAmendment[] }) =>
  items ? (
    <AmendmentResults results={items} />
  ) : (
    <NoResultsMessage>No amendments found</NoResultsMessage>
  )

const subViews = {
  WAITING: 0,
  APPROVED: 1,
  REJECTED: 2
}

const analyticsCategoryName = 'AdminAmendments'

const UserIdFilter = ({ onChange }: { onChange: (userId: string) => void }) => {
  const [val, setVal] = useState('')
  return (
    <>
      <TextInput
        onChange={e => setVal(e.target.value)}
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
  const getQuery = useCallback(
    query => {
      if (userIdToFilter) {
        query = query.eq(CommonMetaFieldNames.createdBy, userIdToFilter)
      }

      switch (selectedSubView) {
        case subViews.WAITING:
          query = query.eq(
            CommonMetaFieldNames.approvalStatus,
            ApprovalStatuses.Waiting
          )
          break

        case subViews.APPROVED:
          query = query.eq(
            CommonMetaFieldNames.approvalStatus,
            ApprovalStatuses.Approved
          )
          break

        case subViews.REJECTED:
          query = query.eq(
            CommonMetaFieldNames.approvalStatus,
            ApprovalStatuses.Declined
          )
      }

      return query
    },
    [userIdToFilter, selectedSubView]
  )

  const toggleSubView = (subView: number) =>
    setSelectedSubView(currentVal => {
      if (currentVal === subView) {
        return subViews.WAITING
      }
      return subView
    })

  return (
    <PaginatedView
      viewName="getFullAmendments"
      // @ts-ignore
      getQuery={getQuery}
      sortKey="view-amendments"
      sortOptions={[
        {
          label: 'Submission date',
          fieldName: CommonMetaFieldNames.createdAt
        }
      ]}
      defaultFieldName={CommonMetaFieldNames.createdAt}
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
          color="default">
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
          color="default">
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
          color="default">
          Rejected
        </Button>,
        <UserIdFilter onChange={newVal => setUserIdToFilter(newVal)} />
      ]}>
      <Renderer />
    </PaginatedView>
  )
}
