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

import useUserRecord from '../../hooks/useUserRecord'
import * as routes from '../../routes'

import { UserRoles } from '../../modules/users'
import Link from '../../components/link'
import AdminAssetSyncQueue from './components/asset-queue'

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
                <Heading variant="h2">Assets</Heading>
                <AdminAssets />
              </>
            ),
          },
          {
            name: 'amendments',
            label: 'Amendments',
            contents: (
              <>
                <Heading variant="h2">Amendments</Heading>
                <p>
                  Any logged in user can "amend" or edit any asset/author/etc.
                  This is because we want to be like a wiki where anyone can
                  change anything to keep our content "fresh" and current.
                </p>
                <p />
                <p>
                  <strong>Note: </strong> The diff may show a field has
                  unchanged. This is probably because the field has already been
                  changed.
                </p>
                <div style={{ maxWidth: '100vw' }}>
                  <AdminAmendments />
                </div>
              </>
            ),
          },
          {
            name: 'history',
            label: 'History',
            contents: (
              <>
                <Heading variant="h2">History</Heading>
                <History />
              </>
            ),
          },
          {
            name: 'reports',
            label: 'Reports',
            contents: (
              <>
                <Heading variant="h2">Reports</Heading>
                <p>
                  These are reports for any user-created on the site (assets,
                  comments, authors, reviews, etc.) to ensure our high quality
                  and we do not have offensive content.
                </p>
                <p>
                  When a report comes in try your best to "verify" their claim
                  and respond to it. Then change the resolution status to
                  "resolved" and put a comment as to what you did (note this is
                  visible to the reporter).
                </p>
                <p>
                  <strong>Removing assets:</strong> We have a strict{' '}
                  <Link to={routes.takedownPolicy}>Takedown Policy</Link> they
                  need to follow. 9 out of 10 times they should submit a DMCA
                  claim. Sometimes they take down the asset from their Gumroad
                  page etc. and it needs to be taken down here too.
                </p>
                <AdminReports />
              </>
            ),
          },
          {
            name: 'public-avatars',
            label: 'Public Avatars',
            contents: (
              <>
                <Heading variant="h2">Public Avatars</Heading>
                <p>
                  These are submissions by <em>anyone</em> for VRChat avatar IDs
                  for an avatar on the site. They are shown under the
                  description for the avatar.
                </p>
                <p>
                  It shows every existing submission and every new one. Pick and
                  choose what the <strong>final result</strong> will be.
                  Duplicates are greyed out.
                </p>
                <p>
                  If an avatar <em>looks</em> correct (it has a visibly similar
                  thumbnail, title and description) then just add it. If it
                  looks weird and nothing like the original avatar then uncheck
                  the box.
                </p>
                <AdminPublicAvatars />
              </>
            ),
          },
          {
            name: 'notices',
            label: 'Notices',
            contents: (
              <>
                <Heading variant="h2">Notices</Heading>
                <p>
                  These are notices shown to everyone at the top of every page.
                  Give them a unique ID so when someone hides it, their browser
                  knows which one to hide next time they visit.
                </p>
                <AdminNotices />
              </>
            ),
          },
          {
            name: 'comments',
            label: 'Comments',
            contents: (
              <>
                <Heading variant="h2">Comments</Heading>
                <AdminComments />
              </>
            ),
          },
          {
            name: 'asset-sync-queue',
            label: 'Asset Sync Queue',
            contents: <AdminAssetSyncQueue />,
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
