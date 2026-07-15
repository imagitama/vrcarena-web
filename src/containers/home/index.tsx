import React, { useState } from 'react'
import { Helmet } from '@unhead/react/helmet'
import { makeStyles } from '@mui/styles'
import styled from '@emotion/styled'

import useSearchTerm from '@/hooks/useSearchTerm'
import useGlobalState from '@/hooks/useGlobalState'

import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
} from '@/media-queries'
import * as routes from '@/routes'
import {
  CONTENT_MAX_WIDTH_PX,
  DISCORD_URL,
  PATREON_BECOME_PATRON_URL,
} from '@/config'
import categoryMetas from '@/category-meta'
import { getUserFriendlyNumber } from '@/utils/formatting'

import AssetResults from '@/components/asset-results'
import DiscordMessageResult from '@/components/discord-message-result'
import Block from '@/components/block'
import ErrorMessage from '@/components/error-message'
import SpeciesBrowser from '@/components/species-browser'
import LazyLoad from '@/components/lazy-load'
import { GoToButton } from '@/components/button'
import ErrorBoundary from '@/components/error-boundary'
import ExpandIcon from '@/components/expand-icon'
import LoadingShimmer from '@/components/loading-shimmer'
import { StatsForHomepage } from '@/slices/globalState'

const useStyles = makeStyles({
  root: {},
  tileContent: {
    padding: '0.5rem',
    borderRadius: '0.5rem',
    background: 'rgba(0,0,0,0.1)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    [mediaQueryForMobiles]: {
      padding: '0.25rem',
    },
  },
  children: {
    marginTop: '0.5rem',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [mediaQueryForMobiles]: {
      marginTop: '0.25rem',
    },
  },
  tileCols: {
    display: 'flex',
    '& > *': {
      width: '100%',
    },
  },
  controls: {
    width: '100%',
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'right',
  },
})

const TilesRoot = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: calc(${CONTENT_MAX_WIDTH_PX}px + 1rem);
  margin: 0 auto 1rem;
`

const TileRoot = styled.div`
  width: 33.3%;
  padding: 0.5rem;
  ${mediaQueryForTabletsOrBelow} {
    width: 50%;
    padding: 0.25rem;
  }
  ${mediaQueryForMobiles} {
    width: 100%;
  }
`

const StatNum = styled.span`
  font-size: 125%;
  font-weight: 100;
`

const TileHeading = styled.div`
  font-size: 125%;
  font-weight: 100;
`

const Tile = ({
  title,
  url,
  buttonLabel,
  children,
}: {
  title: string | React.ReactElement
  url?: string
  buttonLabel?: string
  children: React.ReactNode
}) => {
  const classes = useStyles()
  return (
    <TileRoot>
      <div className={classes.tileContent}>
        <TileHeading>{title}</TileHeading>
        <div className={classes.children}>{children}</div>
        {buttonLabel && url ? (
          <div className={classes.controls}>
            <GoToButton url={url} size="small">
              {buttonLabel}
            </GoToButton>
          </div>
        ) : null}
      </div>
    </TileRoot>
  )
}

const LoadingTile = () => (
  <Tile title={<LoadingShimmer width="100%" height="10px" />}>
    <div style={{ width: '100%' }}>
      <LoadingShimmer width="100%" height="15px" />
      <LoadingShimmer width="100%" height="15px" />
    </div>
  </Tile>
)

const StatRow = styled.div`
  ${({ indent }: { indent?: boolean }) => (indent ? `margin-left: 1rem;` : '')}
`

const Stats = ({ stats }: { stats: StatsForHomepage }) => {
  const [isAssetsExpanded, setIsAssetsExpanded] = useState(false)
  return (
    <div>
      <StatRow>
        <StatNum>{getUserFriendlyNumber(stats.assets.totalcount)}</StatNum>{' '}
        assets ({stats.assets.freecount} free){' '}
        <ExpandIcon
          isExpanded={isAssetsExpanded}
          onClick={() => setIsAssetsExpanded(!isAssetsExpanded)}
        />
      </StatRow>
      {isAssetsExpanded && (
        <small>
          {Object.entries(stats.assets.categories).map(([cat, count]) => (
            <StatRow indent key={cat}>
              <StatNum>{getUserFriendlyNumber(count)}</StatNum>{' '}
              {categoryMetas[cat].name}
            </StatRow>
          ))}
        </small>
      )}
      <StatRow>
        <StatNum>{getUserFriendlyNumber(stats.users.count)}</StatNum> users
      </StatRow>
      <StatRow>
        <StatNum>{getUserFriendlyNumber(stats.collections.count)}</StatNum>{' '}
        collections
      </StatRow>
      <StatRow>
        <StatNum>{getUserFriendlyNumber(stats.wishlists.count)}</StatNum>{' '}
        wishlists
      </StatRow>
      <StatRow>
        <StatNum>{getUserFriendlyNumber(stats.reviews.count)}</StatNum> reviews
      </StatRow>
      <StatRow>
        <StatNum>{getUserFriendlyNumber(stats.species.speciescount)}</StatNum>{' '}
        species
      </StatRow>
    </div>
  )
}

const Tiles = () => {
  const [isLoading, lastErrorCode, globalState] = useGlobalState()

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load homepage content (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (isLoading || !globalState) {
    return (
      <TilesRoot>
        <LoadingTile />
        <LoadingTile />
        <LoadingTile />
      </TilesRoot>
    )
  }

  const {
    home: { stats, recentdiscordannouncement: recentDiscordAnnouncement },
  } = globalState

  return (
    <ErrorBoundary>
      <TilesRoot>
        <Tile title="Stats" url={routes.stats} buttonLabel="More Stats">
          <Stats stats={stats} />
        </Tile>
        <Tile title="Discord" url={DISCORD_URL} buttonLabel="Join Discord">
          {recentDiscordAnnouncement ? (
            <DiscordMessageResult message={recentDiscordAnnouncement} trim />
          ) : null}
        </Tile>
        <Tile
          title="Patreon"
          url={PATREON_BECOME_PATRON_URL}
          buttonLabel="Go To Patreon">
          <div>
            <StatRow>
              <StatNum>
                {getUserFriendlyNumber(stats.patreon.activepatroncount)}
              </StatNum>{' '}
              active patrons
            </StatRow>
            <StatRow>
              <StatNum>
                {getUserFriendlyNumber(stats.patreon.totalpatroncount)}
              </StatNum>{' '}
              patrons over lifetime
            </StatRow>
          </div>
        </Tile>
      </TilesRoot>
    </ErrorBoundary>
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
        <Tiles />
        <LazyLoad>
          <SpeciesBrowser />
        </LazyLoad>
      </div>
    </>
  )
}
