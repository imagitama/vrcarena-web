import React from 'react'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'
import EditIcon from '@material-ui/icons/Edit'
import CommentIcon from '@material-ui/icons/Comment'

import {
  CollectionNames,
  UserFieldNames,
  SpeciesFieldNames,
  UserMetaFieldNames,
  BanStatuses,
} from '../../hooks/useDatabaseQuery'
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
import Award from '../award'
import StaffBadge from '../staff-badge'
import { getUserIsStaffMember } from '../../utils/users'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import FormattedDate from '../formatted-date'

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

const UserControls = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.controls}>{children}</div>
}

const Awards = ({ userId }) => {
  const [isLoading, isErrored, result] = useDataStoreItem(
    CollectionNames.AwardsForUsers,
    userId,
    'user-overview'
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load awards</ErrorMessage>
  }

  if (!result) {
    return null
  }

  return (
    <div className={classes.awards}>
      {result.awards.map((awardId) => (
        <Award key={awardId} awardId={awardId} />
      ))}
    </div>
  )
}

const GetFullUsersFieldNames = {
  favoriteSpeciesData: 'favoritespeciesdata',
}

export default ({ userId }) => {
  const [, , currentUser] = useUserRecord()
  const [isLoadingUser, isErroredLoadingUser, user] = useDataStoreItem(
    'getFullUsers',
    userId,
    'user-overview'
  )
  const classes = useStyles()
  const isEditor = useIsEditor()

  if (isLoadingUser) {
    return <LoadingIndicator message="Loading user profile..." />
  }

  if (isErroredLoadingUser || !user) {
    return <ErrorMessage>Failed to load their account</ErrorMessage>
  }

  const {
    [UserFieldNames.vrchatUserId]: vrchatUserId,
    [UserFieldNames.vrchatUsername]: vrchatUsername,
    [UserFieldNames.discordUsername]: discordUsername,
    [UserFieldNames.twitterUsername]: twitterUsername,
    [UserFieldNames.telegramUsername]: telegramUsername,
    [UserFieldNames.youtubeChannelId]: youtubeChannelId,
    [UserFieldNames.twitchUsername]: twitchUsername,
    [UserFieldNames.bio]: bio,
    [UserFieldNames.patreonUsername]: patreonUsername,
    [UserFieldNames.neosVrUsername]: neosVrUsername,
    [UserFieldNames.chilloutVrUsername]: chilloutVrUsername,
    [UserFieldNames.username]: username,
    [GetFullUsersFieldNames.favoriteSpeciesData]: favoriteSpeciesData,

    // TODO: Get this working again as this data is no longer provided
    [UserMetaFieldNames.banStatus]: banStatus,
  } = user

  const isBanned = banStatus === BanStatuses.Banned

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
        <Avatar
          username={user.username}
          url={
            user && user[UserFieldNames.avatarUrl]
              ? user[UserFieldNames.avatarUrl]
              : null
          }
        />
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
          <Awards userId={userId} />
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
        {canEditUsers(currentUser) && (
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
                  favoriteSpeciesData[SpeciesFieldNames.thumbnailUrl]
                )}
                alt="Favorite species icon"
              />
              {favoriteSpeciesData[SpeciesFieldNames.pluralName]}
            </Link>
          </div>
        )}
        <Tabs
          items={[
            {
              name: 'comments',
              label: 'Comments',
              contents: <TabComments />,
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
