import React from 'react'
import Link from '../../components/link'
import { makeStyles } from '@mui/styles'
import EditIcon from '@mui/icons-material/Edit'
import CommentIcon from '@mui/icons-material/Comment'
import * as routes from '../../routes'
import {
  fixAccessingImagesUsingToken,
  getPrefersBritishSpelling,
} from '../../utils'

import ErrorMessage from '../error-message'
import Heading from '../heading'
import SocialMediaList from '../social-media-list'
import Button from '../button'
import Avatar, { AvatarSize } from '../avatar'
import Markdown from '../markdown'
import StaffBadge from '../staff-badge'
import { getIsUserBanned, getUserIsStaffMember } from '../../utils/users'

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
import { BanStatus, FullUser } from '../../modules/users'
import { AccessStatus } from '../../modules/common'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
} from '../../media-queries'
import Tooltip from '../tooltip'
import Image from '../image'
import { VRCArenaTheme } from '../../themes'
import ViewControls from '../view-controls'
import BannedBadge from '../banned-badge'
import DeletedBadge from '../deleted-badge'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  cols: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  col: {
    width: 'calc(50% - 0.5rem)',
    margin: '0 0.5rem 0 0',
    '&:last-child': {
      margin: '0 0 0 0.5rem',
    },
    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
    },
  },
  title: {
    textAlign: 'center',
    '& h1': {
      marginTop: '1rem !important',
      [mediaQueryForTabletsOrBelow]: {
        marginTop: '0.5rem',
      },
    },
  },
  avatar: {
    display: 'flex',
    justifyContent: 'center',
  },
  username: {
    marginTop: '1rem',
    [mediaQueryForTabletsOrBelow]: {
      marginTop: '0.5rem',
    },
  },
  bio: {
    marginTop: '1rem',
    borderRadius: theme.shape.borderRadius,
    padding: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    fontSize: '125%',
    '& img': {
      maxWidth: '100%',
    },
    [mediaQueryForTabletsOrBelow]: {},
    [mediaQueryForMobiles]: {
      marginTop: '0.5rem',
      fontSize: '100%',
    },
  },
  isUnallowed: {
    textDecoration: 'line-through',
  },
  favoriteSpecies: {
    marginTop: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '150%',
    '& span': {
      marginRight: '1rem',
    },
    '& img': {
      width: '100px',
    },
    [mediaQueryForTabletsOrBelow]: {
      marginTop: '0.5rem',
    },
  },
  badge: {
    marginLeft: '0.5rem',
  },
  socialMediaList: {
    marginTop: '1rem',
    [mediaQueryForTabletsOrBelow]: {
      marginTop: '0.5rem',
    },
  },
}))

const UserOverview = ({
  user,
  small = false,
}: {
  user: FullUser
  small?: boolean
}) => {
  const classes = useStyles()
  const isEditor = useIsEditor()

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
    banstatus: banStatus,
    accessstatus: accessStatus,
  } = user

  const isBanned = banStatus === BanStatus.Banned
  const isDeleted = accessStatus === AccessStatus.Deleted

  if (!username) {
    return <ErrorMessage>User does not appear to exist</ErrorMessage>
  }

  return (
    <>
      <Context.Provider value={{ userId: user.id, user }}>
        <div className={classes.cols}>
          <div className={classes.col}>
            <div className={classes.title}>
              <div className={classes.avatar}>
                <Avatar
                  username={username}
                  url={avatarurl}
                  lazy={false}
                  size={AvatarSize.Large}
                />
              </div>
              <Heading
                variant="h1"
                className={`${classes.username} ${
                  isBanned || isDeleted ? classes.isUnallowed : ''
                }`}
                noMargin>
                <Link
                  to={routes.viewUserWithVar.replace(':userId', user.id)}
                  title={
                    isBanned
                      ? 'User has been banned.'
                      : isDeleted
                      ? 'User has been deleted.'
                      : ''
                  }>
                  {username}
                </Link>{' '}
                {getUserIsStaffMember(user) && (
                  <StaffBadge className={classes.badge} />
                )}
                {getIsUserBanned(user) && (
                  <BannedBadge className={classes.badge} />
                )}
                {isDeleted && <DeletedBadge className={classes.badge} />}
              </Heading>
            </div>
            {favoriteSpeciesData && (
              <div className={classes.favoriteSpecies}>
                <span>
                  Favo{getPrefersBritishSpelling() ? 'u' : ''}rite Species:
                </span>
                <Tooltip title={favoriteSpeciesData.pluralname}>
                  <Link
                    to={routes.viewSpeciesWithVar.replace(
                      ':speciesIdOrSlug',
                      favoriteSpeciesData.id
                    )}>
                    <Image
                      src={fixAccessingImagesUsingToken(
                        favoriteSpeciesData.thumbnailurl
                      )}
                      alt={`Image for species ${favoriteSpeciesData.pluralname}`}
                      title={favoriteSpeciesData.pluralname}
                    />
                  </Link>
                </Tooltip>
              </div>
            )}
            {bio && <Markdown source={bio} className={classes.bio} />}
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
              className={classes.socialMediaList}
            />
          </div>
          {!small && (
            <div className={classes.col}>
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
                  user.id
                )}
                horizontal
              />
            </div>
          )}
        </div>
        {isEditor && (
          <ViewControls>
            <Button
              icon={<EditIcon />}
              url={routes.editUserWithVar.replace(':userId', user.id)}>
              Edit User
            </Button>{' '}
            <Button
              icon={<CommentIcon />}
              url={`${routes.adminWithTabNameVar.replace(
                ':tabName',
                'users'
              )}?userId=${user.id}`}>
              View Comments
            </Button>
          </ViewControls>
        )}
      </Context.Provider>
    </>
  )
}

export default UserOverview
