import React from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

import useSearchTerm from '../../hooks/useSearchTerm'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
} from '../../media-queries'
import * as routes from '../../routes'
import Button from '../../components/button'
import EditorTeam from './components/editor-team'
import useSupabaseView from '../../hooks/useSupabaseView'
import ErrorMessage from '../../components/error-message'
import { AssetCategory, FullAsset, PublicAsset } from '../../modules/assets'
import { User } from '../../modules/users'
import { FullActivityEntry } from '../../modules/activity'
import { CachedDiscordMessage } from '../../modules/discordmessagecache'
import AssetResults from '../../components/asset-results'
import ActivityResults from '../../components/activity-results'
import UserList from '../../components/user-list'
import DiscordMessageResult from '../../components/discord-message-result'
import { DISCORD_URL, PATREON_BECOME_PATRON_URL } from '../../config'
import Block from '../../components/block'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import PatreonCosts from './components/patreon-costs'
import SpeciesResultItem from '../../components/species-result-item'
import { FullSpecies } from '../../modules/species'
import LoadingIndicator from '../../components/loading-indicator'

const contentMaxWidth = '900px'

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
      maxWidth: contentMaxWidth,
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
  tile: {
    margin: '1rem 0',
  },
  tileCols: {
    margin: '1rem 0',
    padding: '0 0.5rem',
    display: 'flex',
    '& > *': {
      padding: '0 0.5rem',
    },
    '& > *:first-child': {
      width: '100%',
    },
    '& > *:last-child': {
      // width: '25%'
    },
    [mediaQueryForMobiles]: {
      flexDirection: 'column',
      padding: '0 0.25rem',
      '& > *': {
        padding: '0',
      },
    },
  },
  controls: {
    width: '100%',
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'right',
  },
  block: {
    marginBottom: 0,
  },
})

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

const Tile = ({
  title,
  url,
  buttonLabel,
  children,
}: {
  title: string
  url: string
  buttonLabel?: string
  children: React.ReactNode
}) => {
  const classes = useStyles()
  return (
    <div className={classes.tile}>
      <Block url={url} title={title} className={classes.block}>
        {children}
        {buttonLabel ? (
          <div className={classes.controls}>
            <Button
              url={url}
              icon={<ChevronRightIcon />}
              color="default"
              size="small">
              {buttonLabel}
            </Button>
          </div>
        ) : null}
      </Block>
    </div>
  )
}

const TileCols = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()
  return <div className={classes.tileCols}>{children}</div>
}

interface HomepageContent {
  recentavatars: PublicAsset[]
  recentaccessories: PublicAsset[]
  recentusers: User[]
  recentactivity: FullActivityEntry[]
  recentdiscordannouncements: CachedDiscordMessage[]
  featuredasset: FullAsset
  featuredspecies: FullSpecies
}

const Tiles = () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const [isLoading, isError, results] = useSupabaseView<HomepageContent>(
    `${isAdultContentEnabled ? '' : 'non'}adulthomepagecontent`
  )

  if (isError) {
    return <ErrorMessage>Failed to load homepage content</ErrorMessage>
  }

  const showShimmer = isLoading || !Array.isArray(results) || !results.length

  const result = showShimmer ? null : results[0]

  return (
    <TileCols>
      <div>
        <Tile
          title="Recent Avatars"
          url={routes.viewCategoryWithVar.replace(
            ':categoryName',
            AssetCategory.Avatar
          )}
          buttonLabel="Browse Avatars">
          <AssetResults
            assets={result?.recentavatars}
            shimmer={showShimmer}
            shimmerCount={10}
          />
        </Tile>
        <Tile
          title="Recent Accessories"
          url={routes.viewCategoryWithVar.replace(
            ':categoryName',
            AssetCategory.Accessory
          )}
          buttonLabel="Browse Accessories">
          <AssetResults
            assets={result?.recentaccessories}
            shimmer={showShimmer}
            shimmerCount={10}
          />
        </Tile>
        <Tile
          title="Recent Sign-ups"
          url={routes.users}
          buttonLabel="Browse Users">
          <UserList users={result?.recentusers} />
        </Tile>
        <Tile
          title="Discord Announcement"
          url={DISCORD_URL}
          buttonLabel="Join Discord">
          {result ? (
            result.recentdiscordannouncements.length ? (
              <DiscordMessageResult
                message={result.recentdiscordannouncements[0]}
              />
            ) : (
              <ErrorMessage>No Discord messages found</ErrorMessage>
            )
          ) : (
            <LoadingIndicator message="Loading..." />
          )}
        </Tile>
        <Tile
          title="Recent Activity"
          url={routes.activity}
          buttonLabel="View Activity">
          {result ? (
            <ActivityResults activityEntries={result.recentactivity} />
          ) : (
            <LoadingIndicator message="Loading..." />
          )}
        </Tile>
      </div>
      <div>
        <Tile
          title="Species Of The Day"
          url={routes.viewAllSpecies}
          buttonLabel="Browse Species">
          {result ? (
            <SpeciesResultItem speciesItem={result?.featuredspecies} />
          ) : (
            <LoadingIndicator message="Loading..." />
          )}
        </Tile>
        <Tile
          title="Featured Asset"
          url={
            result?.featuredasset
              ? routes.viewAssetWithVar.replace(
                  ':assetId',
                  result.featuredasset.id
                )
              : ''
          }>
          <AssetResults
            assets={result?.featuredasset ? [result.featuredasset] : undefined}
            shimmer={showShimmer}
            shimmerCount={1}
          />
        </Tile>
        <Tile
          title="Patreon"
          url={PATREON_BECOME_PATRON_URL}
          buttonLabel="Become Patron">
          <PatreonCosts />
        </Tile>
      </div>
    </TileCols>
  )
}

export default () => {
  const classes = useStyles()
  const searchTerm = useSearchTerm()

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
        <ContentBlock buttonUrl={routes.about} buttonLabel="Learn More">
          <p>
            A free, community-driven, wiki-style collection of VR avatars,
            accessories, retextures and tutorials categorized and tagged to help
            you find what you're after.
          </p>
          <p>
            We are <strong>not for profit</strong> and run entirely by our
            awesome <strong>volunteers</strong>:
          </p>
          <EditorTeam />
        </ContentBlock>
        <Tiles />
      </div>
    </>
  )
}
