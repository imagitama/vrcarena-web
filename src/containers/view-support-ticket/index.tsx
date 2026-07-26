import React from 'react'
import { Helmet } from '@unhead/react/helmet'
import { useParams } from 'react-router'

import * as routes from '@/routes'
import {
  CollectionNames,
  FullSupportTicket,
  ViewNames,
} from '@/modules/support-tickets'
import { getViewNameForParentTable } from '@/utils/reports'

import useIsLoggedIn from '@/hooks/useIsLoggedIn'
import useDataStoreItem from '@/hooks/useDataStoreItem'

import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import NoPermissionMessage from '@/components/no-permission-message'
import NoResultsMessage from '@/components/no-results-message'
import ResolvableItem from '@/components/resolvable-item'

const View = () => {
  const { supportTicketId } = useParams<{ supportTicketId: string }>()
  const isLoggedIn = useIsLoggedIn()

  const [isLoading, lastErrorCode, supportTicket, hydrate] =
    useDataStoreItem<FullSupportTicket>(
      ViewNames.GetFullSupportTickets,
      isLoggedIn ? supportTicketId : false,
      { queryName: 'view-support-ticket' }
    )

  if (!isLoggedIn) {
    return <NoPermissionMessage />
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading support ticket..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load support ticket (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!supportTicket) {
    return <NoResultsMessage>Support ticket not found</NoResultsMessage>
  }

  return (
    <ResolvableItem
      collectionName={CollectionNames.SupportTickets}
      metaCollectionName={CollectionNames.SupportTicketsMeta}
      title="Support ticket"
      item={supportTicket}
      url={routes.viewSupportTicketWithVar.replace(
        ':supportTicketId',
        supportTicketId
      )}
      hydrate={hydrate}
    />
  )
}

export default () => (
  <>
    <Helmet>
      <title>View a support ticket</title>
      <meta
        name="description"
        content="Read more information about a support ticket on the site."
      />
    </Helmet>
    <View />
  </>
)
