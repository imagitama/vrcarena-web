import React from 'react'
import Link from '@/components/link'
import makeStyles from '@mui/styles/makeStyles'
import EditIcon from '@mui/icons-material/Edit'
import CommentIcon from '@mui/icons-material/Comment'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import InfoIcon from '@mui/icons-material/Info'

import * as routes from '@/routes'
import {
  fixAccessingImagesUsingToken,
  getPrefersBritishSpelling,
} from '@/utils'
import { getIsUserBanned, getUserIsStaffMember } from '@/utils/users'
import {
  BanStatus,
  FullUser,
  FullUser_Editor,
  UserRoles,
} from '@/modules/users'
import { AccessStatus } from '@/modules/common'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
} from '@/media-queries'
import { VRCArenaTheme } from '@/themes'

import useIsEditor from '@/hooks/useIsEditor'

import Tabs from '@/components/tabs'
import ErrorMessage from '@/components/error-message'
import Heading from '@/components/heading'
import SocialMediaList from '@/components/social-media-list'
import Button from '@/components/button'
import Avatar, { AvatarSize } from '@/components/avatar'
import Markdown from '@/components/markdown'
import StaffBadge from '@/components/staff-badge'
import Tooltip from '@/components/tooltip'
import Image from '@/components/image'
import ViewControls from '@/components/view-controls'
import BannedBadge from '@/components/banned-badge'
import DeletedBadge from '@/components/deleted-badge'
import RepChangeForUser from '@/components/rep-change-for-user'
import StatusText from '@/components/status-text'
import EditorBox from '@/components/editor-box'
import FormattedDate from '@/components/formatted-date'

import Context from './context'
import TabComments from './components/tab-comments'
import TabCollection from './components/tab-collection'
import TabWishlist from './components/tab-wishlist'
import TabReviews from './components/tab-reviews'
import TabAssets from './components/tab-assets'
import TabAttachments from './components/tab-attachments'
import TabEndorsements from './components/tab-endorsements'
import TabHistory from './components/tab-history'
import useUserRecord from '@/hooks/useUserRecord'
import AwardRepButton from '../award-rep-button'
import { getScoreAsPercentage, Score } from '../ai-result'

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
  tile: {
    marginTop: '1rem',
    borderRadius: theme.shape.borderRadius,
    padding: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.25)',

    [mediaQueryForMobiles]: {
      marginTop: '0.5rem',
    },
  },
  bioTile: {
    fontSize: '125%',
    '& img': {
      maxWidth: '100%',
    },
    [mediaQueryForTabletsOrBelow]: {},
    [mediaQueryForMobiles]: {
      fontSize: '100%',
    },
  },
  isUnallowed: {
    textDecoration: 'line-through',
  },
  favoriteSpeciesTile: {
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
  repNumber: { fontSize: '200%', fontWeight: 'bold' },
  repText: {
    marginLeft: '0.25rem',
  },
  tiles: {
    display: 'flex',
    alignItems: 'center',
    [mediaQueryForMobiles]: {
      flexWrap: 'wrap',
    },
    '& > *': {
      flex: 1,
      width: 'calc(50% - 1rem)',
      [mediaQueryForMobiles]: {
        width: '100%',
      },
    },
    '& > *:first-child': {
      marginRight: '0.5rem',
      [mediaQueryForMobiles]: {
        marginRight: 0,
      },
    },
    '& > *:last-child': {
      marginLeft: '0.5rem',
      [mediaQueryForMobiles]: {
        marginLeft: 0,
      },
    },
  },
}))

const useIsAdmin = (): boolean => {
  const [, , user] = useUserRecord()
  return user ? user.role === UserRoles.Admin : false
}

const UserOverview = ({
  user,
  small = false,
}: {
  user: FullUser
  small?: boolean
}) => {
  const classes = useStyles()
  const isEditor = useIsEditor()
  const isAdmin = useIsAdmin()

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
              <>
                <Heading variant="h2">
                  Favo{getPrefersBritishSpelling() ? 'u' : ''}rite Species
                </Heading>
                <div
                  className={`${classes.tile} ${classes.favoriteSpeciesTile}`}>
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
              </>
            )}
            <Heading variant="h2">Reputation</Heading>
            <div className={classes.tile}>
              <StatusText
                positivity={user.reputation > 0 ? 1 : -1}
                className={classes.repNumber}>
                {user.reputation}
              </StatusText>{' '}
              <Tooltip
                title={
                  <>
                    Users gain rep by performing actions on the site and by
                    having an older account
                    <br />
                    <br />
                    Higher rep means you are more trustworthy so your assets,
                    amendments and other actions may be approved faster
                  </>
                }>
                <InfoIcon />
              </Tooltip>
            </div>
            {bio && (
              <>
                <Heading variant="h2">Bio</Heading>
                <Markdown
                  source={bio}
                  className={`${classes.tile} ${classes.bioTile}`}
                />
              </>
            )}
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
                        {
                          name: 'reputation',
                          label: 'Reputation',
                          contents: <RepChangeForUser userId={user.id} />,
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
            <EditorBox>
              <Heading variant="h3" noTopMargin>
                User Info
              </Heading>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Signed up</TableCell>
                    <TableCell>
                      <FormattedDate date={user.createdat} />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Reputation</TableCell>
                    <TableCell>
                      <StatusText positivity={user.reputation > 0 ? 1 : -1}>
                        {user.reputation}
                      </StatusText>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Bot Score</TableCell>
                    <TableCell>
                      {(user as unknown as FullUser_Editor).botscore !==
                      null ? (
                        <Score
                          value={
                            (user as unknown as FullUser_Editor).botscore!
                          }>
                          {getScoreAsPercentage(
                            (user as unknown as FullUser_Editor).botscore!
                          )}
                          %
                        </Score>
                      ) : (
                        '(none yet)'
                      )}
                      <Tooltip
                        title={
                          <>
                            We use AI to try and determine if a new user is a
                            bot or not to combat spam.
                            <br />
                            <br />
                            The AI gives us a score of how confident it is they
                            are a real human and not a bot.
                            <br />
                            <br />
                            See our AI policy in the footer.
                          </>
                        }>
                        <InfoIcon />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Patreon</TableCell>
                    <TableCell>
                      {user.patreonstatus || 'Not Patron'} (
                      {user.patreonrewardids?.length
                        ? user.patreonrewardids.join(',')
                        : 'no rewards'}
                      )
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>VRChat ID</TableCell>
                    <TableCell>
                      {user.linkedvrchatuserid || 'Not Linked'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Discord ID</TableCell>
                    <TableCell>{user.discorduserid || 'No ID'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Button
                icon={<EditIcon />}
                color="secondary"
                url={routes.editUserWithVar.replace(':userId', user.id)}>
                Edit User
              </Button>{' '}
              <Button
                icon={<CommentIcon />}
                color="secondary"
                url={`${routes.adminWithTabNameVar.replace(
                  ':tabName',
                  'users'
                )}?userId=${user.id}`}>
                View Comments
              </Button>{' '}
              {isAdmin && <AwardRepButton userId={user.id} />}
            </EditorBox>
          </ViewControls>
        )}
      </Context.Provider>
    </>
  )
}

export default UserOverview
