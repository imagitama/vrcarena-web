import React from 'react'
import { Helmet } from '@unhead/react/helmet'

import * as routes from '@/routes'
import { UserRoles } from '@/modules/users'

import useUserRecord from '@/hooks/useUserRecord'

import Tabs from '@/components/tabs'
import Heading from '@/components/heading'
import LoadingIndicator from '@/components/loading-indicator'
import NoPermissionMessage from '@/components/no-permission-message'
import ErrorMessage from '@/components/error-message'
import AdminAssets from '@/components/admin-assets'
import AdminAmendments from '@/components/admin-amendments'
import AdminReports from '@/components/admin-reports'
import AdminPublicAvatars from '@/components/admin-public-avatars'
import AdminNotices from '@/components/admin-notices'
import InfoMessage from '@/components/info-message'

import AdminComments from './components/comments'
import AdminHome from './components/home'
import History from './components/history'
import AdminSupportTickets from './components/support-tickets'
import Link from '@/components/link'
import Queue from './components/queue'
import AdminAudit from './components/audit'
import AdminDupes from './components/dupes'
import AdminReputation from './components/reputation'
import Analytics from './components/analytics'

const View = () => {
  const [isLoading, isErrored, user] = useUserRecord()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load user</ErrorMessage>
  }

  if (
    !user ||
    (user.role !== UserRoles.Admin && user.role !== UserRoles.Editor)
  ) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Admin</Heading>
      <Tabs
        urlWithTabNameVar={routes.adminWithTabNameVar}
        items={[
          {
            name: 'home',
            label: 'Home',
            contents: (
              <>
                <AdminHome />
              </>
            ),
          },
          {
            name: 'assets',
            label: 'Assets',
            contents: (
              <>
                <InfoMessage title="How Assets Work" hideId="admin-assets-info">
                  Assets are auto-approved after <strong>24 hours</strong>, if
                  the user has over <strong>20 rep</strong> (a month old
                  account) and if the AI evaluation is over <strong>0.6</strong>
                  .
                </InfoMessage>
                <AdminAssets />
              </>
            ),
          },
          {
            name: 'amendments',
            label: 'Amendments',
            contents: (
              <>
                <InfoMessage
                  title="How Amendments Work"
                  hideId="admin-amendments-info">
                  Anyone can amend (edit) anything on the site. Try your best to
                  verify the new fields are correct and click approve.
                  <br />
                  <br />
                  <strong>
                    Amendments are auto-approved after 24 hours, if the creator
                    has enough rep (currently 100) and if they are the original
                    creator of the record.
                  </strong>
                </InfoMessage>
                <div style={{ maxWidth: '100vw' }}>
                  <AdminAmendments />
                </div>
              </>
            ),
          },
          {
            name: 'history',
            label: 'History',
            contents: <History />,
          },
          {
            name: 'reports',
            label: 'Reports',
            contents: (
              <>
                <InfoMessage
                  title="How Reports Work"
                  hideId="admin-reports-info">
                  Anyone can report anything on the site. Try your best to
                  verify their claim and resolve the report.
                  <br />
                  <br />
                  <strong>Removing assets:</strong> We have a strict{' '}
                  <Link to={routes.takedownPolicy}>Takedown Policy</Link> they
                  need to follow. 9 out of 10 times they should submit a DMCA
                  claim. Sometimes they take down the asset from their Gumroad
                  page etc. and it needs to be archived here too.
                </InfoMessage>
                <AdminReports />
              </>
            ),
          },
          {
            name: 'support-tickets',
            label: 'Support Tickets',
            contents: (
              <>
                <InfoMessage
                  title="How Support Tickets Work"
                  hideId="admin-support-tickets-info">
                  Users can open a support ticket from their profile to resolve
                  issues with assets, authentication, etc.
                  <br />
                  <br />
                  Be sure to check the Discord server too!
                </InfoMessage>
                <AdminSupportTickets />
              </>
            ),
          },
          {
            name: 'public-avatars',
            label: 'Public Avatars',
            contents: (
              <>
                <InfoMessage
                  title="How Public Avatars Work"
                  hideId="admin-public-avatars-info">
                  Anyone (including logged out users) can submit VRChat avatars
                  for assets. Try your best to verify if the avatar is actually
                  for the asset then add them.
                </InfoMessage>
                <AdminPublicAvatars />
              </>
            ),
          },
          {
            name: 'notices',
            label: 'Notices',
            contents: (
              <>
                <InfoMessage
                  title="How Notices Work"
                  hideId="admin-notices-info">
                  Active notices are shown at the top of every page for
                  everyone. Use them for outages or friendly messages.
                </InfoMessage>
                <AdminNotices />
              </>
            ),
          },
          {
            name: 'comments',
            label: 'Comments',
            contents: <AdminComments />,
          },
          {
            name: 'queue',
            label: 'Queues',
            contents: (
              <>
                <InfoMessage title="How Queues Work" hideId="queues-info">
                  The site talks to many 3rd parties. Do track all of this back
                  and forth, we use a queue mechanism. Each 3rd party service
                  has its own queue - shown here.
                </InfoMessage>
                <Queue />
              </>
            ),
          },
          {
            name: 'audit',
            label: 'Audit',
            contents: (
              <>
                <InfoMessage
                  title="How Auditing Works"
                  hideId="admin-audit-info">
                  Auditing is using the auto-sync functionality to check if the
                  source for an asset is still available. It happens every 5
                  minutes for 1 asset that either has never been audited or is
                  the oldest.
                </InfoMessage>
                <AdminAudit />
              </>
            ),
          },
          {
            name: 'dupes',
            label: 'Dupes',
            contents: (
              <>
                <InfoMessage title="How Dupes Work" hideId="admin-dupes-info">
                  An interface for deleting duplicate authors while copying
                  their data and switching the assets to the "main" author.
                  <br />
                  <br />
                  Note you get a chance to "plan" what the site will do but any
                  change you do is somewhat permanent.
                </InfoMessage>
                <AdminDupes />
              </>
            ),
          },
          {
            name: 'reputation',
            label: 'Reputation',
            contents: (
              <>
                <InfoMessage
                  title="How Reputation Works"
                  hideId="admin-rep-info">
                  Users gain reputation from performing actions on the site:
                  creating assets, amendments, comments, having an old account,
                  etc.
                </InfoMessage>
                <AdminReputation />
              </>
            ),
          },
          {
            name: 'analytics',
            label: 'Analytics',
            contents: (
              <>
                <InfoMessage
                  title="How Analytics Works"
                  hideId="admin-analytics-info">
                  <p>
                    I use Google Analytics for tracking visitors to the site.
                  </p>
                  <p>
                    I also track whenever a user clicks the "Visit Source"
                    button of an asset (since Nov 2021).
                  </p>
                </InfoMessage>
                <Analytics />
              </>
            ),
          },
        ]}
      />
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>Admin Area</title>
      <meta name="description" content="Top secret" />
    </Helmet>
    <View />
  </>
)
