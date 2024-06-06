import React from 'react'
import Link from '../../components/link'
import { Helmet } from 'react-helmet'

import Tabs from '../../components/tabs'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import AvatarUploadForm from '../../components/avatar-upload-form'
import UsernameEditor from '../../components/username-editor'
import AdultContentToggle from '../../components/adult-content-toggle'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import NoPermissionMessage from '../../components/no-permission-message'
import MyUploads from '../../components/my-uploads'
import SocialMediaUsernamesEditor from '../../components/social-media-usernames-editor'
import BioEditor from '../../components/bio-editor'
import MyFeaturedAssets from '../../components/my-featured-assets'
import MyAmendments from '../../components/my-amendments'
import FavoriteSpeciesEditor from '../../components/favorite-species-editor'
import NotificationSettings from '../../components/notification-settings'
import MyWishlist from '../../components/my-wishlist'
import MyCollections from '../../components/my-collections'
import MyReports from '../../components/my-reports'

import useUserRecord from '../../hooks/useUserRecord'
import useUserId from '../../hooks/useUserId'
import { UserFieldNames } from '../../hooks/useDatabaseQuery'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import PatreonConnectForm from '../../components/patreon-connect-form'
import VrPlatformChooser from '../../components/vr-platform-chooser'
import LinkAccountWithVrchatForm from '../../components/link-with-vrchat-account-form'
import TagBlacklistEditor from '../../components/tag-blacklist-editor'
import ShowMoreInfoToggle from '../../components/show-more-info-toggle'

function WelcomeMessage() {
  const [isLoading, isErrored, user] = useUserRecord()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to retrieve your account details</ErrorMessage>
  }

  if (!user) {
    return <NoPermissionMessage />
  }

  return (
    <BodyText>
      Hi,{' '}
      <Link to={routes.viewUserWithVar.replace(':userId', user.id)}>
        {user.username}
      </Link>
      !
    </BodyText>
  )
}

const analyticsCategoryName = 'MyAccount'

const View = () => {
  const userId = useUserId()
  const [, , user] = useUserRecord()

  if (!userId || !user) {
    return <NoPermissionMessage />
  }

  // if they just signed up
  if (!user.username) {
    return <LoadingIndicator message="Waiting for your profile..." />
  }

  return (
    <>
      <Heading variant="h1">Your Account</Heading>
      <WelcomeMessage />

      <Tabs
        urlWithTabNameVar={routes.myAccountWithTabNameVar}
        items={[
          {
            name: 'username',
            label: 'Username',
            contents: (
              <>
                <Heading variant="h2">Username</Heading>
                <p>
                  You can change your username as many times as you would like.
                </p>
                <UsernameEditor
                  onSaveClick={() =>
                    trackAction(analyticsCategoryName, 'Click save username')
                  }
                />
              </>
            ),
          },
          {
            name: 'avatar',
            label: 'Avatar',
            contents: (
              <>
                <Heading variant="h2">Avatar</Heading>
                <p>
                  Your avatar is shown on your profile, your comments and in
                  lists of users.
                </p>
                <AvatarUploadForm
                  onClick={() =>
                    trackAction(
                      analyticsCategoryName,
                      'Click avatar upload form'
                    )
                  }
                />
              </>
            ),
          },
          {
            name: 'profile',
            label: 'profile',
            contents: (
              <>
                <Heading variant="h2">Profile</Heading>
                <Heading variant="h3">Bio</Heading>
                <p>This bio is shown on your public user profile.</p>
                <BioEditor
                  // @ts-ignore
                  onSaveClick={() =>
                    trackAction(analyticsCategoryName, 'Click save bio button')
                  }
                />
                <Heading variant="h3">Favorite Species</Heading>
                <FavoriteSpeciesEditor
                  analyticsCategory={analyticsCategoryName}
                />
                <Heading variant="h3">VR Games</Heading>
                <VrPlatformChooser />
              </>
            ),
          },
          {
            name: 'settings',
            label: 'Settings',
            contents: (
              <>
                <Heading variant="h2">Settings</Heading>
                <div>
                  <AdultContentToggle
                    analyticsCategoryName={analyticsCategoryName}
                  />
                </div>
                <ShowMoreInfoToggle
                  analyticsCategoryName={analyticsCategoryName}
                />
                {/* <Heading variant="h2">Tag Blacklist</Heading>
                <TagBlacklistEditor /> */}
                <Heading variant="h3">Notifications</Heading>
                <NotificationSettings />
              </>
            ),
          },
          {
            name: 'social',
            label: 'Social',
            contents: (
              <>
                <Heading variant="h2">Social Media</Heading>
                <p>These are shown to everyone on your profile.</p>
                <SocialMediaUsernamesEditor
                  onSaveClick={() =>
                    trackAction(
                      analyticsCategoryName,
                      'Click save social media'
                    )
                  }
                />
              </>
            ),
          },
          {
            name: 'vrchat',
            label: 'VRChat',
            contents: (
              <>
                <Heading variant="h2">VRChat Account</Heading>
                <LinkAccountWithVrchatForm />
              </>
            ),
          },
          {
            name: 'patreon',
            label: 'Patreon',
            contents: (
              <>
                <Heading variant="h2">Patreon</Heading>
                <PatreonConnectForm />
                <Heading variant="h3">My Featured Assets</Heading>
                <MyFeaturedAssets />
              </>
            ),
          },
          {
            name: 'assets',
            label: 'My Assets',
            contents: (
              <>
                <Heading variant="h2">My Assets</Heading>
                <MyUploads />
              </>
            ),
          },
          {
            name: 'amendments',
            label: 'My Amendments',
            contents: (
              <>
                <Heading variant="h2">My Amendments</Heading>
                <MyAmendments />
              </>
            ),
          },
          {
            name: 'wishlist',
            label: 'My Wishlist',
            contents: (
              <>
                <Heading variant="h2">My Wishlist</Heading>
                <MyWishlist />
              </>
            ),
          },
          {
            name: 'collection',
            label: 'My Collections',
            contents: (
              <>
                <MyCollections />
              </>
            ),
          },
          {
            name: 'reports',
            label: 'My Reports',
            contents: (
              <>
                <Heading variant="h2">My Reports</Heading>
                <MyReports />
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
      <title>Manage your account | VRCArena</title>
      <meta
        name="description"
        content="Change your personal details and settings for your account."
      />
    </Helmet>
    <View />
  </>
)
