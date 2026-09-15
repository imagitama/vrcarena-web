import React, { useState } from 'react'
import { Helmet } from '@unhead/react/helmet'
import { makeStyles } from '@mui/styles'
import styled from '@emotion/styled'

import useSearchTerm from '@/hooks/useSearchTerm'

import { mediaQueryForMobiles } from '@/media-queries'
import * as routes from '@/routes'
import { CONTENT_MAX_WIDTH_PX, DISCORD_URL } from '@/config'
import categoryMetas from '@/category-meta'
import { getUserFriendlyNumber } from '@/utils/formatting'

import { colorGrey } from '@/themes'
import { AssetCategory, AssetForList } from '@/modules/assets'
import { Article as ArticleIcon } from '@/icons'

import LoadingShimmer from '@/components/loading-shimmer'
import DiscordMessageResult from '@/components/discord-message-result'
import ErrorMessage from '@/components/error-message'
import Button, { GoToButton } from '@/components/button'
import ErrorBoundary from '@/components/error-boundary'
import ExpandIcon from '@/components/expand-icon'
import ArticleResults from '@/components/article-results'
import FormControls from '@/components/form-controls'
import useDataStoreItems from '@/hooks/useDataStoreItems'
import { CachedDiscordMessage } from '@/modules/discordmessagecache'
import { Species } from '@/modules/species'
import { FullArticle } from '@/modules/articles'
import { DataStoreErrorCode } from '@/data-store'
import InfoMessage from '@/components/info-message'
import AssetResults from '@/components/asset-results'
import NoResultsMessage from '@/components/no-results-message'

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

const Root = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: ${CONTENT_MAX_WIDTH_PX}px;
  margin: 0 auto 1rem;
`

const PrimaryTiles = styled.div`
  width: calc(100% + 2rem);
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
  > * {
    width: calc(33.3% - 0.33rem);
    &:nth-child(2) {
      margin: 0 0.5rem;
    }
    ${mediaQueryForMobiles} {
      width: 100%;
      &:nth-child(2) {
        margin: 0.5rem 0;
      }
    }
  }
`

const Columns = styled.div`
  display: flex;
  flex-wrap: wrap;
  ${mediaQueryForMobiles} {
    flex-direction: column;
  }
`
const ColumnLeft = styled.div`
  width: 70%;
  padding-right: 0.5rem;
  ${mediaQueryForMobiles} {
    width: 100%;
  }
`
const ColumnRight = styled.div`
  width: 30%;
  > * {
    margin-bottom: 0.5rem;
  }
  ${mediaQueryForMobiles} {
    width: 100%;
  }
`

const StyledTile = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid ${colorGrey};
  padding: 0.5rem;
`

const StatNum = styled.span`
  font-size: 125%;
  font-weight: 100;
`

const TileHeading = styled.div`
  font-size: 125%;
  font-weight: 100;
  cursor: default;
  line-height: 1.1;
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
    <StyledTile>
      <TileHeading>{title}</TileHeading>
      <div className={classes.children}>{children}</div>
      {buttonLabel && url ? (
        <div className={classes.controls}>
          <GoToButton url={url} size="small">
            {buttonLabel}
          </GoToButton>
        </div>
      ) : null}
    </StyledTile>
  )
}

const NewAssetsTileWrapper = styled.div`
  width: 100%;
  margin-bottom: 0.5rem;
`

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

enum ViewNames {
  GetHomepageContent = 'gethomepagecontent',
}

export interface StatsForHomepage {
  assets: {
    totalcount: number
    categories: {
      [AssetCategory.Avatar]: number
      [AssetCategory.Accessory]: number
      [AssetCategory.Animation]: number
      [AssetCategory.Tutorial]: number
      [AssetCategory.Shader]: number
      [AssetCategory.Retexture]: number
      [AssetCategory.WorldAsset]: number
      [AssetCategory.Tool]: number
    }
    freecount: number
  }
  collections: {
    count: number
  }
  wishlists: {
    count: number
  }
  reviews: {
    count: number
  }
  authors: {
    count: number
  }
  users: {
    count: number // unbanned and verified
  }
  patreon: {
    activepatroncount: number
    totalpatroncount: number
    nextincomecents: number
  }
  species: {
    speciescount: number
  }
  // vrchatgroup: {
  //   count: number
  // }
}

export interface HomepageContent {
  stats: StatsForHomepage
  recentdiscordannouncement: CachedDiscordMessage | null
  recentdiscordtechchanges: CachedDiscordMessage | null
  featuredspecies: Species | null
  articles: FullArticle[] | null
  newassets: AssetForList[] | null
}

const useHomepageContent = (): [
  boolean,
  DataStoreErrorCode | null,
  HomepageContent | null
] => {
  const [isLoading, lastErrorCode, homepageContentItems] =
    useDataStoreItems<HomepageContent>(ViewNames.GetHomepageContent)
  return [
    isLoading,
    lastErrorCode,
    homepageContentItems?.length ? homepageContentItems[0] : null,
  ]
}

const Tiles = () => {
  const [isLoading, lastErrorCode, homepageContent] = useHomepageContent()

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage errorCode={lastErrorCode}>
        Failed to load homepage content
      </ErrorMessage>
    )
  }

  if (isLoading || !homepageContent) {
    return (
      <>
        <LoadingTile />
        <LoadingTile />
        <LoadingTile />
      </>
    )
  }

  const {
    stats,
    recentdiscordannouncement: recentDiscordAnnouncement,
    recentdiscordtechchanges: recentDiscordTechChanges,
    articles,
    newassets,
  } = homepageContent

  return (
    <ErrorBoundary>
      <PrimaryTiles>
        <Tile
          title={`Species`}
          url={routes.viewAllSpecies}
          buttonLabel={`Browse ${stats.species.speciescount} Species`}>
          Every single avatar is categorized into their species to help you find
          the correct avatar for you.
        </Tile>
        <Tile
          title={`Avatars`}
          url={routes.viewCategoryWithVar.replace(
            ':categoryName',
            AssetCategory.Avatar
          )}
          buttonLabel={`Browse ${stats.assets.categories.avatar} Avatars`}>
          Find that one avatar that truly represents you.
        </Tile>
        <Tile
          title={`Accessories`}
          url={routes.viewCategoryWithVar.replace(
            ':categoryName',
            AssetCategory.Accessory
          )}
          buttonLabel={`Browse ${stats.assets.categories.accessory} Accessories`}>
          Accessorize your avatar with clothing, props and more.
        </Tile>
      </PrimaryTiles>
      {newassets && (
        <NewAssetsTileWrapper>
          <Tile
            title="New Assets"
            url={routes.newAssets}
            buttonLabel="Browse New Assets">
            <AssetResults assets={newassets} isTiny />
          </Tile>
        </NewAssetsTileWrapper>
      )}
      <Columns>
        <ColumnLeft>
          {articles ? (
            <ArticleResults articles={articles} trim />
          ) : (
            <NoResultsMessage>No articles found</NoResultsMessage>
          )}
          <InfoMessage>
            Do you have some interesting news about VR games, hardware, assets
            or anything else? Create an article and our staff may show it on the
            homepage.
            <FormControls>
              <Button
                url={routes.createArticle}
                size="large"
                icon={<ArticleIcon />}
                color="secondary">
                Create Article
              </Button>
            </FormControls>
          </InfoMessage>
          <FormControls>
            <Button url={routes.articles} size="large" icon={<ArticleIcon />}>
              View All Articles
            </Button>
          </FormControls>
        </ColumnLeft>
        <ColumnRight>
          <Tile title="Patreon" url={routes.patreon} buttonLabel="Learn More">
            <div>
              This site is entirely funded by our Patreon supporters. Even the
              minimum of $1 helps!
              <StatRow>
                <StatNum>$100</StatNum> goal p/m
              </StatRow>
              <StatRow>
                <StatNum>
                  ${(stats.patreon.nextincomecents / 100).toFixed(2)}
                </StatNum>{' '}
                estimated p/m
              </StatRow>
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
          <Tile title="Discord" url={DISCORD_URL} buttonLabel="Join Discord">
            <div>
              {recentDiscordAnnouncement ? (
                <DiscordMessageResult
                  message={recentDiscordAnnouncement}
                  trim
                />
              ) : null}
              {recentDiscordTechChanges ? (
                <div style={{ marginTop: '0.5rem ' }}>
                  <DiscordMessageResult
                    message={recentDiscordTechChanges}
                    trim
                  />
                </div>
              ) : null}
            </div>
          </Tile>
          <Tile title="Stats" url={routes.stats} buttonLabel="More Stats">
            <Stats stats={stats} />
          </Tile>
        </ColumnRight>
      </Columns>
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
        <Root>
          <Tiles />
        </Root>
      </div>
    </>
  )
}
