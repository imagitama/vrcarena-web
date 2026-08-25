import React from 'react'
import { Helmet } from '@unhead/react/helmet'
import { useParams } from 'react-router'

import * as routes from '@/routes'
import { DISCORD_URL, EMAIL } from '@/config'
import { CollectionNames, SupportTicket } from '@/modules/support-tickets'
import editableFields from '@/editable-fields/support-tickets'
import usePermissions from '@/hooks/usePermissions'

import NoPermissionMessage from '@/components/no-permission-message'
import Heading from '@/components/heading'
import WarningMessage from '@/components/warning-message'
import Link from '@/components/link'
import GenericEditor from '@/components/generic-editor'

const View = () => {
  const { parentTable, parentId } = useParams<{
    parentTable?: string
    parentId?: string
  }>()

  if (!usePermissions(routes.createReportWithVar)) {
    return <NoPermissionMessage />
  }

  return (
    <GenericEditor<SupportTicket>
      itemTypeSingular="support ticket"
      collectionName={CollectionNames.SupportTickets}
      fields={editableFields}
      overrideFields={{
        relatedtable: parentTable,
        relatedid: parentId,
      }}
      successMessage={
        <>
          Our staff have been notified of your support ticket and we aim to
          resolve them quickly. If it has been longer than 7 days, please
          enquire about it via Discord or email ({EMAIL}).
        </>
      }
    />
  )
}

export default () => (
  <>
    <Helmet>
      <title>Create a support ticket</title>
      <meta
        name="description"
        content="Use this form to create a support ticket to ask for help with the site."
      />
    </Helmet>
    <Heading variant="h1">Create Support Ticket</Heading>
    <WarningMessage>
      Have you seen your asset on this site and want it taken down? Please read
      our <Link to={routes.takedownPolicy}>takedown policy</Link>.
    </WarningMessage>
    <WarningMessage>
      Having trouble submitting this support ticket? You can message us via our{' '}
      <a href={DISCORD_URL}>Discord server</a> or email us at {EMAIL} (Discord
      preferred).
    </WarningMessage>
    <View />
  </>
)
