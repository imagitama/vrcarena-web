import React from 'react'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'
import { makeStyles } from '@mui/styles'
import EditIcon from '@mui/icons-material/Edit'
import CommentIcon from '@mui/icons-material/Comment'

import useUserRecord from '../../hooks/useUserRecord'

import * as routes from '../../routes'
import { fixAccessingImagesUsingToken } from '../../utils'
import { canEditUsers } from '../../permissions'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Heading from '../heading'
import SocialMediaList from '../social-media-list'
import Button from '../button'
import Avatar from '../avatar'
import Markdown from '../markdown'
import StaffBadge from '../staff-badge'
import { getUserIsStaffMember } from '../../utils/users'

import Tabs from '../tabs'

import TabComments from './components/tab-comments'
import TabCollection from './components/tab-collection'
import TabWishlist from './components/tab-wishlist'
import TabReviews from './components/tab-reviews'
import TabAssets from './components/tab-assets'
import TabAttachments from './components/tab-attachments'
import TabEndorsements from './components/tab-endorsements'
import TabHistory from './components/tab-history'

import Context from './context'
import useIsEditor from '../../hooks/useIsEditor'
import { BanStatus, FullUser, ViewNames } from '../../modules/users'
import useDataStoreItem from '../../hooks/useDataStoreItem'

const useStyles = makeStyles({
  socialMediaItem: {
    display: 'block',
    padding: '0.5rem',
  },
  notUrl: {
    cursor: 'default',
  },
  icon: {
    verticalAlign: 'middle',
    width: 'auto',
    height: '1em',
  },
  avatar: {
    width: '200px',
    height: '200px',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  username: {
    marginTop: '1rem',
    display: 'flex',
  },
  bio: {
    '& img': {
      maxWidth: '100%',
    },
  },
  isBanned: {
    textDecoration: 'line-through',
  },
  favoriteSpecies: {
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    fontSize: '125%',
    '& img': {
      width: '100px',
      marginRight: '1rem',
    },
  },
  favoriteSpeciesHeading: {
    flex: 1,
  },
  awards: {
    display: 'flex',
    marginLeft: '0.5rem',
  },
  staffBadge: {
    marginLeft: '1rem',
  },
  controls: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '0.5rem',
  },
})

const UserControls = ({ children }: { children: React.ReactChild[] }) => {
  const classes = useStyles()
  return <div className={classes.controls}>{children}</div>
}

export default ({ userId }: { userId: string }) => {
  const [, , currentUser] = useUserRecord()
  const [isLoadingUser, lastErrorCodeLoadingUser, user] =
    useDataStoreItem<FullUser>(ViewNames.GetFullUsers, userId, 'user-overview')
  const classes = useStyles()
  const isEditor = useIsEditor()

  if (isLoadingUser) {
    return <LoadingIndicator message="Loading user profile..." />
  }

  if (lastErrorCodeLoadingUser !== null) {
    return (
      <ErrorMessage>
        Failed to load their account (code {lastErrorCodeLoadingUser})
      </ErrorMessage>
    )
  }

  if (!user) {
    return (
      <ErrorMessage>Failed to load their account (invalid user)</ErrorMessage>
    )
  }

  const {
    username,
    avatarurl,
    vrchatuserid: vrchatUserId,
    vrchatusername: vrchatUsername,
    discordusername: discordUsername,
    twitterusername: twitterUsername,
    telegramusername: telegramUsername,
    youtubechannelid: youtubeChannelId,
    twitchusername: twitchUsername,
    bio,
    patreonusername: patreonUsername,
    neosvrusername: neosVrUsername,
    chilloutvrusername: chilloutVrUsername,
    favoritespeciesdata: favoriteSpeciesData,

    // TODO: Get this working again as this data is no longer provided
    banstatus: banStatus,
  } = user

  const isBanned = banStatus === BanStatus.Banned

  if (!username) {
    return <ErrorMessage>User does not appear to exist</ErrorMessage>
  }

  return (
    <>
      <Context.Provider value={{ userId, user }}>
        <Helmet>
          <title>View {username}'s profile | VRCArena</title>
          <meta
            name="description"
            content={`View the user profile of ${username}.`}
          />
        </Helmet>
        <Avatar username={username} url={avatarurl} lazy={false} noHat />
        <Heading
          variant="h1"
          className={`${classes.username} ${isBanned ? classes.isBanned : ''}`}>
          <Link to={routes.viewUserWithVar.replace(':userId', userId)}>
            {username}
          </Link>{' '}
          {getUserIsStaffMember(user) && (
            <span className={classes.staffBadge}>
              <StaffBadge />
            </span>
          )}
        </Heading>
        <SocialMediaList
          socialMedia={{
            vrchatUsername: vrchatUsername,
            neosVrUsername: neosVrUsername,
            chilloutVrUsername: chilloutVrUsername,
            vrchatUserId: vrchatUserId,
            discordUsername: discordUsername,
            twitterUsername: twitterUsername,
            telegramUsername: telegramUsername,
            youtubeChannelId: youtubeChannelId,
            twitchUsername: twitchUsername,
            patreonUsername: patreonUsername,
          }}
          actionCategory="ViewUser"
        />
        {currentUser && canEditUsers(currentUser) && (
          <UserControls>
            <Button
              icon={<EditIcon />}
              url={routes.editUserWithVar.replace(':userId', userId)}>
              Edit User
            </Button>{' '}
            <Button
              icon={<CommentIcon />}
              url={`${routes.adminWithTabNameVar.replace(
                ':tabName',
                'users'
              )}?userId=${userId}`}>
              View Comments
            </Button>
          </UserControls>
        )}
        {bio && (
          <>
            <Heading variant="h2">Bio</Heading>
            <div className={classes.bio}>
              <Markdown source={bio} />
            </div>
          </>
        )}
        {favoriteSpeciesData && (
          <div>
            <Heading variant="h2" className={classes.favoriteSpeciesHeading}>
              Favorite Species
            </Heading>
            <Link
              to={routes.viewSpeciesWithVar.replace(
                ':speciesIdOrSlug',
                favoriteSpeciesData.id
              )}
              className={classes.favoriteSpecies}>
              <img
                src={fixAccessingImagesUsingToken(
                  favoriteSpeciesData.thumbnailurl
                )}
                alt="Favorite species icon"
              />
              {favoriteSpeciesData.pluralname}
            </Link>
          </div>
        )}
        <Tabs
          items={[
            {
              name: 'comments',
              label: 'Comments',
              contents: <TabComments />,
              noLazy: true,
            },
            {
              name: 'assets',
              label: 'Assets',
              contents: <TabAssets />,
            },
            {
              name: 'collection',
              label: 'Collection',
              contents: <TabCollection />,
            },
            {
              name: 'wishlist',
              label: 'Wishlist',
              contents: <TabWishlist />,
            },
            {
              name: 'reviews',
              label: 'Reviews',
              contents: <TabReviews />,
            },
            {
              name: 'endorsements',
              label: 'Endorsements',
              contents: <TabEndorsements />,
            },
            {
              name: 'attachments',
              label: 'Attachments',
              contents: <TabAttachments />,
            },
          ].concat(
            isEditor
              ? [
                  {
                    name: 'history',
                    label: 'History',
                    contents: <TabHistory />,
                  },
                ]
              : []
          )}
          urlWithTabNameVar={routes.viewUserWithVarAndTabVar.replace(
            ':userId',
            userId
          )}
          horizontal
        />
      </Context.Provider>
    </>
  )
}
