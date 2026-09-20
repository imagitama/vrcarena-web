import React from 'react'
import { Helmet } from '@unhead/react/helmet'

import * as routes from '@/routes'

import Link from '@/components/link'
import Heading from '@/components/heading'
import AdminQueue from '@/components/admin-queue'
import BodyText from '@/components/body-text'

const CommunityResponsesView = () => {
  return (
    <>
      <Helmet>
        <title>View the approval queue</title>
        <meta
          name="description"
          content="View a list of queue items waiting for approval."
        />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.queue}>Queue</Link>
      </Heading>
      <BodyText>
        A list of everything waiting for manual intervention by our editorial
        team. Note that some links will not work unless you have the necessary
        permissions (like reports and support tickets).
      </BodyText>
      <AdminQueue />
    </>
  )
}

export default CommunityResponsesView
