import React, { useCallback } from 'react'

import * as routes from '@/routes'
import {
  FullSupportTicket,
  ResolutionStatus,
  ViewNames,
} from '@/modules/support-tickets'

import PaginatedView, { GetQueryFn } from '@/components/paginated-view'
import { FilterSubType, FilterType } from '@/filters'
import SupportTicketResults from '@/components/support-ticket-results'

const Renderer = ({ items }: { items?: FullSupportTicket[] }) => (
  <SupportTicketResults supportTickets={items!} />
)

enum SubView {
  Pending = 'pending',
  Resolved = 'resolved',
}

export default () => {
  const getQuery = useCallback<GetQueryFn<FullSupportTicket, SubView>>(
    (query, selectedSubView) => {
      switch (selectedSubView) {
        case SubView.Pending:
          query = query.eq('resolutionstatus', ResolutionStatus.Pending)
          break
        case SubView.Resolved:
          query = query.eq('resolutionstatus', ResolutionStatus.Resolved)
          break
      }

      return query
    },
    []
  )

  return (
    <PaginatedView<FullSupportTicket>
      viewName={ViewNames.GetFullSupportTickets}
      name="view-support-tickets"
      sortOptions={[
        {
          label: 'Resolved at',
          fieldName: 'resolvedat',
        },
        {
          label: 'Reported at',
          fieldName: 'createdat',
        },
      ]}
      defaultFieldName={'createdat'}
      urlWithSubViewNameAndPageNumberVar={routes.adminWithTabNameVarAndPageNumberVar.replace(
        ':tabName',
        'support-tickets'
      )}
      getQuery={getQuery}
      subViews={[
        {
          id: SubView.Pending,
          label: 'Pending',
        },
        {
          id: SubView.Resolved,
          label: 'Resolved',
        },
      ]}
      defaultSubView={SubView.Pending}
      filters={[
        {
          fieldName: 'createdby',
          label: 'Created By',
          type: FilterType.Equal,
          subType: FilterSubType.UserId,
        },
      ]}
      itemNamePlural="support tickets">
      <Renderer />
    </PaginatedView>
  )
}
