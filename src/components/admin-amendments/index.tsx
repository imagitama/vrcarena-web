import React, { useCallback } from 'react'

import * as routes from '@/routes'
import PaginatedView, { GetQueryFn } from '@/components/paginated-view'
import AmendmentResults from '@/components/amendment-results'
import { FullAmendment, ViewNames } from '@/modules/amendments'
import NoResultsMessage from '@/components/no-results-message'
import { ApprovalStatus } from '@/modules/common'
import { EqualActiveFilter } from '@/filters'
import { HydrateFn } from '@/hooks/useDataStore'

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
      urlWithPageNumberVar={routes.adminWithTabNameVarAndPageNumberVar.replace(
        ':tabName',
        'amendments'
      )}
      subViews={[
        {
          id: SubView.Pending,
          label: 'Pending',
          defaultActive: true,
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
  )
}
