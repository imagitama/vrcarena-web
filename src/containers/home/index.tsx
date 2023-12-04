import React from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { Link } from 'react-router-dom'

import useSearchTerm from '../../hooks/useSearchTerm'
import useSupabaseView from '../../hooks/useSupabaseView'
import { AssetCategories } from '../../hooks/useDatabaseQuery'

import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
} from '../../media-queries'
import * as routes from '../../routes'
import { trimDescription } from '../../utils/formatting'
import {
  DISCORD_URL,
  PATREON_BECOME_PATRON_URL,
  TWITTER_URL,
} from '../../config'
import { freeAvatars, getPathForQueryString, questAvatars } from '../../queries'
import { Asset } from '../../modules/assets'

import Button from '../../components/button'
import PedestalVideo from '../../components/pedestal-video'

import avatarsImageUrl from './assets/avatars.webp'
import accessoriesImageUrl from './assets/accessories.webp'
import discordImageUrl from './assets/discord.webp'
import patreonImageUrl from './assets/patreon.webp'
import oculusImageUrl from './assets/oculus.webp'
import freeImageUrl from './assets/free.webp'
import MostRecentDiscordAnnouncement from './components/most-recent-discord-announcement'
import PatreonCosts from './components/patreon-costs'
import RecentActivity from './components/recent-activity'
import RecentSocialPosts from './components/recent-social-posts'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import CreateSocialPostForm from '../../components/create-social-post-form'
import EditorTeam from './components/editor-team'
import { SocialFeed } from '../social'

const useStyles = makeStyles({
  root: {
    padding: '2rem 0',
    [mediaQueryForMobiles]: {
      padding: '1rem 0',
    },
  },
  contentBlock: {
    fontWeight: 200, // 100 for message titles, 400 for body
    width: 'calc(100% - 2rem)',
    padding: '2rem 0.5rem',
    borderRadius: '0.5rem',
    background: '#202020',
    fontSize: '120%',
    margin: '0 auto',
    '& p:first-of-type': {
      marginTop: 0,
    },
    '& p:last-of-type': {
      marginBottom: 0,
    },
    '& > div': {
      maxWidth: '900px',
      margin: '0 auto',
    },
    '& $controls': {
      marginTop: '2rem',
    },
    [mediaQueryForMobiles]: {
      padding: '1rem',
      '& $controls': {
        marginTop: '1rem',
      },
    },
  },
  tiles: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'stretch',
    padding: '0.5rem',
  },
  tile: {
    fontWeight: 200, // 100 for message titles, 400 for body
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0.5rem',
    width: '33.3%',
    [mediaQueryForTabletsOrBelow]: {
      width: '50%',
    },
    [mediaQueryForMobiles]: {
      width: '100%',
    },
    '& > a': {
      width: '100%',
      height: '100%',
      color: 'inherit',
    },
    '& $controls': {
      position: 'absolute',
      padding: '2rem',
      bottom: 0,
      right: 0,
      [mediaQueryForMobiles]: {
        padding: '1rem',
      },
    },
  },
  title: {
    fontSize: '150%',
    textShadow: '1px 1px 1px #000',
    marginBottom: '1rem',
  },
  contents: {
    width: '100%',
    minHeight: '200px',
    height: '100%',
    borderRadius: '0.5rem',
    transition: 'all 100ms',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: '2rem 2rem 6rem 2rem',
    [mediaQueryForMobiles]: {
      padding: '1rem 1rem 4rem 1rem',
    },
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      '& $bg': {
        opacity: 0.15,
      },
      '& $mainImage': {
        transform: 'scale(1.1)',
      },
    },
    position: 'relative',
  },
  mainImage: {
    width: '6rem',
    height: '16rem',
    position: 'absolute',
    top: '-5%',
    left: '2rem',
    transition: 'all 100ms',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
  },
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'all 100ms',
    opacity: 0.1,
    zIndex: -5,
  },
  controls: {
    width: '100%',
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'right',
  },
  createSocialPostForm: {
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const ActualLink = ({
  url,
  children,
}: {
  url?: string
  children: React.ReactNode
}) =>
  url ? (
    url.includes('http') ? (
      <a href={url}>{children}</a>
    ) : (
      <Link to={url}>{children}</Link>
    )
  ) : (
    <>{children}</>
  )

const Tile = ({
  title,
  mainImageUrl,
  url,
  buttonUrl,
  buttonLabel,
  children,
  backgroundImageUrl = '',
  background = undefined,
}: {
  title: string
  url?: string
  buttonUrl?: string
  buttonLabel: string
  children: React.ReactNode
  mainImageUrl?: string
  backgroundImageUrl?: string
  background?: React.ReactNode
}) => {
  const classes = useStyles()
  return (
    <div className={classes.tile}>
      <ActualLink url={url}>
        <div className={classes.contents}>
          {mainImageUrl ? (
            <div
              className={classes.mainImage}
              style={{ backgroundImage: `url(${mainImageUrl})` }}
            />
          ) : null}
          {title ? <div className={classes.title}>{title}</div> : null}
          {children}
          <div className={classes.controls}>
            <Button url={buttonUrl || url} icon={<ChevronRightIcon />}>
              {buttonLabel}
            </Button>
          </div>
          {backgroundImageUrl ? (
            <div
              className={classes.bg}
              style={{ backgroundImage: `url(${backgroundImageUrl})` }}
            />
          ) : null}
          {background ? <div className={classes.bg}>{background}</div> : null}
        </div>
      </ActualLink>
    </div>
  )
}

const LoadingTile = ({ buttonLabel }: { buttonLabel: string }) => {
  const classes = useStyles()
  return (
    <div className={classes.tile}>
      <div className={classes.contents}>
        <div className={classes.controls}>
          <Button isLoading>{buttonLabel}</Button>
        </div>
      </div>
    </div>
  )
}

const useFeaturedAssetStyles = makeStyles({
  pedestalVideo: {
    height: '100%',
    transform: 'translateY(-25%)',
    '& > div': {
      height: '150%',
    },
  },
  newIndicator: {
    backgroundColor: 'rgb(255, 0, 0)',
    color: '#FFF',
    borderRadius: '1rem',
    position: 'absolute',
    top: 0,
    left: 0,
    padding: '0.25rem 1rem',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    transform: 'translate(-50%, -50%)',
    cursor: 'default',
    fontSize: '150%',
  },
})

const FeaturedAssetTile = () => {
  const [, , results] = useSupabaseView<Asset[]>(
    'getFeaturedAsset',
    null,
    'featured-asset'
  )
  const classes = useFeaturedAssetStyles()

  if (results === null || !results.length) {
    return <LoadingTile buttonLabel="View Featured Asset" />
  }

  const asset = results[0]

  const {
    title,
    description,
    shortdescription: shortDescription,
    thumbnailurl: thumbnailUrl,
    pedestalvideourl: pedestalVideoUrl,
    pedestalfallbackimageurl: pedestalFallbackImageUrl,
  } = asset

  return (
    <Tile
      title={title}
      url={routes.viewAssetWithVar.replace(':assetId', asset.slug || asset.id)}
      buttonLabel="View Featured Asset"
      backgroundImageUrl={pedestalVideoUrl ? undefined : thumbnailUrl}
      background={
        pedestalVideoUrl ? (
          <div className={classes.pedestalVideo}>
            <PedestalVideo
              videoUrl={pedestalVideoUrl}
              fallbackImageUrl={pedestalFallbackImageUrl}
              noShadow
            />
          </div>
        ) : undefined
      }>
      {trimDescription(shortDescription || description || '')}
    </Tile>
  )
}

const ContentBlock = ({
  buttonUrl,
  buttonLabel,
  children,
}: {
  buttonUrl: string
  buttonLabel: string
  children: React.ReactNode
}) => {
  const classes = useStyles()
  return (
    <div className={classes.contentBlock}>
      <div>
        {children}
        <div className={classes.controls}>
          <Button url={buttonUrl} icon={<ChevronRightIcon />} color="default">
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default () => {
  const classes = useStyles()
  const searchTerm = useSearchTerm()
  const isLoggedIn = useIsLoggedIn()

  if (searchTerm) {
    return null
  }

  return (
    <>
      <Helmet>
        <title>
          Browse avatars, accessories, shaders and more for games VR games like
          VRChat | VRCArena
        </title>
        <meta
          name="description"
          content="A website that has info about avatars, accessories, tutorials and tools for VR games like VRChat."
        />
      </Helmet>
      <div className={classes.root}>
        {/* {isLoggedIn && (
          <div className={classes.createSocialPostForm}>
            <CreateSocialPostForm />
          </div>
        )} */}
        <ContentBlock buttonUrl={routes.about} buttonLabel="Learn More">
          <p>
            Browse our catalogue of avatars, accessories, tutorials, shaders,
            retextures, tools of VR social games like VRChat, ChilloutVR and
            NeosVR.
          </p>
          <p>
            We are a 100% volunteer team that depends on our community for
            funding and to keep our catalogue up-to-date.
          </p>
          <EditorTeam />
        </ContentBlock>
        <br />
        <div style={{ padding: '0.5rem' }}>
          <SocialFeed />
        </div>
        {/* <div className={classes.tiles}>
          <Tile
            title="Avatars"
            url={routes.viewAvatars}
            buttonLabel="Browse Avatars"
            backgroundImageUrl={avatarsImageUrl}>
            We have catalogued over 600 avatars ranging from canines, dragons,
            anime, memes and more. Find the avatar that best represents you and
            follow the links to the product page.
          </Tile>
          <Tile
            title="Accessories"
            url={routes.viewCategoryWithVar.replace(
              ':categoryName',
              AssetCategories.accessory
            )}
            buttonLabel="Browse Accessories"
            backgroundImageUrl={accessoriesImageUrl}>
            Avatar bases look great but you can really add to your avatar will
            accessories such as hair and clothing. We have catalogued as many
            accessories as we could find into what part of the body they are
            for.
          </Tile>
          <FeaturedAssetTile />
          <Tile
            title="Quest Avatars"
            url={getPathForQueryString(questAvatars)}
            buttonLabel="Find Quest avatars"
            backgroundImageUrl={oculusImageUrl}>
            Using tags you can narrow down your search for Quest-compatible
            avatars.
          </Tile>
          <Tile
            title="Free Avatars"
            url={getPathForQueryString(freeAvatars)}
            buttonLabel="Find free avatars"
            backgroundImageUrl={freeImageUrl}>
            On a budget? Using tags you can find any avatar labelled as "free".
          </Tile>
          <Tile
            title=""
            url={DISCORD_URL}
            buttonLabel="Join Discord"
            backgroundImageUrl={discordImageUrl}>
            <MostRecentDiscordAnnouncement />
          </Tile>
          <Tile
            title="Patreon"
            url={PATREON_BECOME_PATRON_URL}
            buttonLabel="Become Patron"
            backgroundImageUrl={patreonImageUrl}>
            We need your help with running the site. Any costs not covered by
            Patreon come out of the pocket of our staff.
            <br />
            <PatreonCosts />
          </Tile>
          <Tile
            title="Recent Activity"
            url={routes.activity}
            buttonLabel="View All">
            <RecentActivity />
          </Tile>
          <Tile title="Social" url={routes.social} buttonLabel="View All">
            <RecentSocialPosts />
          </Tile> */}
        {/* </div> */}
      </div>
    </>
  )
}
