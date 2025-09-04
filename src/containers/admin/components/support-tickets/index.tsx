import React from 'react'

import * as routes from '@/routes'
import {
  FullSupportTicket,
  ResolutionStatus,
  ViewNames,
} from '@/modules/support-tickets'

import PaginatedView from '@/components/paginated-view'
import { FilterSubType, FilterType, MultichoiceFilter } from '@/filters'
import SupportTicketResults from '@/components/support-ticket-results'

const Renderer = ({ items }: { items?: FullSupportTicket[] }) => (
  <SupportTicketResults supportTickets={items!} />
)

export default () => {
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
      urlWithPageNumberVar={routes.adminWithTabNameVarAndPageNumberVar.replace(
        ':tabName',
        'support-tickets'
      )}
      filters={[
        {
          fieldName: 'resolutionstatus',
          type: FilterType.Multichoice,
          options: [ResolutionStatus.Pending, ResolutionStatus.Resolved],
          label: 'Status',
          defaultActive: true,
          defaultValue: [ResolutionStatus.Pending],
        } as MultichoiceFilter<FullSupportTicket, ResolutionStatus>,
        {
          fieldName: 'createdby',
          label: 'Created By',
          type: FilterType.Equal,
          subType: FilterSubType.UserId,
        },
      ]}>
      <Renderer />
    </PaginatedView>
  )
}
