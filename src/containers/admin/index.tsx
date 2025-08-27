import React from 'react'
import { Helmet } from 'react-helmet'

import Tabs from '../../components/tabs'
import Heading from '../../components/heading'
import LoadingIndicator from '../../components/loading-indicator'
import NoPermissionMessage from '../../components/no-permission-message'
import ErrorMessage from '../../components/error-message'
import AdminAssets from '../../components/admin-assets'
import AdminAmendments from '../../components/admin-amendments'
import AdminReports from '../../components/admin-reports'
import AdminPublicAvatars from '../../components/admin-public-avatars'
import AdminNotices from '../../components/admin-notices'
import AdminComments from './components/comments'

import AdminHome from './components/home'
import History from './components/history'
import AdminSupportTickets from './components/support-tickets'

import useUserRecord from '../../hooks/useUserRecord'
import * as routes from '../../routes'

import { UserRoles } from '../../modules/users'
import Link from '../../components/link'
import AdminAssetSyncQueue from './components/asset-queue'
import AdminAudit from './components/audit'
import AdminDupes from './components/dupes'
import InfoMessage from '../../components/info-message'

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
                  Can be created via the website or our Discord.
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
            name: 'asset-sync-queue',
            label: 'Asset Sync Queue',
            contents: (
              <>
                <InfoMessage
                  title="How The Asset Sync Queue Works"
                  hideId="admin-asset-sync-queue-info">
                  Users can add a source URL to the asset queue. When they do,
                  the site automatically grabs the data from Gumroad, Booth,
                  Itch or Jinxxy and creates an asset for them.
                  <br />
                  <br />
                  Sometimes this system fails so you can see the queue here and
                  manually re-trigger the grabbing.
                </InfoMessage>
                <AdminAssetSyncQueue />
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
        ]}
      />
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>Admin Area | VRCArena</title>
      <meta name="description" content="Top secret" />
    </Helmet>
    <View />
  </>
)
