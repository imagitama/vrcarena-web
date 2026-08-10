import React, { useCallback } from 'react'

import * as routes from '@/routes'
import PaginatedView, { GetQueryFn } from '@/components/paginated-view'
import AmendmentResults from '@/components/amendment-results'
import { FullAmendment, ViewNames } from '@/modules/amendments'
import NoResultsMessage from '@/components/no-results-message'
import { ApprovalStatus } from '@/modules/common'
import { EqualActiveFilter } from '@/filters'
import { HydrateFn } from '@/hooks/useDataStore'
import { useParams } from 'react-router'
import InfoMessage from '../info-message'
import Heading from '../heading'

const Renderer = ({
  items,
  hydrate,
}: {
  items?: FullAmendment<any>[]
  hydrate?: HydrateFn
}) =>
  items ? (
    <AmendmentResults results={items} hydrate={hydrate} />
  ) : (
    <NoResultsMessage>No amendments found</NoResultsMessage>
  )

enum SubView {
  Pending = 'pending',
  Approved = 'approved',
  Declined = 'declined',
}

export default () => {
  const { subViewName } = useParams<{ subViewName?: string }>()

  const getQuery = useCallback<GetQueryFn<FullAmendment<any>, SubView>>(
    (query, selectedSubView, activeFilters) => {
      const userIdFilter = activeFilters.find(
        (filter) => filter.fieldName === 'createdby'
      ) as EqualActiveFilter<FullAmendment<any>>

      if (userIdFilter && userIdFilter.value) {
        query = query.eq('createdby', userIdFilter.value)
      }

      switch (selectedSubView) {
        case SubView.Approved:
          query = query.or(
            `approvalstatus.eq.${ApprovalStatus.Approved},approvalstatus.eq.${ApprovalStatus.AutoApproved}`
          )
          break

        case SubView.Declined:
          query = query.eq('approvalstatus', ApprovalStatus.Declined)
          break

        case SubView.Pending:
        default:
          query = query.or(
            `approvalstatus.eq.${ApprovalStatus.Waiting},approvalstatus.eq.${ApprovalStatus.Quarantined}`
          )
          break
      }

      return query
    },
    []
  )

  return (
    <>
      <Heading variant="h1">Amendment Queue</Heading>
      <InfoMessage title="How Amendments Work" hideId="admin-amendments-info">
        Anyone can amend (edit) anything on the site. Try your best to verify
        the new fields are correct and click approve.
        <br />
        <br />
        <strong>
          Amendments are auto-approved after 24 hours, if the creator has enough
          rep (currently 100) and if they are the original creator of the
          record.
        </strong>
      </InfoMessage>
      <PaginatedView<FullAmendment<any>>
        name="admin-amendments"
        viewName={ViewNames.GetFullAmendments}
        getQuery={getQuery}
        sortOptions={[
          {
            label: 'Submission date',
            fieldName: 'createdat',
          },
        ]}
        defaultFieldName="createdat"
        defaultSubView={subViewName || SubView.Pending}
        urlWithSubViewNameAndPageNumberVar={routes.adminWithTabNameVarAndSubViewNameVarAndPageNumberVar.replace(
          ':tabName',
          'amendments'
        )}
        subViews={[
          {
            id: SubView.Pending,
            label: 'Pending',
          },
          {
            id: SubView.Approved,
            label: 'Approved',
          },
          {
            id: SubView.Declined,
            label: 'Declined',
          },
        ]}
        itemNamePlural="amendments">
        <Renderer />
      </PaginatedView>
    </>
  )
}
